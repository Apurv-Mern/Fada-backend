const Validator = require("validatorjs");
const { Op } = require("sequelize");
const {
  Employee,
  EmployeeAssignment,
  EmployeeDocument,
  OrganizationStructure,
  Document,
  Dealer,
  Outlet,
} = require("../database/models");

const employeeAttributes = {
  exclude: ["password", "otp", "refreshToken", "mpin"],
};

const employeeValidationRules = {
  name: "required|string",
  email: "email",
  phone: "string",
  score: "integer",
  isActive: "boolean",
  joinedDate: "date",
};

const designationValidationRules = {
  departmentId: "required|integer",
  designationId: "required|integer",
  startDate: "date",
  endDate: "date",
  isActive: "boolean",
};

const assignmentValidationRules = {
  dealerId: "required|integer",
  outletId: "integer",
  departmentId: "integer",
  designationId: "integer",
  startDate: "date",
  endDate: "date",
  isActive: "boolean",
};

const dealerAssignmentValidationRules = {
  outletId: "integer",
  departmentId: "integer",
  designationId: "integer",
  startDate: "date",
  endDate: "date",
  isActive: "boolean",
};

const orgStructureAttributes = ["id", "name", "slug", "flag", "level", "parentId"];

const buildEmployeeIncludes = ({ includeDealership = true } = {}) => [
  {
    model: EmployeeAssignment,
    as: "assignment",
    required: false,
    include: [
      ...(includeDealership
        ? [
            {
              model: Dealer,
              as: "dealership",
              attributes: ["id", "name", "dealerCode"],
            },
          ]
        : []),
      {
        model: Outlet,
        as: "branch",
        attributes: ["id", "name", "code"],
      },
      {
        model: OrganizationStructure,
        as: "department",
        attributes: orgStructureAttributes,
      },
      {
        model: OrganizationStructure,
        as: "designation",
        attributes: orgStructureAttributes,
      },
    ],
  },
];

const validateNestedObject = (value, rules, label, res) => {
  if (value === undefined) {
    return { valid: true };
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    res.apiError(`${label} must be an object`, 422);
    return { valid: false };
  }

  const validator = new Validator(value, rules);
  if (validator.fails()) {
    res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    return { valid: false };
  }

  return { valid: true, data: value };
};

const validateDesignation = async (designation, dealerId, res) => {
  const parsed = validateNestedObject(
    designation,
    designationValidationRules,
    "designation",
    res,
  );
  if (!parsed.valid) return { valid: false };

  if (!parsed.data) return { valid: true };

  const department = await OrganizationStructure.findByPk(
    parsed.data.departmentId,
  );
  if (!department || department.flag !== "department") {
    res.apiError("Department not found", 404);
    return { valid: false };
  }

  const role = await OrganizationStructure.findByPk(parsed.data.designationId);
  if (!role || role.flag !== "role") {
    res.apiError("Designation not found", 404);
    return { valid: false };
  }

  if (Number(role.parentId) !== Number(department.id)) {
    res.apiError("Designation does not belong to the selected department", 422);
    return { valid: false };
  }

  if (!dealerId) {
    res.apiError("dealerId is required when designation is provided", 422);
    return { valid: false };
  }

  const dealer = await Dealer.findByPk(dealerId);
  if (!dealer) {
    res.apiError("Dealership not found", 404);
    return { valid: false };
  }

  return { valid: true, data: parsed.data };
};

const validateAssignment = async (assignment, res, dealerId = null) => {
  const rules = dealerId
    ? dealerAssignmentValidationRules
    : assignmentValidationRules;
  const parsed = validateNestedObject(assignment, rules, "assignment", res);
  if (!parsed.valid) return { valid: false };

  if (!parsed.data) return { valid: true };

  const resolvedDealerId = dealerId ?? parsed.data.dealerId;
  const dealer = await Dealer.findByPk(resolvedDealerId);
  if (!dealer) {
    res.apiError("Dealership not found", 404);
    return { valid: false };
  }

  if (
    parsed.data.departmentId !== undefined ||
    parsed.data.designationId !== undefined
  ) {
    const designationResult = await validateDesignation(
      {
        departmentId: parsed.data.departmentId,
        designationId: parsed.data.designationId,
      },
      resolvedDealerId,
      res,
    );
    if (!designationResult.valid) return { valid: false };
  }

  return {
    valid: true,
    data: {
      ...parsed.data,
      dealerId: resolvedDealerId,
    },
  };
};

const buildEmployeePayload = (body) => ({
  name: body.name,
  email: body.email ?? null,
  phone: body.phone ?? null,
  score: body.score ?? 0,
  isActive: body.isActive ?? true,
  joinedDate: body.joinedDate ?? null,
});

