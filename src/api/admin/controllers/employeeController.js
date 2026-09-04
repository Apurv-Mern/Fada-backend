const Validator = require("validatorjs");
const { Op } = require("sequelize");
const {
  sequelize,
  Employee,
  EmployeeAssignment,
  OrganizationStructure,
  Dealer,
  Outlet,
  EmployeeDocument,
  Document,
  EmployeeAddress,
  EmployeeAppreciation,
  EmployeeCertificate,
  EmployeePromotion,
  EmployeeTraining,
  EmployeeSkill,
  EmployeeJourney
} = require("../../../database/models");
const { generateFadaId } = require("../../../utils/fadaIdUtil");
const dayjs = require("dayjs");
const {
  checkAllDocumentsApproved,
} = require("../../../services/employeeService");
const {
  generateTempPassword,
  hashPassword,
} = require("../../../utils/passwordUtil");
const { addEmailJob } = require("../../../queues");

const importEmployeeValidationRules = {
  name: "required|string",
  email: "email",
  phone: "string",
  city: "string",
  qualification: "string",
  bloodGroup: "string",
  isProfilePrivate: "boolean",
  isRegistrationCompleted: "boolean",
  isProfileCompleted: "boolean",
  isKycCompleted: "boolean",
  isJourneyCompleted: "boolean",
  score: "integer",
  isActive: "boolean",
  joinedDate: "date",
};

function buildImportEmployeePayload(item) {
  return {
    name: item.name,
    email: item.email ?? null,
    phone: item.phone ?? null,
    qualification: item.qualification ?? null,
    bloodGroup: item.bloodGroup ?? null,
    isProfilePrivate: item.isProfilePrivate ?? false,
    isRegistrationCompleted: item.isRegistrationCompleted ?? false,
    isProfileCompleted: item.isProfileCompleted ?? false,
    isKycCompleted: item.isKycCompleted ?? false,
    isJourneyCompleted: item.isJourneyCompleted ?? false,
    score: item.score ?? 0,
    isActive: item.isActive ?? true,
    joinedDate: item.joinedDate ?? null,
    status: item.status ?? "approved",
    isVerified: item.isVerified ?? false,
  };
}

function buildImportAssignmentPayload(item) {
  if (!item.assignment || typeof item.assignment !== "object") {
    return null;
  }

  const {
    dealerId,
    outletId,
    departmentId,
    designationId,
    startDate,
    endDate,
    isActive,
  } = item.assignment;

  if (!dealerId) {
    return null;
  }

  return {
    dealerId,
    outletId: outletId ?? null,
    departmentId: departmentId ?? null,
    designationId: designationId ?? null,
    startDate: startDate ?? item.joinedDate ?? null,
    endDate: endDate ?? null,
    isActive: isActive ?? true,
  };
}

const employeeAttributes = {
  exclude: [
    "password",
    "otp",
    "refreshToken",
    "mpin",
    "emailOTP",
    "updatedAt",
    "deletedAt",
  ],
};

const employeeStatus = ["temporary", "pending", "approved", "rejected"];

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

