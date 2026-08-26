const {
  Dealer,
  DealerLocation,
  DealerProfile,
  OrganizationStructure,
} = require("../../database/models");
const { Op } = require("sequelize");
const {
  REPORT_FILTERS,
  EMPLOYEE_ONBOARDING_STAGES,
  DEALER_ONBOARDING_STAGES,
  ISSUE_TYPES,
  EVENT_TYPES,
} = require("./reportConstants");

async function getFilterOptions(reportKey, portal) {
  const [states, cities, dealers, dealerTypes, departments, designations] =
    await Promise.all([
      DealerLocation.findAll({
        attributes: [[DealerLocation.sequelize.fn("DISTINCT", DealerLocation.sequelize.col("state")), "state"]],
        raw: true,
      }),
      DealerLocation.findAll({
        attributes: [[DealerLocation.sequelize.fn("DISTINCT", DealerLocation.sequelize.col("city")), "city"]],
        raw: true,
      }),
      portal === "admin"
        ? Dealer.findAll({
            attributes: ["id", "name", "dealerCode"],
            order: [["name", "ASC"]],
            limit: 500,
          })
        : Promise.resolve([]),
      DealerProfile.findAll({
        attributes: [
          [DealerProfile.sequelize.fn("DISTINCT", DealerProfile.sequelize.col("typeOfDealership")), "typeOfDealership"],
        ],
        where: { typeOfDealership: { [Op.ne]: null } },
        raw: true,
      }),
      OrganizationStructure.findAll({
        attributes: ["id", "name"],
        where: { flag: "department" },
        order: [["name", "ASC"]],
      }),
      OrganizationStructure.findAll({
        attributes: ["id", "name", "parentId"],
        where: { flag: "role" },
        order: [["name", "ASC"]],
      }),
    ]);

  const allDealers = await Dealer.findAll({ attributes: ["brands"], limit: 500 });
  const brandSet = new Set();
  for (const dealer of allDealers) {
    const brands = Array.isArray(dealer.brands) ? dealer.brands : [];
    brands.forEach((b) => brandSet.add(b));
  }

  const allFilters = {
    states: states.map((s) => s.state).filter(Boolean),
    cities: cities.map((c) => c.city).filter(Boolean),
    dealers: dealers.map((d) => ({ id: d.id, name: d.name, dealerCode: d.dealerCode })),
    brands: [...brandSet],
    dealerTypes: dealerTypes.map((t) => t.typeOfDealership).filter(Boolean),
    dealerStatuses: ["temporary", "pending", "approved", "rejected"],
    departments: departments.map((d) => ({ id: d.id, name: d.name })),
    designations: designations.map((d) => ({
      id: d.id,
      name: d.name,
      parentId: d.parentId,
    })),
    employmentStatuses: ["active", "inactive", "pending"],
    fadaIdStatuses: ["none", "created", "active"],
    profileStatuses: ["completed", "incomplete"],
    verificationStatuses: ["pending", "verified", "rejected"],
    membershipStatuses: ["active", "pending"],
    employeeOnboardingStages: EMPLOYEE_ONBOARDING_STAGES,
    dealerOnboardingStages: DEALER_ONBOARDING_STAGES,
    issueTypes: ISSUE_TYPES,
    eventTypes: EVENT_TYPES,
    granularities: ["daily", "weekly", "monthly"],
  };

  if (!reportKey) return allFilters;

  const allowed = REPORT_FILTERS[reportKey] || [];
  const filtered = {};
  for (const key of allowed) {
    const map = {
      state: "states",
      city: "cities",
      dealerId: "dealers",
      brand: "brands",
      dealerType: "dealerTypes",
      dealerStatus: "dealerStatuses",
      departmentId: "departments",
      designationId: "designations",
      employmentStatus: "employmentStatuses",
      fadaIdStatus: "fadaIdStatuses",
      profileStatus: "profileStatuses",
      verificationStatus: "verificationStatuses",
      membershipStatus: "membershipStatuses",
      stage: reportKey.includes("dealer") ? "dealerOnboardingStages" : "employeeOnboardingStages",
      issueType: "issueTypes",
      eventType: "eventTypes",
      granularity: "granularities",
      fromDate: null,
      toDate: null,
    };
    const filterKey = map[key];
    if (filterKey && allFilters[filterKey]) {
      filtered[filterKey] = allFilters[filterKey];
    }
  }

  return filtered;
}

module.exports = { getFilterOptions };
