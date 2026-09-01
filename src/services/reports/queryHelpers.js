const { Op } = require("sequelize");
const {
  Dealer,
  DealerLocation,
  DealerProfile,
  Employee,
  EmployeeAssignment,
  EmployeeDocument,
  DealerDocument,
  OrganizationStructure,
  EmployeeLeaveEmployeement,
  EmployeeEmployerStatus,
  Brand,
} = require("../../database/models");

function buildDealerWhere(scope, filters) {
  const where = {};
  if (scope.dealerId) where.id = scope.dealerId;
  if (filters.dealerStatus) where.status = filters.dealerStatus;
  if (filters.fromDate || filters.toDate) {
    where.createdAt = {};
    if (filters.fromDate) where.createdAt[Op.gte] = filters.fromDate;
    if (filters.toDate) where.createdAt[Op.lte] = `${filters.toDate} 23:59:59`;
  }
  if (filters.brand) {
    where.brands = { [Op.like]: `%${filters.brand}%` };
  }
  return where;
}

function buildLocationWhere(scope, filters) {
  const where = {};
  if (scope.state || filters.state) where.state = scope.state || filters.state;
  if (scope.city || filters.city) where.city = scope.city || filters.city;
  return where;
}

function buildAssignmentWhere(scope, filters) {
  const where = {};
  if (scope.dealerId) where.dealerId = scope.dealerId;
  if (filters.departmentId) where.departmentId = filters.departmentId;
  if (filters.designationId) where.designationId = filters.designationId;
  if (filters.employmentStatus === "active") where.isCurrentlyWorking = true;
  if (filters.employmentStatus === "inactive") where.isCurrentlyWorking = false;
  if (filters.employmentStatus === "pending") where.status = "pending";
  if (filters.employmentStatus === "completed") where.status = "completed";
  return where;
}

async function getScopedDealerIds(scope, filters) {
  const dealerWhere = buildDealerWhere(scope, filters);
  const locationWhere = buildLocationWhere(scope, filters);
  const profileWhere = {};
  if (filters.dealerType) profileWhere.typeOfDealership = filters.dealerType;

  const include = [];
  if (Object.keys(locationWhere).length) {
    include.push({
      model: DealerLocation,
      as: "location",
      where: locationWhere,
      required: true,
    });
  }
  if (Object.keys(profileWhere).length) {
    include.push({
      model: DealerProfile,
      as: "profile",
      where: profileWhere,
      required: true,
    });
  }

  const dealers = await Dealer.findAll({
    attributes: ["id"],
    where: dealerWhere,
    include: include.length ? include : undefined,
  });

  return dealers.map((d) => d.id);
}

async function getEmployeeDocStats(employeeIds) {
  if (!employeeIds.length) return {};

  const docs = await EmployeeDocument.findAll({
    attributes: ["employeeId", "status", "isVerified"],
    where: { employeeId: { [Op.in]: employeeIds } },
  });

  const stats = {};
  for (const doc of docs) {
    if (!stats[doc.employeeId]) {
      stats[doc.employeeId] = {
        total: 0,
        submittedCount: 0,
        rejectedCount: 0,
        verifiedCount: 0,
      };
    }
    stats[doc.employeeId].total += 1;
    if (doc.status === "rejected") stats[doc.employeeId].rejectedCount += 1;
    if (doc.status !== "rejected") stats[doc.employeeId].submittedCount += 1;
    if (doc.isVerified) stats[doc.employeeId].verifiedCount += 1;
  }
  return stats;
}

async function getDealerDocStats(dealerIds) {
  if (!dealerIds.length) return {};

  const docs = await DealerDocument.findAll({
    attributes: ["dealerId", "status"],
    where: { dealerId: { [Op.in]: dealerIds } },
  });

  const stats = {};
  for (const doc of docs) {
    if (!stats[doc.dealerId]) {
      stats[doc.dealerId] = { total: 0, submittedCount: 0, rejectedCount: 0 };
    }
    stats[doc.dealerId].total += 1;
    if (doc.status === "rejected") stats[doc.dealerId].rejectedCount += 1;
    else stats[doc.dealerId].submittedCount += 1;
  }
  return stats;
}

async function getDealerEmployeeCounts(dealerIds) {
  if (!dealerIds.length) return {};

  const assignments = await EmployeeAssignment.findAll({
    attributes: ["dealerId", "employeeId", "status", "isCurrentlyWorking"],
    include: [
      {
        model: Employee,
        as: "employee",
        attributes: ["id", "fadaId", "isVerified", "isActive"],
      },
    ],
    where: { dealerId: { [Op.in]: dealerIds } },
  });

  const counts = {};
  for (const assignment of assignments) {
    const dealerId = assignment.dealerId;
    if (!counts[dealerId]) {
      counts[dealerId] = {
        totalEmployees: 0,
        fadaIdsCreated: 0,
        verifiedEmployees: 0,
        activeEmployees: 0,
        lastActivityAt: null,
      };
    }
    counts[dealerId].totalEmployees += 1;
    const emp = assignment.employee;
    if (emp?.fadaId) counts[dealerId].fadaIdsCreated += 1;
    if (emp?.isVerified) counts[dealerId].verifiedEmployees += 1;
    if (assignment.isCurrentlyWorking && emp?.isActive) {
      counts[dealerId].activeEmployees += 1;
    }
  }

  const lastUpdates = await EmployeeAssignment.findAll({
    attributes: [
      "dealerId",
      [EmployeeAssignment.sequelize.fn("MAX", EmployeeAssignment.sequelize.col("updatedAt")), "lastUpdate"],
    ],
    where: { dealerId: { [Op.in]: dealerIds } },
    group: ["dealerId"],
    raw: true,
  });

  for (const row of lastUpdates) {
    if (counts[row.dealerId]) {
      counts[row.dealerId].lastActivityAt = row.lastUpdate;
    }
  }

  return counts;
}


async function getDealerBrands(dealerBrands) {
  const brands = await Brand.findAll({
    where: { isActive: true, flag: "brand", id: { [Op.in]: dealerBrands } },
    attributes: ["id", "name"],
    order: [["name", "ASC"]],
  });
  return (brands || []).map((b) => b.name).join(", ");
};

module.exports = {
  buildDealerWhere,
  buildLocationWhere,
  buildAssignmentWhere,
  getScopedDealerIds,
  getEmployeeDocStats,
  getDealerDocStats,
  getDealerEmployeeCounts,
  getDealerBrands,
  Op,
  Dealer,
  DealerLocation,
  DealerProfile,
  Employee,
  EmployeeAssignment,
  EmployeeDocument,
  DealerDocument,
  OrganizationStructure,
  EmployeeLeaveEmployeement,
  EmployeeEmployerStatus,
};
