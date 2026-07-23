const Validator = require("validatorjs");
const { Op } = require("sequelize");
const {
  sequelize,
  Employee,
  EmployeeDesignation,
  EmployeeAssignment,
  OrganizationStructure,
  Dealer,
  Outlet,
} = require("../../../database/models");
const { generateFadaId } = require("../../../utils/fadaIdUtil");

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

const employeeIncludes = [
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
      {
        model: Dealer,
        as: "dealership",
        attributes: ["id", "name", "dealerCode"],
      },
    ],
  },
  {
    model: EmployeeAssignment,
    as: "assignment",
    required: false,
    include: [
      {
        model: Dealer,
        as: "dealership",
        attributes: ["id", "name", "dealerCode"],
      },
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
    res
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

const validateAssignment = async (assignment, res) => {
  const parsed = validateNestedObject(
    assignment,
    assignmentValidationRules,
    "assignment",
    res
  );
  if (!parsed.valid) return { valid: false };

  if (!parsed.data) return { valid: true };

  const dealer = await Dealer.findByPk(parsed.data.dealerId);
  if (!dealer) {
    res.apiError("Dealership not found", 404);
    return { valid: false };
  }

  if (parsed.data.outletId) {
    const outlet = await Outlet.findOne({
      where: {
        id: parsed.data.outletId,
        dealerId: parsed.data.dealerId,
      },
    });

    if (!outlet) {
      res.apiError("Branch not found for the selected dealership", 404);
      return { valid: false };
    }
  }

  return { valid: true, data: parsed.data };
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
  transaction
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

const syncAssignment = async (
  employeeId,
  assignment,
  joinedDate,
  transaction
) => {
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

const loadEmployee = async (employeeId, transaction) =>
  Employee.findByPk(employeeId, {
    attributes: employeeAttributes,
    include: employeeIncludes,
    transaction,
  });

/*
@API: GET /admin/employees?search=&dealerId=&departmentId=&outletId=&isActive=&limit=&offset=
@Desc: Get all employees
@Access: Private
*/
exports.getEmployees = async (req, res) => {
  try {
    const { search, dealerId, departmentId, outletId, isActive } = req.query;
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const where = {};

    if (isActive !== undefined && isActive !== "") {
      where.isActive = isActive === "true" || isActive === "1";
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { fadaId: { [Op.like]: `%${search}%` } },
      ];
    }

    const designationInclude = {
      model: EmployeeDesignation,
      as: "designation",
      required: !!departmentId,
      where: departmentId ? { departmentId } : undefined,
      include: [
        {
          model: OrganizationStructure,
          as: "department",
          attributes: ["id", "name"],
        },
        {
          model: OrganizationStructure,
          as: "designation",
          attributes: ["id", "name"],
        },
      ],
    };

    const assignmentInclude = {
      model: EmployeeAssignment,
      as: "assignment",
      required: !!(dealerId || outletId),
      where: {
        ...(dealerId ? { dealerId } : {}),
        ...(outletId ? { outletId } : {}),
      },
      include: [
        {
          model: Dealer,
          as: "dealership",
          attributes: ["id", "name", "dealerCode"],
        },
        {
          model: Outlet,
          as: "branch",
          attributes: ["id", "name", "code"],
        },
      ],
    };

    const { rows: employees, count: total } = await Employee.findAndCountAll({
      attributes: employeeAttributes,
      where,
      include: [designationInclude, assignmentInclude],
      order: [["id", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    return res.apiSuccess("Employees fetched successfully", {
      employees,
      pagination: {
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /admin/employees/:id
@Desc: Get an employee by id
@Access: Private
*/
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await loadEmployee(req.params.id);
    if (!employee) {
      return res.apiError("Employee not found", 404);
    }

    return res.apiSuccess("Employee fetched successfully", employee);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: POST /admin/employees
@Desc: Create an employee
@Access: Private
*/
exports.createEmployee = async (req, res) => {
  try {
    const validator = new Validator(req.body, employeeValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const assignmentResult = await validateAssignment(req.body.assignment, res);
    if (!assignmentResult.valid) return;

    const designationResult = await validateDesignation(
      req.body.designation,
      assignmentResult.data?.dealerId,
      res
    );
    if (!designationResult.valid) return;

    if (req.body.email) {
      const existingEmail = await Employee.findOne({
        where: { email: req.body.email },
      });
      if (existingEmail) {
        return res.apiError("An employee with this email already exists", 409);
      }
    }

    let employeeId;

    await sequelize.transaction(async (transaction) => {
      const fadaId = await generateFadaId(Employee);

      const employee = await Employee.create(
        {
          ...buildEmployeePayload(req.body),
          fadaId,
        },
        { transaction }
      );

      employeeId = employee.id;

      await syncAssignment(
        employee.id,
        assignmentResult.data,
        req.body.joinedDate,
        transaction
      );

      await syncDesignation(
        employee.id,
        designationResult.data,
        assignmentResult.data?.dealerId,
        req.body.joinedDate,
        transaction
      );
    });

    const employee = await loadEmployee(employeeId);
    return res.apiSuccess("Employee created successfully", employee);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.apiError("Employee with duplicate unique field already exists", 409);
    }

    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /admin/employees/:id
@Desc: Update an employee
@Access: Private
*/
exports.updateEmployee = async (req, res) => {
  try {
    const validator = new Validator(req.body, employeeValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const existingEmployee = await Employee.findByPk(req.params.id);
    if (!existingEmployee) {
      return res.apiError("Employee not found", 404);
    }

    let assignmentResult = { valid: true, data: undefined };
    if (req.body.assignment !== undefined) {
      assignmentResult = await validateAssignment(req.body.assignment, res);
      if (!assignmentResult.valid) return;
    }

    let designationResult = { valid: true, data: undefined };
    if (req.body.designation !== undefined) {
      const existingAssignment = await EmployeeAssignment.findOne({
        where: { employeeId: existingEmployee.id },
      });
      const dealerId =
        assignmentResult.data?.dealerId ?? existingAssignment?.dealerId;

      designationResult = await validateDesignation(
        req.body.designation,
        dealerId,
        res
      );
      if (!designationResult.valid) return;
    }

    if (req.body.email && req.body.email !== existingEmployee.email) {
      const existingEmail = await Employee.findOne({
        where: { email: req.body.email },
      });
      if (existingEmail) {
        return res.apiError("An employee with this email already exists", 409);
      }
    }

    await sequelize.transaction(async (transaction) => {
      await existingEmployee.update(buildEmployeePayload(req.body), {
        transaction,
      });

      if (req.body.assignment !== undefined) {
        await syncAssignment(
          existingEmployee.id,
          assignmentResult.data,
          req.body.joinedDate ?? existingEmployee.joinedDate,
          transaction
        );
      }

      if (req.body.designation !== undefined) {
        const assignment = await EmployeeAssignment.findOne({
          where: { employeeId: existingEmployee.id },
          transaction,
        });

        await syncDesignation(
          existingEmployee.id,
          designationResult.data,
          assignmentResult.data?.dealerId ?? assignment?.dealerId,
          req.body.joinedDate ?? existingEmployee.joinedDate,
          transaction
        );
      }
    });

    const employee = await loadEmployee(existingEmployee.id);
    return res.apiSuccess("Employee updated successfully", employee);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.apiError("Employee with duplicate unique field already exists", 409);
    }

    return res.apiError(error.message, 500, error);
  }
};

/*
@API: DELETE /admin/employees/:id
@Desc: Delete an employee
@Access: Private
*/
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.apiError("Employee not found", 404);
    }

    await sequelize.transaction(async (transaction) => {
      await EmployeeDesignation.destroy({
        where: { employeeId: employee.id },
        transaction,
      });
      await EmployeeAssignment.destroy({
        where: { employeeId: employee.id },
        transaction,
      });
      await employee.destroy({ transaction });
    });

    return res.apiSuccess("Employee deleted successfully");
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};
