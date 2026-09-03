const { Op } = require("sequelize");
const {
  getScopedDealerIds,
  buildAssignmentWhere,
  buildEmployeeSearchWhere,
  EmployeeAssignment,
  Employee,
  OrganizationStructure,
} = require("../queryHelpers");
const { getAdoptionPercentage, getFadaIdStatus } = require("../computedFields");

async function run({ scope, filters }) {
  const dealerIds = await getScopedDealerIds(scope, filters);
  const employeeSearchWhere = buildEmployeeSearchWhere(filters.search);

  const assignments = await EmployeeAssignment.findAll({
    where: {
      ...buildAssignmentWhere(scope, filters),
      ...(dealerIds.length ? { dealerId: { [Op.in]: dealerIds } } : {}),
    },
    include: [
      {
        model: Employee,
        as: "employee",
        required: true,
        ...(employeeSearchWhere ? { where: employeeSearchWhere } : {}),
      },
      { model: OrganizationStructure, as: "department", attributes: ["id", "name"], required: false },
    ],
  });

  const employees = assignments.map((a) => a.employee);
  const totalPopulation = employees.length;
  const fadaIdsCreated = employees.filter((e) => e.fadaId).length;
  const profilesCompleted = employees.filter((e) => e.isProfileCompleted).length;
  const verified = employees.filter((e) => e.isVerified).length;
  const fullyActive = employees.filter(
    (e) => e.isActive && e.isVerified && e.fadaId && e.isJourneyCompleted,
  ).length;
  const pendingEmployees = employees.filter((e) => !e.isProfileCompleted).length;
  const pendingVerification = employees.filter((e) => e.isProfileCompleted && !e.isVerified).length;

  const byDepartment = {};
  for (const assignment of assignments) {
    const dept = assignment.department?.name || "Unassigned";
    if (!byDepartment[dept]) {
      byDepartment[dept] = { total: 0, withFadaId: 0, verified: 0, fullyActive: 0 };
    }
    byDepartment[dept].total += 1;
    if (assignment.employee?.fadaId) byDepartment[dept].withFadaId += 1;
    if (assignment.employee?.isVerified) byDepartment[dept].verified += 1;
    if (
      assignment.employee?.isActive &&
      assignment.employee?.isVerified &&
      assignment.employee?.fadaId
    ) {
      byDepartment[dept].fullyActive += 1;
    }
  }

  return {
    summary: {
      totalEmployeePopulation: totalPopulation,
      fadaIdsCreated,
      coveragePercentage: getAdoptionPercentage(fadaIdsCreated, totalPopulation),
      profilesCompleted,
      verified,
      fullyActiveFadaIds: fullyActive,
      pendingEmployees,
      pendingVerification,
      overallAdoptionPercentage: getAdoptionPercentage(fullyActive, totalPopulation),
      byDepartment: Object.entries(byDepartment).map(([department, stats]) => ({
        department,
        total: stats.total,
        fadaIdsCreated: stats.withFadaId,
        verified: stats.verified,
        fullyActive: stats.fullyActive,
        adoptionPercentage: getAdoptionPercentage(stats.fullyActive, stats.total),
      })),
    },
    rows: [],
    pagination: { total: 0, limit: filters.limit, offset: filters.offset },
  };
}

module.exports = { run };
