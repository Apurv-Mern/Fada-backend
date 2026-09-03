const { DEFAULT_LIMIT, MAX_LIMIT } = require("./reportConstants");

function parseReportFilters(query = {}) {
  const limit = Math.min(
    Math.max(parseInt(query.limit, 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );
  const offset = Math.max(parseInt(query.offset, 10) || 0, 0);

  const filters = {
    search: query.search?.trim() || null,
    fromDate: query.fromDate || null,
    toDate: query.toDate || null,
    state: query.state || null,
    city: query.city || null,
    dealerId: query.dealerId ? Number(query.dealerId) : null,
    brand: query.brand || null,
    dealerType: query.dealerType || null,
    dealerStatus: query.dealerStatus || null,
    departmentId: query.departmentId ? Number(query.departmentId) : null,
    designationId: query.designationId ? Number(query.designationId) : null,
    employmentStatus: query.employmentStatus || null,
    fadaIdStatus: query.fadaIdStatus || null,
    profileStatus: query.profileStatus || null,
    verificationStatus: query.verificationStatus || null,
    membershipStatus: query.membershipStatus || null,
    eventType: query.eventType || null,
    stage: query.stage || null,
    issueType: query.issueType || null,
    granularity: query.granularity || "monthly",
    format: query.format || "xlsx",
    drillDown:
      query.drillDown === "true" ||
      query.drillDown === "1" ||
      query.drillDown === true,
    limit,
    offset,
  };

  Object.keys(filters).forEach((key) => {
    if (filters[key] === null || filters[key] === undefined || filters[key] === "") {
      delete filters[key];
    }
  });

  return filters;
}

module.exports = { parseReportFilters };
