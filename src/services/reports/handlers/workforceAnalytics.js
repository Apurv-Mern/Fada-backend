const { Op } = require("sequelize");
const {
  getScopedDealerIds,
  buildAssignmentWhere,
  EmployeeAssignment,
  Employee,
  OrganizationStructure,
} = require("../queryHelpers");
const { getAdoptionPercentage } = require("../computedFields");

async function run({ scope, filters }) {
  const dealerIds = await getScopedDealerIds(scope, filters);

  const assignments = await EmployeeAssignment.findAll({
    where: {
      ...buildAssignmentWhere(scope, filters),
      ...(dealerIds.length ? { dealerId: { [Op.in]: dealerIds } } : {}),
    },
    include: [
      { model: Employee, as: "employee", required: true },
      { model: OrganizationStructure, as: "department", attributes: ["id", "name"], required: false },
      { model: OrganizationStructure, as: "designation", attributes: ["id", "name"], required: false },
    ],
  });

  const byDepartment = {};
  const byDesignation = {};
  const byEmploymentStatus = { active: 0, inactive: 0, pending: 0 };
  const fadaCoverageByDepartment = {};

  for (const assignment of assignments) {
    const dept = assignment.department?.name || "Unassigned";
    const desig = assignment.designation?.name || "Unassigned";
    byDepartment[dept] = (byDepartment[dept] || 0) + 1;
    byDesignation[desig] = (byDesignation[desig] || 0) + 1;

    if (assignment.isCurrentlyWorking) byEmploymentStatus.active += 1;
    else if (assignment.status === "pending") byEmploymentStatus.pending += 1;
    else byEmploymentStatus.inactive += 1;

    if (!fadaCoverageByDepartment[dept]) {
      fadaCoverageByDepartment[dept] = { total: 0, withFadaId: 0 };
    }
    fadaCoverageByDepartment[dept].total += 1;
    if (assignment.employee?.fadaId) fadaCoverageByDepartment[dept].withFadaId += 1;
  }

  const totalWorkforce = assignments.length;

  return {
    summary: {
      totalWorkforce,
      byDepartment: Object.entries(byDepartment).map(([department, count]) => ({
        department,
        count,
      })),
      byDesignation: Object.entries(byDesignation).map(([designation, count]) => ({
        designation,
        count,
      })),
      byEmploymentStatus,
      fadaCoverageByDepartment: Object.entries(fadaCoverageByDepartment).map(
        ([department, stats]) => ({
          department,
          total: stats.total,
          withFadaId: stats.withFadaId,
          coveragePercentage: getAdoptionPercentage(stats.withFadaId, stats.total),
        }),
      ),
    },
    rows: [],
    pagination: { total: 0, limit: filters.limit, offset: filters.offset },
  };
}

module.exports = { run };
