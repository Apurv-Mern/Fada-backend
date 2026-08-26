const { REPORT_NAMES } = require("./reportConstants");

function buildReportMeta({ reportKey, filters, generatedBy, portal }) {
  const period =
    filters.fromDate || filters.toDate
      ? {
          from: filters.fromDate || null,
          to: filters.toDate || null,
        }
      : null;

  const filtersApplied = { ...filters };
  delete filtersApplied.limit;
  delete filtersApplied.offset;
  delete filtersApplied.granularity;
  delete filtersApplied.format;

  return {
    reportKey,
    reportName: REPORT_NAMES[reportKey] || reportKey,
    portal,
    period,
    filtersApplied,
    generatedAt: new Date().toISOString(),
    generatedBy: generatedBy
      ? { id: generatedBy.id, name: generatedBy.name }
      : null,
  };
}

module.exports = { buildReportMeta };
