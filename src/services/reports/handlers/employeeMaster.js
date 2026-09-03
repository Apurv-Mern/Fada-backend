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
  getFadaIdStatus,
  getProfileCompletionStatus,
  getVerificationStatus,
  getMembershipStatus,
  getEmployeeCode,
  getEmploymentStatus,
} = require("../computedFields");

async function run({ scope, filters }) {
  const dealerIds = await getScopedDealerIds(scope, filters);
  if (dealerIds.length === 0) {
    return {
      summary: { totalEmployees: 0 },
      rows: [],
      pagination: { total: 0, limit: filters.limit, offset: filters.offset },
    };
  }

  const assignmentWhere = {
    ...buildAssignmentWhere(scope, filters),
    dealerId: { [Op.in]: dealerIds },
  };

  const employeeSearchWhere = buildEmployeeSearchWhere(filters.search);

  const assignments = await EmployeeAssignment.findAll({
    where: assignmentWhere,
    include: [
      {
        model: Employee,
        as: "employee",
        required: true,
        ...(employeeSearchWhere ? { where: employeeSearchWhere } : {}),
      },
      { model: OrganizationStructure, as: "department", attributes: ["id", "name"], required: false },
      { model: OrganizationStructure, as: "designation", attributes: ["id", "name"], required: false },
    ],
    order: [[{ model: Employee, as: "employee" }, "name", "ASC"]],
  });

  const employeeIds = assignments.map((a) => a.employeeId);
  const docStats = await getEmployeeDocStats(employeeIds);

  let allRows = assignments.map((assignment) => {
    const employee = assignment.employee;
    const profile = getProfileCompletionStatus(employee);
    const row = {
      employeeId: employee.id,
      dealerId: assignment.dealerId,
      fadaId: employee.fadaId,
      name: employee.name,
      employeeCode: getEmployeeCode(employee),
      phone: employee.phone,
      email: employee.email,
      department: assignment.department?.name || null,
      designation: assignment.designation?.name || null,
      joiningDate: assignment.startDate || employee.joinedDate,
      employmentStatus: getEmploymentStatus(assignment),
      fadaIdStatus: getFadaIdStatus(employee),
      profileCompletion: profile,
      verificationStatus: getVerificationStatus(employee, assignment),
      membershipStatus: getMembershipStatus(employee, assignment),
      lastProfileUpdate: employee.updatedAt,
    };
    return row;
  });

  if (filters.fadaIdStatus) {
    allRows = allRows.filter((r) => r.fadaIdStatus === filters.fadaIdStatus);
  }
  if (filters.profileStatus === "completed") {
    allRows = allRows.filter((r) => r.profileCompletion.completed);
  }
  if (filters.profileStatus === "incomplete") {
    allRows = allRows.filter((r) => !r.profileCompletion.completed);
  }
  if (filters.verificationStatus) {
    allRows = allRows.filter((r) => r.verificationStatus === filters.verificationStatus);
  }
  if (filters.membershipStatus) {
    allRows = allRows.filter((r) => r.membershipStatus === filters.membershipStatus);
  }

  const total = allRows.length;
  const rows = allRows.slice(filters.offset, filters.offset + filters.limit);

  return {
    summary: {
      totalEmployees: total,
      fadaIdsCreated: allRows.filter((r) => r.fadaId).length,
      verified: allRows.filter((r) => r.verificationStatus === "verified").length,
      active: allRows.filter((r) => r.employmentStatus === "active").length,
    },
    rows,
    pagination: { total, limit: filters.limit, offset: filters.offset },
  };
}

module.exports = { run };