const employeeIncludes = [
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

const validateAssignment = async (assignment, res) => {
  const parsed = validateNestedObject(
    assignment,
    assignmentValidationRules,
    "assignment",
    res,
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

const syncAssignment = async (
  employeeId,
  assignment,
  joinedDate,
  transaction,
) => {
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

  return await EmployeeAssignment.create(payload, { transaction });
};

const loadEmployee = async (employeeId, transaction) =>
  Employee.findByPk(employeeId, {
    attributes: employeeAttributes,
    include: employeeIncludes,
    transaction,
  });

/*
@API: GET /admin/employees?search=&dealerId=&departmentId=&outletId=&isActive=&status=&limit=&offset=
@Desc: Get all employees
@Access: Private
*/
exports.getEmployees = async (req, res) => {
  try {
    const { search, dealerId, departmentId, outletId, isActive, status } =
      req.query;
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const where = {};

    if (isActive !== undefined && isActive !== "") {
      where.isActive = isActive === "true" || isActive === "1";
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { fadaId: { [Op.like]: `%${search}%` } },
      ];
    }

    const assignmentInclude = {
      model: EmployeeAssignment,
      as: "assignment",
      required: !!(dealerId || outletId || departmentId),
      where: {
        ...(dealerId ? { dealerId } : {}),
        ...(outletId ? { outletId } : {}),
        ...(departmentId ? { departmentId } : {}),
        isCurrentlyWorking: true,
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

    const { rows: employees, count: total } = await Employee.findAndCountAll({
      attributes: employeeAttributes,
      where,
      include: [
        assignmentInclude,
        {
          model: EmployeeAddress,
          as: "addresses",
          required: false,
        },
      ],
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
@API: GET /admin/employees/edit/:id
@Desc: Get employee details for the admin edit form
@Access: Private
*/
exports.getEmployeeForEdit = async (req, res) => {
  try {
    const employee = await loadEmployee(req.params.id);

    if (!employee) {
      return res.apiError("Employee not found", 404);
    }

    return res.apiSuccess("Employee edit details fetched successfully", employee);
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
    const employee = await Employee.findOne({
      where: { id: req.params.id },
      attributes: employeeAttributes,
      include: [
        {
          model: EmployeeAddress,
          as: "addresses",
          required: false,
        },

        {
          model: EmployeeDocument,
          attributes: ["id", "isApproved", "isVerified", "reason", "status"],
          as: "documents",
          required: false,
          include: [
            {
              model: Document,
              as: "document",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: EmployeeAppreciation,
          as: "appreciations",
          required: false,
        },
        {
          model: EmployeeCertificate,
          as: "certificates",
          required: false,
        },
        {
          model: EmployeePromotion,
          as: "promotions",
          required: false,
        },
        {
          model: EmployeeTraining,
          as: "trainings",
          required: false,
        },
        {
          model: EmployeeSkill,
          as: "skills",
          required: false,
        },
        {
          model: EmployeeJourney,
          as: "journeys",
          required: false,
        },
        {
          model: EmployeeAssignment,
          as: "workExperiences",
          required: false,
          attributes: [
            "id",
            "startDate",
            "employeementType",
            "isCurrentlyWorking",
            "endDate",
            "highlights",
          ],
          where: { status: "completed" },
          include: [
            {
              model: Dealer,
              as: "dealership",
              attributes: ["id", "name"],
            },
            {
              model: Outlet,
              as: "branch",
              attributes: ["id", "name", "city", "state"],
            },
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
        },
      ],
    });
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
        {
          ...(assignmentResult.data || {}),
          ...(designationResult.data || {}),
        },
        req.body.joinedDate,
        transaction,
      );
    });

    const employee = await loadEmployee(employeeId);
    return res.apiSuccess("Employee created successfully", employee);
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

      if (
        req.body.assignment !== undefined ||
        req.body.designation !== undefined
      ) {
        const existingAssignment = await EmployeeAssignment.findOne({
          where: { employeeId: existingEmployee.id },
          transaction,
        });

        await syncAssignment(
          existingEmployee.id,
          {
            dealerId:
              assignmentResult.data?.dealerId ?? existingAssignment?.dealerId,
            outletId:
              assignmentResult.data?.outletId ?? existingAssignment?.outletId,
            startDate:
              assignmentResult.data?.startDate ?? existingAssignment?.startDate,
            endDate:
              assignmentResult.data?.endDate ?? existingAssignment?.endDate,
            isActive:
              assignmentResult.data?.isActive ?? existingAssignment?.isActive,
            departmentId:
              designationResult.data?.departmentId ??
              assignmentResult.data?.departmentId ??
              existingAssignment?.departmentId,
            designationId:
              designationResult.data?.designationId ??
              assignmentResult.data?.designationId ??
              existingAssignment?.designationId,
            ...(assignmentResult.data || {}),
            ...(designationResult.data || {}),
          },
          req.body.joinedDate ?? existingEmployee.joinedDate,
          transaction,
        );
      }
    });

    const employee = await loadEmployee(existingEmployee.id);
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

/*
@API: PUT /admin/employees/:id/status/:status
@Desc: Update the status of an employee
@Access: Private
*/
exports.updateEmployeeStatus = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.apiError("Employee not found", 404);
    }

    if (!employeeStatus.includes(req.params.status)) {
      return res.apiError("Invalid status", 400);
    }

    let data = { status: req.params.status };

    if ((req.params.status = "approved")) {
      data.isVerified = true;
    }

    await employee.update(data);

    return res.apiSuccess("Employee status updated successfully");
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /admin/employees/stats
@Desc: Get the stats of an employee
@Access: Private
*/
exports.getEmployeeStats = async (req, res) => {
  try {
    const [
      allEmployees,
      approvedEmployees,
      pendingEmployees,
      rejectedEmployees,
      temporaryEmployees,
      activeEmployees,
      inactiveEmployees,
    ] = await Promise.all([
      Employee.count(),
      Employee.count({ where: { status: "approved" } }),
      Employee.count({ where: { status: "pending" } }),
      Employee.count({ where: { status: "rejected" } }),
      Employee.count({ where: { status: "temporary" } }),
      Employee.count({ where: { isActive: true } }),
      Employee.count({ where: { isActive: false } }),
    ]);

    return res.apiSuccess("Employee stats fetched successfully", {
      allEmployees: allEmployees,
      approvedEmployees: approvedEmployees,
      pendingEmployees: pendingEmployees,
      rejectedEmployees: rejectedEmployees,
      temporaryEmployees: temporaryEmployees,
      activeEmployees: activeEmployees,
      inactiveEmployees: inactiveEmployees,
    });
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /admin/employees/:id/active-inactive
@Desc: Activate/deactivate an employee
@Access: Private
*/
exports.activeInactiveEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.apiError("Employee not found", 404);
    }
    await employee.update({ isActive: !employee.isActive });
    return res.apiSuccess(
      employee.isActive
        ? "Employee activated successfully"
        : "Employee deactivated successfully",
    );
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /admin/employees/:id/documents
@Desc: Get the employee documents
@Access: Private
*/
exports.getEmployeeDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      attributes: [
        "id",
        "name",
        "code",
        "category",
        "isMandatory",
        "isVerificationRequired",
        "notes",
      ],
      where: {
        isActive: true,
        appliesTo: { [Op.in]: ["employee", "both"] },
      },
      include: [
        {
          model: EmployeeDocument,
          as: "employeeDocuments",
          where: { employeeId: req.params.id },
          required: false,
        },
      ],
    });
    return res.apiSuccess("Employee documents fetched successfully", documents);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /admin/employees/:id/documents/:documentId/status
@Desc: Update the status of a document for an employee
@Access: Private
@Body: { status: "approved" | "rejected", reason: "string" }
*/
exports.updateEmployeeDocumentStatus = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      status: "required|in:approved,rejected",
      reason: "required_if:status,rejected|string",
    });
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { status, reason } = req.body;
    const { id, documentId } = req.params;

    const employeeDocument = await EmployeeDocument.findOne({
      where: {
        employeeId: id,
        documentId: documentId,
      },
    });

    if (!employeeDocument) {
      return res.apiError("Employee document not found", 404);
    }

    await employeeDocument.update({
      isApproved: status === "approved" ? true : false,
      isVerified: status === "approved" ? true : false,
      approvedBy: req.auth.id,
      approvedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      status: status,
      reason: reason,
    });

    await checkAllDocumentsApproved(id);

    return res.apiSuccess(
      status === "approved"
        ? "Employee document approved successfully"
        : "Employee document rejected successfully",
    );
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: DELETE /admin/employees/:id/documents/:documentId
@Desc: Delete a document for an employee
@Access: Private
*/
exports.deleteEmployeeDocument = async (req, res) => {
  try {
    const employeeDocument = await EmployeeDocument.findOne({
      where: { employeeId: req.params.id, documentId: req.params.documentId },
    });
    if (!employeeDocument) {
      return res.apiError("Employee document not found", 404);
    }

    await employeeDocument.destroy();
    return res.apiSuccess("Employee document deleted successfully");
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: POST /admin/employees/import
@Desc: Bulk import employees from JSON array
@Access: Private
*/
exports.importEmployees = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const data = req.body || [];

    if (!Array.isArray(data) || data.length === 0) {
      await transaction.rollback();
      return res.apiError("No data provided", 400);
    }

    const skippedRecords = [];

    for (const item of data) {
      const existingEmployee = await Employee.findOne({
        where: {
          [Op.or]: [{ email: item.email }, { phone: item.phone }],
        },
        transaction,
      });

      if (existingEmployee) {
        if (existingEmployee.email === item.email) {
          skippedRecords.push({
            ...item,
            reason: "Email already exists",
          });
          continue;
        }

        if (existingEmployee.phone === item.phone) {
          skippedRecords.push({
            ...item,
            reason: "Phone number already exists",
          });
          continue;
        }
      }

      const password = generateTempPassword();

      const fadaId = await generateFadaId(Employee, transaction);

      await Employee.create(
        {
          fadaId,
          name: item.name,
          email: item.email,
          phone: item.phone,
          qualification: item.qualification,
          bloodGroup: item.bloodGroup,

          isProfilePrivate: item.isProfilePrivate ?? false,
          isRegistrationCompleted: item.isRegistrationCompleted ?? true,
          isProfileCompleted: item.isProfileCompleted ?? true,
          isKycCompleted: item.isKycCompleted ?? false,
          isJourneyCompleted: item.isJourneyCompleted ?? false,

          score: item.score,

          isActive: true,
          status: "approved",
          isVerified: true,

          password: await hashPassword(password),
        },
        { transaction },
      );

      await addEmailJob({
        to: item.email,
        subject: "Employee Temporary Password",
        templateName: "temp-password.ejs",
        data: {
          name: item.name,
          password,
        },
      });
    }

    await transaction.commit();

    return res.apiSuccess("Employees imported successfully", skippedRecords);
  } catch (error) {
    await transaction.rollback();

    return res.apiError(error.message, 500, error);
  }
};
