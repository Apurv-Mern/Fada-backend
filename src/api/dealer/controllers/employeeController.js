const Validator = require("validatorjs");
const { Op } = require("sequelize");
const {
  sequelize,
  Employee,
  EmployeeAssignment,
  EmployeeDesignation,
  OrganizationStructure,
  Document,
  EmployeeDocument,
} = require("../../../database/models");
const { generateFadaId } = require("../../../utils/fadaIdUtil");
const {
  employeeAttributes,
  employeeValidationRules,
  buildEmployeeIncludes,
  validateDesignation,
  validateAssignment,
  buildEmployeePayload,
  syncDesignation,
  syncAssignment,
  checkAllDocumentsApproved,
} = require("../../../services/employeeService");

const employeeIncludes = buildEmployeeIncludes({ includeDealership: false });

const getDealerId = (req) => req.currentDealerId;

const loadEmployee = async (employeeId, dealerId) => {
  const assignment = await EmployeeAssignment.findOne({
    where: { employeeId, dealerId },
  });

  if (!assignment) return null;

  return Employee.findByPk(employeeId, {
    attributes: employeeAttributes,
    include: employeeIncludes,
  });
};

const findDealerEmployeeOrError = async (employeeId, dealerId, res) => {
  const employee = await loadEmployee(employeeId, dealerId);
  if (!employee) {
    res.apiError("Employee not found", 404);
    return null;
  }
  return employee;
};

/*
@API: GET /dealers/employees
@Desc: Get authenticated dealer employees
@Access: Private
*/
exports.getEmployees = async (req, res) => {
  try {
    const dealerId = getDealerId(req);
    const { search, departmentId, outletId, isActive } = req.query;
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
      where: {
        dealerId,
        ...(departmentId ? { departmentId } : {}),
      },
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
      ],
    };

    const assignmentInclude = {
      model: EmployeeAssignment,
      as: "assignment",
      required: true,
      where: {
        dealerId,
        ...(outletId ? { outletId } : {}),
      },
      include: employeeIncludes[1].include,
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
@API: GET /dealers/employees/:id
@Desc: Get employee by id
@Access: Private
*/
exports.getEmployeeById = async (req, res) => {
  try {
    const dealerId = getDealerId(req);
    const employee = await findDealerEmployeeOrError(
      req.params.id,
      dealerId,
      res,
    );
    if (!employee) return;

    return res.apiSuccess("Employee fetched successfully", employee);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: POST /dealers/employees
@Desc: Create employee
@Access: Private
*/
exports.createEmployee = async (req, res) => {
  try {
    const dealerId = getDealerId(req);

    const validator = new Validator(req.body, employeeValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const assignmentResult = await validateAssignment(
      req.body.assignment,
      res,
      dealerId,
    );
    if (!assignmentResult.valid) return;

    const designationResult = await validateDesignation(
      req.body.designation,
      dealerId,
      res,
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
        { transaction },
      );

      employeeId = employee.id;

      await syncAssignment(
        employee.id,
        assignmentResult.data,
        req.body.joinedDate,
        transaction,
      );

      await syncDesignation(
        employee.id,
        designationResult.data,
        dealerId,
        req.body.joinedDate,
        transaction,
      );
    });

    //const employee = await loadEmployee(employeeId, dealerId);
    return res.apiSuccess("Employee created successfully");
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.apiError(
        "Employee with duplicate unique field already exists",
        409,
      );
    }

    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /dealers/employees/:id
@Desc: Update employee
@Access: Private
*/
exports.updateEmployee = async (req, res) => {
  try {
    const dealerId = getDealerId(req);

    const validator = new Validator(req.body, employeeValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const existingEmployee = await findDealerEmployeeOrError(
      req.params.id,
      dealerId,
      res,
    );
    if (!existingEmployee) return;

    let assignmentResult = { valid: true, data: undefined };
    if (req.body.assignment !== undefined) {
      assignmentResult = await validateAssignment(
        req.body.assignment,
        res,
        dealerId,
      );
      if (!assignmentResult.valid) return;
    }

    let designationResult = { valid: true, data: undefined };
    if (req.body.designation !== undefined) {
      designationResult = await validateDesignation(
        req.body.designation,
        dealerId,
        res,
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
          transaction,
        );
      }

      if (req.body.designation !== undefined) {
        await syncDesignation(
          existingEmployee.id,
          designationResult.data,
          dealerId,
          req.body.joinedDate ?? existingEmployee.joinedDate,
          transaction,
        );
      }
    });

    const employee = await loadEmployee(existingEmployee.id, dealerId);
    return res.apiSuccess("Employee updated successfully", employee);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.apiError(
        "Employee with duplicate unique field already exists",
        409,
      );
    }

    return res.apiError(error.message, 500, error);
  }
};

/*
@API: DELETE /dealers/employees/:id
@Desc: Delete employee
@Access: Private
*/
exports.deleteEmployee = async (req, res) => {
  try {
    const dealerId = getDealerId(req);
    const employee = await findDealerEmployeeOrError(
      req.params.id,
      dealerId,
      res,
    );
    if (!employee) return;

    await sequelize.transaction(async (transaction) => {
      await EmployeeDesignation.destroy({
        where: { employeeId: employee.id, dealerId },
        transaction,
      });
      await EmployeeAssignment.destroy({
        where: { employeeId: employee.id, dealerId },
        transaction,
      });
      await employee.destroy({ transaction });
    });

    return res.apiSuccess("Employee deleted successfully");
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /dealers/employees/:id/approve-documents/:documentId
@Desc: Approve employee documents
@Access: Private
*/
exports.approveEmployeeDocuments = async (req, res) => {
  try {
    const dealerId = getDealerId(req);
    const employee = await findDealerEmployeeOrError(
      req.params.id,
      dealerId,
      res,
    );
    if (!employee) return;

    const document = await EmployeeDocument.findOne({
      where: {
        documentId: req.params.documentId,
        employeeId: employee.id,
      },
    });

    if (!document) {
      return res.apiError("Document not found", 404);
    }

    await document.update({
      isApproved: true,
      approvedAt: new Date(),
      approvedBy: dealerId,
      status: "approved",
    });

    await checkAllDocumentsApproved(employee.id);

    return res.apiSuccess("Employee document approved successfully");
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /dealers/employees/:id/documents
@Desc: Get employee documents
@Access: Private
*/
exports.getEmployeeDocuments = async (req, res) => {
  try {
    const dealerId = getDealerId(req);
    const employee = await findDealerEmployeeOrError(
      req.params.id,
      dealerId,
      res,
    );
    if (!employee) return;

    const documents = await Document.findAll({
      where: { appliesTo: { [Op.in]: ["employee", "both"] }, isActive: true },
      attributes: [
        "id",
        "name",
        "code",
        "category",
        "isMandatory",
        "isVerificationRequired",
        "sortOrder",
      ],
      include: [
        {
          model: EmployeeDocument,
          as: "employeeDocuments",
          where: { employeeId: employee.id },
          required: false,
        },
      ],
      order: [
        ["sortOrder", "ASC"],
        ["name", "ASC"],
      ],
    });

    return res.apiSuccess("Employee documents fetched successfully", documents);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};
