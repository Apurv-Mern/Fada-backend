const {
  REPORT_KEYS,
  ADMIN_ONLY_REPORTS,
  EXPORT_ROW_LIMIT,
} = require("./reportConstants");
const { buildReportMeta } = require("./reportMetaBuilder");

const handlers = {
  [REPORT_KEYS.DEALER_MASTER]: require("./handlers/dealerMaster"),
  [REPORT_KEYS.DEALER_ONBOARDING]: require("./handlers/dealerOnboarding"),
  [REPORT_KEYS.FADA_ID_GROWTH]: require("./handlers/fadaIdGrowth"),
  [REPORT_KEYS.VERIFICATION_EXCEPTIONS]: require("./handlers/verificationExceptions"),
  [REPORT_KEYS.ECOSYSTEM_HEALTH]: require("./handlers/ecosystemHealth"),
  [REPORT_KEYS.EMPLOYEE_MASTER]: require("./handlers/employeeMaster"),
  [REPORT_KEYS.ONBOARDING_VERIFICATION]: require("./handlers/onboardingVerification"),
  [REPORT_KEYS.EMPLOYEE_MOVEMENT]: require("./handlers/employeeMovement"),
  [REPORT_KEYS.WORKFORCE_ANALYTICS]: require("./handlers/workforceAnalytics"),
  [REPORT_KEYS.ADOPTION_COMPLIANCE]: require("./handlers/adoptionCompliance"),
};

function isReportAvailable(reportKey, portal) {
  if (!handlers[reportKey]) return false;
  if (portal === "dealer" && ADMIN_ONLY_REPORTS.has(reportKey)) return false;
  return true;
}

async function runReport({ reportKey, scope, filters, generatedBy, portal }) {
  if (!isReportAvailable(reportKey, portal)) {
    const error = new Error("Report not found or not available for this portal");
    error.statusCode = 404;
    throw error;
  }

  const handler = handlers[reportKey];
  const result = await handler.run({ scope, filters });

  const meta = buildReportMeta({
    reportKey,
    filters,
    generatedBy,
    portal,
  });

  return {
    meta,
    summary: result.summary,
    rows: result.rows,
    breakdowns: result.breakdowns || undefined,
    pagination: result.pagination,
  };
}

async function runReportForExport({ reportKey, scope, filters, generatedBy, portal }) {
  const exportFilters = { ...filters, limit: EXPORT_ROW_LIMIT, offset: 0 };
  const data = await runReport({
    reportKey,
    scope,
    filters: exportFilters,
    generatedBy,
    portal,
  });

  if (data.pagination?.total > EXPORT_ROW_LIMIT) {
    const error = new Error(
      `Export exceeds ${EXPORT_ROW_LIMIT} row limit. Narrow filters or use async export.`,
    );
    error.statusCode = 413;
    throw error;
  }

  return data;
}

module.exports = {
  handlers,
  isReportAvailable,
  runReport,
  runReportForExport,
  REPORT_KEYS,
};
