const { REPORT_KEYS } = require("../../../services/reports/reportConstants");
const {
  getReportByKey,
  exportReportByKey,
  getFilters,
  getReport,
  exportReportHandler,
} = require("../../../services/reports/reportControllerHelpers");

const PORTAL = "admin";

function bindReportHandlers(reportKey) {
  return {
    get: (req, res) => getReportByKey(req, res, PORTAL, reportKey),
    export: (req, res) => exportReportByKey(req, res, PORTAL, reportKey),
  };
}

// A1 — Company Master & Company Status
const dealerMaster = bindReportHandlers(REPORT_KEYS.DEALER_MASTER);
exports.getDealerMasterReport = dealerMaster.get;
exports.exportDealerMasterReport = dealerMaster.export;

// A2 — Company Onboarding & Activation
const dealerOnboarding = bindReportHandlers(REPORT_KEYS.DEALER_ONBOARDING);
exports.getDealerOnboardingReport = dealerOnboarding.get;
exports.exportDealerOnboardingReport = dealerOnboarding.export;

// A3 — FADA ID Registration & Growth
const fadaIdGrowth = bindReportHandlers(REPORT_KEYS.FADA_ID_GROWTH);
exports.getFadaIdGrowthReport = fadaIdGrowth.get;
exports.exportFadaIdGrowthReport = fadaIdGrowth.export;

// A4 — Verification & Exceptions
const verificationExceptions = bindReportHandlers(REPORT_KEYS.VERIFICATION_EXCEPTIONS);
exports.getVerificationExceptionsReport = verificationExceptions.get;
exports.exportVerificationExceptionsReport = verificationExceptions.export;

// A5 — Company & Workforce Health
const ecosystemHealth = bindReportHandlers(REPORT_KEYS.ECOSYSTEM_HEALTH);
exports.getEcosystemHealthReport = ecosystemHealth.get;
exports.exportEcosystemHealthReport = ecosystemHealth.export;

// D1 — Employee Master & Profile
const employeeMaster = bindReportHandlers(REPORT_KEYS.EMPLOYEE_MASTER);
exports.getEmployeeMasterReport = employeeMaster.get;
exports.exportEmployeeMasterReport = employeeMaster.export;

// D2 — FADA ID Onboarding & Verification
const onboardingVerification = bindReportHandlers(REPORT_KEYS.ONBOARDING_VERIFICATION);
exports.getOnboardingVerificationReport = onboardingVerification.get;
exports.exportOnboardingVerificationReport = onboardingVerification.export;

// D3 — Employee Movement
const employeeMovement = bindReportHandlers(REPORT_KEYS.EMPLOYEE_MOVEMENT);
exports.getEmployeeMovementReport = employeeMovement.get;
exports.exportEmployeeMovementReport = employeeMovement.export;

// D4 — Workforce & FADA ID Analytics
const workforceAnalytics = bindReportHandlers(REPORT_KEYS.WORKFORCE_ANALYTICS);
exports.getWorkforceAnalyticsReport = workforceAnalytics.get;
exports.exportWorkforceAnalyticsReport = workforceAnalytics.export;

// D5 — FADA ID Adoption & Compliance
const adoptionCompliance = bindReportHandlers(REPORT_KEYS.ADOPTION_COMPLIANCE);
exports.getAdoptionComplianceReport = adoptionCompliance.get;
exports.exportAdoptionComplianceReport = adoptionCompliance.export;

exports.getReportFilters = (req, res) => getFilters(req, res, PORTAL);

/** @deprecated Prefer dedicated report endpoints (e.g. GET /admin/reports/dealer-master) */
exports.getReport = (req, res) => getReport(req, res, PORTAL);

/** @deprecated Prefer dedicated export endpoints (e.g. GET /admin/reports/dealer-master/export) */
exports.exportReport = (req, res) => exportReportHandler(req, res, PORTAL);
