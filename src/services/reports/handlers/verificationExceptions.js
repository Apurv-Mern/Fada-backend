const {
  getScopedDealerIds,
  Dealer,
  DealerLocation,
  Employee,
  EmployeeAssignment,
  EmployeeDocument,
  Op,
} = require("../queryHelpers");
const {
  getAgeingBucket,
  getAgeingDays,
  getDealerPublicCode,
} = require("../computedFields");
const { ISSUE_TYPES } = require("../reportConstants");

async function run({ scope, filters }) {
  const dealerIds = await getScopedDealerIds(scope, filters);
  const rows = [];

  const issueFilter = filters.issueType || null;

  if (!issueFilter || issueFilter === "dealer_verification_pending") {
    const pendingDealers = await Dealer.findAll({
      where: {
        id: dealerIds.length ? { [Op.in]: dealerIds } : undefined,
        status: "pending",
      },
      include: [{ model: DealerLocation, as: "location", required: false }],
    });
    for (const dealer of pendingDealers) {
      rows.push({
        entityType: "dealer",
        entityId: dealer.id,
        dealer: { id: dealer.id, name: dealer.name, code: getDealerPublicCode(dealer) },
        employee: null,
        fadaId: null,
        issueType: "dealer_verification_pending",
        status: dealer.status,
        createdDate: dealer.createdAt,
        pendingSince: dealer.createdAt,
        ageingDays: getAgeingDays(dealer.createdAt),
        ageingBucket: getAgeingBucket(dealer.createdAt),
        actionRequired: "Verify dealer registration",
        resolutionDate: null,
        resolutionStatus: null,
      });
    }
  }

  if (!issueFilter || issueFilter === "employee_verification_pending") {
    const pendingEmployees = await Employee.findAll({
      where: { status: "pending", isVerified: false },
      include: [
        {
          model: EmployeeAssignment,
          as: "assignment",
          required: true,
          where: dealerIds.length ? { dealerId: { [Op.in]: dealerIds } } : undefined,
          include: [{ model: Dealer, as: "dealership", attributes: ["id", "name", "dealerId", "dealerCode"] }],
        },
      ],
    });
    for (const employee of pendingEmployees) {
      rows.push({
        entityType: "employee",
        entityId: employee.id,
        dealer: employee.assignment?.dealership
          ? {
              id: employee.assignment.dealership.id,
              name: employee.assignment.dealership.name,
              code: getDealerPublicCode(employee.assignment.dealership),
            }
          : null,
        employee: { id: employee.id, name: employee.name },
        fadaId: employee.fadaId,
        issueType: "employee_verification_pending",
        status: employee.status,
        createdDate: employee.createdAt,
        pendingSince: employee.updatedAt,
        ageingDays: getAgeingDays(employee.updatedAt),
        ageingBucket: getAgeingBucket(employee.updatedAt),
        actionRequired: "Verify employee",
        resolutionDate: null,
        resolutionStatus: null,
      });
    }
  }

  if (!issueFilter || issueFilter === "document_rejected" || issueFilter === "resubmission_required") {
    const rejectedDocs = await EmployeeDocument.findAll({
      where: { status: "rejected" },
      include: [
        {
          model: Employee,
          as: "employee",
          required: true,
          include: [
            {
              model: EmployeeAssignment,
              as: "assignment",
              required: true,
              where: dealerIds.length ? { dealerId: { [Op.in]: dealerIds } } : undefined,
              include: [{ model: Dealer, as: "dealership", attributes: ["id", "name", "dealerId", "dealerCode"] }],
            },
          ],
        },
      ],
    });
    for (const doc of rejectedDocs) {
      const issueType = issueFilter === "document_rejected" ? "document_rejected" : "resubmission_required";
      if (issueFilter && issueFilter !== issueType) continue;
      rows.push({
        entityType: "employee_document",
        entityId: doc.id,
        dealer: doc.employee?.assignment?.dealership
          ? {
              id: doc.employee.assignment.dealership.id,
              name: doc.employee.assignment.dealership.name,
              code: getDealerPublicCode(doc.employee.assignment.dealership),
            }
          : null,
        employee: { id: doc.employee.id, name: doc.employee.name },
        fadaId: doc.employee.fadaId,
        issueType: "resubmission_required",
        status: doc.status,
        createdDate: doc.createdAt,
        pendingSince: doc.updatedAt,
        ageingDays: getAgeingDays(doc.updatedAt),
        ageingBucket: getAgeingBucket(doc.updatedAt),
        actionRequired: doc.reason || "Resubmit document",
        resolutionDate: doc.approvedAt,
        resolutionStatus: doc.isApproved ? "resolved" : "open",
      });
    }
  }

  if (!issueFilter || issueFilter === "duplicate_record") {
    const [duplicatePhones] = await Employee.sequelize.query(`
      SELECT phone, COUNT(*) as cnt FROM Employees
      WHERE phone IS NOT NULL AND phone != '' AND deletedAt IS NULL
      GROUP BY phone HAVING cnt > 1 LIMIT 50
    `);
    for (const dup of duplicatePhones) {
      const employees = await Employee.findAll({ where: { phone: dup.phone }, limit: 5 });
      for (const employee of employees) {
        rows.push({
          entityType: "employee",
          entityId: employee.id,
          dealer: null,
          employee: { id: employee.id, name: employee.name },
          fadaId: employee.fadaId,
          issueType: "duplicate_record",
          status: "duplicate",
          createdDate: employee.createdAt,
          pendingSince: employee.createdAt,
          ageingDays: getAgeingDays(employee.createdAt),
          ageingBucket: getAgeingBucket(employee.createdAt),
          actionRequired: `Duplicate phone: ${dup.phone}`,
          resolutionDate: null,
          resolutionStatus: "open",
        });
      }
    }
  }

  if (!issueFilter || issueFilter === "missing_information") {
    const incomplete = await Employee.findAll({
      where: {
        [Op.or]: [
          { isProfileCompleted: false },
          { isKycCompleted: false },
        ],
      },
      include: [
        {
          model: EmployeeAssignment,
          as: "assignment",
          required: true,
          where: dealerIds.length ? { dealerId: { [Op.in]: dealerIds } } : undefined,
          include: [{ model: Dealer, as: "dealership", attributes: ["id", "name", "dealerId", "dealerCode"] }],
        },
      ],
      limit: 100,
    });
    for (const employee of incomplete) {
      rows.push({
        entityType: "employee",
        entityId: employee.id,
        dealer: employee.assignment?.dealership
          ? {
              id: employee.assignment.dealership.id,
              name: employee.assignment.dealership.name,
              code: getDealerPublicCode(employee.assignment.dealership),
            }
          : null,
        employee: { id: employee.id, name: employee.name },
        fadaId: employee.fadaId,
        issueType: "missing_information",
        status: employee.isProfileCompleted ? "documents_pending" : "profile_incomplete",
        createdDate: employee.createdAt,
        pendingSince: employee.updatedAt,
        ageingDays: getAgeingDays(employee.updatedAt),
        ageingBucket: getAgeingBucket(employee.updatedAt),
        actionRequired: employee.isProfileCompleted ? "Submit documents" : "Complete profile",
        resolutionDate: null,
        resolutionStatus: "open",
      });
    }
  }

  const summary = {
    totalExceptions: rows.length,
    byIssueType: ISSUE_TYPES.reduce((acc, type) => {
      acc[type] = rows.filter((r) => r.issueType === type).length;
      return acc;
    }, {}),
    byAgeingBucket: {
      "0-2": rows.filter((r) => r.ageingBucket === "0-2").length,
      "3-7": rows.filter((r) => r.ageingBucket === "3-7").length,
      "8-15": rows.filter((r) => r.ageingBucket === "8-15").length,
      "15+": rows.filter((r) => r.ageingBucket === "15+").length,
    },
  };

  const total = rows.length;
  const paginatedRows = rows.slice(filters.offset, filters.offset + filters.limit);

  return {
    summary,
    rows: paginatedRows,
    pagination: { total, limit: filters.limit, offset: filters.offset },
  };
}

module.exports = { run };