const mergeAssignmentPayload = (assignment = {}, designation = {}) => ({
  ...assignment,
  ...(designation.departmentId !== undefined
    ? { departmentId: designation.departmentId }
    : {}),
  ...(designation.designationId !== undefined
    ? { designationId: designation.designationId }
    : {}),
  ...(designation.startDate !== undefined
    ? { startDate: designation.startDate }
    : {}),
  ...(designation.endDate !== undefined ? { endDate: designation.endDate } : {}),
  ...(designation.isActive !== undefined
    ? { isActive: designation.isActive }
    : {}),
});

const syncAssignment = async (employeeId, assignment, joinedDate, transaction) => {
  if (!assignment) return;

  const payload = {
    employeeId,
    dealerId: assignment.dealerId,
    outletId: assignment.outletId ?? null,
    departmentId: assignment.departmentId ?? null,
    designationId: assignment.designationId ?? null,
    startDate: assignment.startDate ?? joinedDate ?? null,
    endDate: assignment.endDate ?? null,
    isActive: assignment.isActive ?? true,
  };

  const existing = await EmployeeAssignment.findOne({
    where: { employeeId },
    transaction,
  });

  if (existing) {
    await existing.update(payload, { transaction });
    return;
  }

  await EmployeeAssignment.create(payload, { transaction });
};

/** @deprecated Use syncAssignment with departmentId/designationId on assignment */
const syncDesignation = async (
  employeeId,
  designation,
  dealerId,
  joinedDate,
  transaction,
) => {
  if (!designation) return;

  const existing = await EmployeeAssignment.findOne({
    where: { employeeId },
    transaction,
  });

  await syncAssignment(
    employeeId,
    {
      dealerId: dealerId ?? existing?.dealerId,
      outletId: existing?.outletId ?? null,
      departmentId: designation.departmentId,
      designationId: designation.designationId,
      startDate: designation.startDate ?? existing?.startDate ?? joinedDate,
      endDate: designation.endDate ?? existing?.endDate ?? null,
      isActive: designation.isActive ?? existing?.isActive ?? true,
    },
    joinedDate,
    transaction,
  );
};

const employeeDocumentAppliesToFilter = {
  appliesTo: {
    [Op.in]: ["employee", "both"],
  },
  isActive: true,
};

const checkAllDocumentsApproved = async (employeeId) => {
  const [employee, totalDocuments, approvedDocuments] = await Promise.all([
    Employee.findByPk(employeeId),
    Document.count({
      where: employeeDocumentAppliesToFilter,
    }),
    EmployeeDocument.count({
      where: {
        employeeId,
        isApproved: true,
      },
      include: [
        {
          model: Document,
          as: "document",
          required: true,
          where: employeeDocumentAppliesToFilter,
        },
      ],
    }),
  ]);

  if (!employee) {
    throw new Error("Employee not found.");
  }

  const isKycCompleted = totalDocuments === approvedDocuments;

  await employee.update({
    isKycCompleted,
  });

  return isKycCompleted;
};

const newEmployerSteps = () => {
  return [
    {
      id: 1,
      status: "send_invitation",
      title: "Invitation Received",
      description: "You have an invitation from ",
    },
    {
      id: 2,
      status: "accept_invitation",
      title: "Accept Invitation",
      description: "Review and accept the invitation",
    },
    {
      id: 3,
      status: "share_details",
      title: "Share Details",
      description:
        "Share required documents and Information with hr over email and confirm same here",
    },
    {
      id: 4,
      status: "employer_verification",
      title: "Employer Verification",
      description: "Employer verifies your details",
    },
    {
      id: 5,
      status: "joining_confirmed",
      title: "Joining Confirmed",
      description: "Your new association is activated",
    },
  ];
};

const employerLeavingSteps = () => {
  return [
    {
      id: 1,
      status: "inform_employer",
      title: "Inform Employer",
      description: "Employee has informed the employer about leaving",
    },
    {
      id: 2,
      status: "submit_resignation",
      title: "Submit Resignation",
      description: "Resignation details have been submitted",
    },
    {
      id: 3,
      status: "accept_resignation",
      title: "Accept Resignation",
      description: "Dealer accepts or rejects the resignation",
    },
    {
      id: 4,
      status: "handover_completed",
      title: "Handover Completed",
      description: "Handover of responsibilities is completed",
    },
    {
      id: 5,
      status: "clearance_completed",
      title: "Clearance Completed",
      description: "Exit clearance is completed",
    },
    {
      id: 6,
      status: "exit_completed",
      title: "Exit Completed",
      description: "Employment exit is finalized",
    },
  ];
};

module.exports = {
  employeeAttributes,
  employeeValidationRules,
  buildEmployeeIncludes,
  validateDesignation,
  validateAssignment,
  buildEmployeePayload,
  mergeAssignmentPayload,
  syncDesignation,
  syncAssignment,
  checkAllDocumentsApproved,
  newEmployerSteps,
  employerLeavingSteps,
};
