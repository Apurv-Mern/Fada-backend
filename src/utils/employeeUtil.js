const Validator = require("validatorjs");
const {
  EmployeeDesignation,
  EmployeeAssignment,
  OrganizationStructure,
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
  startDate: "date",
  endDate: "date",
  isActive: "boolean",
};

const dealerAssignmentValidationRules = {
  outletId: "integer",
  startDate: "date",
  endDate: "date",
  isActive: "boolean",
};

const buildEmployeeIncludes = ({ includeDealership = true } = {}) => [
  {
    model: EmployeeDesignation,
    as: "designation",
    required: false,
    include: [
      {
        model: OrganizationStructure,
        as: "department",
        attributes: ["id", "name", "slug", "flag", "level"],
      },
      {
        model: OrganizationStructure,
        as: "designation",
        attributes: ["id", "name", "slug", "flag", "level", "parentId"],
      },
      ...(includeDealership
        ? [
            {
              model: Dealer,
              as: "dealership",
              attributes: ["id", "name", "dealerCode"],
            },
          ]
        : []),
    ],
  },
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

  const department = await OrganizationStructure.findByPk(parsed.data.departmentId);
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
  const rules = dealerId ? dealerAssignmentValidationRules : assignmentValidationRules;
  const parsed = validateNestedObject(assignment, rules, "assignment", res);
  if (!parsed.valid) return { valid: false };

  if (!parsed.data) return { valid: true };

  const resolvedDealerId = dealerId ?? parsed.data.dealerId;
  const dealer = await Dealer.findByPk(resolvedDealerId);
  if (!dealer) {
    res.apiError("Dealership not found", 404);
    return { valid: false };
  }

  if (parsed.data.outletId) {
    const outlet = await Outlet.findOne({
      where: {
        id: parsed.data.outletId,
        dealerId: resolvedDealerId,
      },
    });

    if (!outlet) {
      res.apiError("Branch not found for the selected dealership", 404);
      return { valid: false };
    }
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

const syncDesignation = async (
  employeeId,
  designation,
  dealerId,
  joinedDate,
  transaction,
) => {
  if (!designation) return;

  const payload = {
    employeeId,
    dealerId,
    departmentId: designation.departmentId,
    designationId: designation.designationId,
    startDate: designation.startDate ?? joinedDate ?? null,
    endDate: designation.endDate ?? null,
    isActive: designation.isActive ?? true,
  };

  const existing = await EmployeeDesignation.findOne({
    where: { employeeId },
    transaction,
  });

  if (existing) {
    await existing.update(payload, { transaction });
    return;
  }

  await EmployeeDesignation.create(payload, { transaction });
};

const syncAssignment = async (employeeId, assignment, joinedDate, transaction) => {
  if (!assignment) return;

  const payload = {
    employeeId,
    dealerId: assignment.dealerId,
    outletId: assignment.outletId ?? null,
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

module.exports = {
  employeeAttributes,
  employeeValidationRules,
  buildEmployeeIncludes,
  validateDesignation,
  validateAssignment,
  buildEmployeePayload,
  syncDesignation,
  syncAssignment,
};
