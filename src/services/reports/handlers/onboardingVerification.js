const {
  getScopedDealerIds,
  getEmployeeDocStats,
  buildAssignmentWhere,
  buildEmployeeSearchWhere,
  Employee,
  EmployeeAssignment,
  OrganizationStructure,
  Op,
} = require("../queryHelpers");
const {
  getOnboardingStage,
  getAgeingDays,
  getAgeingBucket,
  getActionRequired,
  getFadaIdStatus,
} = require("../computedFields");
const { EMPLOYEE_ONBOARDING_STAGES } = require("../reportConstants");

async function run({ scope, filters }) {
  const dealerIds = await getScopedDealerIds(scope, filters);
  if (dealerIds.length === 0) {
    return {
      summary: { totalEmployees: 0 },
      rows: [],
      pagination: { total: 0, limit: filters.limit, offset: filters.offset },
    };
  }

  const employeeSearchWhere = buildEmployeeSearchWhere(filters.search);

  const assignments = await EmployeeAssignment.findAll({
    where: {
      ...buildAssignmentWhere(scope, filters),
      dealerId: { [Op.in]: dealerIds },
    },
    include: [
      {
        model: Employee,
        as: "employee",
        required: true,
        ...(employeeSearchWhere ? { where: employeeSearchWhere } : {}),
      },
      { model: OrganizationStructure, as: "department", attributes: ["name"], required: false },
      { model: OrganizationStructure, as: "designation", attributes: ["name"], required: false },
    ],
  });

  const employeeIds = assignments.map((a) => a.employeeId);
  const docStatsMap = await getEmployeeDocStats(employeeIds);

  const allRows = assignments.map((assignment) => {
    const employee = assignment.employee;
    const docStats = docStatsMap[employee.id] || {};
    const stage = getOnboardingStage(employee, docStats);
    const pendingSince = employee.updatedAt;
    return {
      employeeId: employee.id,
      dealerId: assignment.dealerId,
      dealerName: assignment.dealer?.name || null,
      employeeName: employee.name,
      fadaId: employee.fadaId,
      department: assignment.department?.name || null,
      designation: assignment.designation?.name || null,
      currentStage: stage,
      status: employee.status,
      fadaIdStatus: getFadaIdStatus(employee),
      registrationDate: employee.createdAt,
      pendingSince,
      ageingDays: getAgeingDays(pendingSince),
      ageingBucket: getAgeingBucket(pendingSince),
      actionRequired: getActionRequired(employee, docStats),
    };
  });

  let filtered = allRows;
  if (filters.stage) {
    filtered = filtered.filter((r) => r.currentStage === filters.stage);
  }

  const summary = {
    totalEmployees: filtered.length,
    fadaIdsCreated: filtered.filter((r) => r.fadaId).length,
    profilesCompleted: filtered.filter((r) =>
      ["profile_completed", "documents_submitted", "verified", "fully_completed"].includes(r.currentStage),
    ).length,
    documentsSubmitted: filtered.filter((r) =>
      ["documents_submitted", "verified", "fully_completed"].includes(r.currentStage),
    ).length,
    verified: filtered.filter((r) => ["verified", "fully_completed"].includes(r.currentStage)).length,
    fullyCompleted: filtered.filter((r) => r.currentStage === "fully_completed").length,
    pendingEmployeeAction: filtered.filter((r) =>
      ["registered", "profile_completed"].includes(r.currentStage),
    ).length,
    pendingVerification: filtered.filter((r) => r.currentStage === "documents_submitted").length,
    rejected: filtered.filter((r) => r.status === "rejected").length,
    resubmissionRequired: filtered.filter((r) => r.actionRequired === "Resubmit rejected documents").length,
    stages: EMPLOYEE_ONBOARDING_STAGES.map((stage) => ({
      stage,
      count: filtered.filter((r) => r.currentStage === stage).length,
    })),
  };

  const total = filtered.length;
  const rows = filtered.slice(filters.offset, filters.offset + filters.limit);

  return {
    summary,
    rows,
    pagination: { total, limit: filters.limit, offset: filters.offset },
  };
}

module.exports = { run };
