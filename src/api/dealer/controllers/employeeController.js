const Validator = require("validatorjs");
const { Op } = require("sequelize");
const {
  sequelize,
  Employee,
  EmployeeAssignment,
  OrganizationStructure,
  Document,
  EmployeeDocument,
  EmployeeAddress,
  EmployeeAppreciation,
  EmployeeCertificate,
  EmployeePromotion,
  EmployeeTraining,
  EmployeeSkill,
  Dealer,
  Outlet,
  EmployeeProfileShare,
  EmployeeJourney,
} = require("../../../database/models");
const { generateFadaId } = require("../../../utils/fadaIdUtil");
const {
  employeeAttributes,
  employeeValidationRules,
  buildEmployeeIncludes,
  validateDesignation,
  validateAssignment,
  buildEmployeePayload,
  syncAssignment,
  checkAllDocumentsApproved,
} = require("../../../services/employeeService");

const { generateTempPassword, hashPassword } = require('../../../utils/passwordUtil');
const { addEmailJob } = require('../../../queues');

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

    const assignmentInclude = {
      model: EmployeeAssignment,
      as: "assignment",
      required: true,
      where: {
        dealerId,
        isCurrentlyWorking: true,
        ...(outletId ? { outletId } : {}),
        ...(departmentId ? { departmentId } : {}),
      },
      include: employeeIncludes[0].include,
    };

    const { rows: employees, count: total } = await Employee.findAndCountAll({
      attributes: employeeAttributes,
      where,
      include: [assignmentInclude],
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
@API: GET /dealers/employees/profile/:id
@Desc: Get an employee profile by id
@Access: Private
*/
exports.getEmployeeProfile = async (req, res) => {
  try {
    const dealerId = getDealerId(req);

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
          where: { dealerId },
        },
        {
          model: EmployeeCertificate,
          as: "certificates",
          required: false,
          where: { dealerId },
        },
        {
          model: EmployeePromotion,
          as: "promotions",
          required: false,
          where: { dealerId },
        },
        {
          model: EmployeeTraining,
          as: "trainings",
          required: false,
          where: { dealerId },
        },
        {
          model: EmployeeSkill,
          as: "skills",
          required: false,
          where: { dealerId },
        },
        {
          model: EmployeeJourney,
          as: "journeys",
          required: false,
          where: { dealerId },
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
          isJourneyCompleted: true
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

      if (
        req.body.assignment !== undefined ||
        req.body.designation !== undefined
      ) {
        const existingAssignment = await EmployeeAssignment.findOne({
          where: { employeeId: existingEmployee.id, dealerId },
          transaction,
        });

        await syncAssignment(
          existingEmployee.id,
          {
            dealerId,
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
            dealerId,
          },
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

/*
@API: GET /dealers/employees/joining?search=fada-df-12345
@Desc: Get employees for joining
@Access: Private
*/
exports.getEmployeesForJoining = async (req, res) => {
  try {
    const { search } = req.query;

    const dealerId = getDealerId(req);

    if (!search || String(search).trim() === "") {
      return res.apiError("search query is required", 422);
    }

    const employee = await Employee.findOne({
      where: { fadaId: search },
      attributes: [
        "id",
        "fadaId",
        "name",
        "email",
        "phone",
        "isProfilePrivate",
      ],
    });

    if (!employee) {
      return res.apiError("Employee not found", 404);
    }

    const assignment = await EmployeeAssignment.findOne({
      where: {
        employeeId: employee.id,
        dealerId: dealerId,
        isCurrentlyWorking: true,
      },
    });

    if (assignment) {
      return res.apiError(
        "This employee is already working at your dealership.",
        404,
      );
    }

    const prodileAccess = await EmployeeProfileShare.findOne({
      where: { employeeId: employee.id, dealerId: dealerId, isActive: true },
    });

    if (!prodileAccess && employee.isProfilePrivate) {
      return res.apiError(
        "Employee profile is private and cannot be viewed.",
        404,
      );
    }

    return res.apiSuccess("Employee profile fetched successfully", employee);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: POST /dealers/employees/import
@Desc: Bulk import employees from JSON array
@Access: Private
@Body: [
  { 
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890",  
    "designation": "Software Engineer",
    "department": "Engineering",
    "outletCode": "9876543210",
    "startDate": "2021-01-01", 
  },
  { 
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "phone": "0987654321",  
    "designation": "Software Developer",
    "department": "Engineering",
    "outletCode": "9876543278",
    "startDate": "2021-01-01", 
  }, 
]
@Response:
{
  "message": "Employees imported successfully",
  "data": [
    { "name": "John Doe", "email": "john.doe@example.com", "phone": "1234567890", "reason": "Employee already working presently." },
    { "name": "Jane Doe", "email": "jane.doe@example.com", "phone": "0987654321", "reason": "Employee already working presently." }
  ]
}
*/
exports.importEmployees = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const data = req.body || [];

    const dealerId = getDealerId(req);

    if (!Array.isArray(data) || data.length === 0) {
      await transaction.rollback();
      return res.apiError("No data provided", 400);
    }

    const skippedRecords = [];

    for (const item of data) {
      let existingEmployee = await Employee.findOne({
        where: {
          [Op.or]: [{ email: item.email }, { phone: item.phone }],
        },
        transaction,
      });

      if (!existingEmployee) {
        const password = generateTempPassword();

        const fadaId = await generateFadaId(Employee, transaction);

        existingEmployee = await Employee.create(
          {
            fadaId,
            name: item.name,
            email: item.email,
            phone: item.phone,
            isProfilePrivate: true,
            isRegistrationCompleted: true,
            isActive: true,
            status: "pending",
            isVerified: false,
            password: await hashPassword(password),
          },
          { transaction },
        );
      }

      const existingAssignment = await EmployeeAssignment.findOne({
        where: { employeeId: existingEmployee.id, isCurrentlyWorking: true },
        transaction,
      });

      if (existingAssignment) {
        skippedRecords.push({
          ...item,
          reason: "Employee already working presently.",
        });
        continue;
      }

      const [outlet, department, designation] = await Promise.all([
        Outlet.findOne({
          where: { code: item.outletCode },
          transaction,
        }),
        OrganizationStructure.findOne({
          where: { name: item.department, slug: "department" },
          transaction,
        }),
        OrganizationStructure.findOne({
          where: { name: item.designation, slug: "role" },
          transaction,
        }),
      ]);

      if (!outlet) {
        skippedRecords.push({
          ...item,
          reason: "Outlet not found",
        });
        continue;
      }

      if (!department) {
        skippedRecords.push({
          ...item,
          reason: "Department not found",
        });
        continue;
      }

      if (!designation) {
        skippedRecords.push({
          ...item,
          reason: "Designation not found",
        });
        continue;
      }

      await EmployeeAssignment.create({
        employeeId: existingEmployee.id,
        dealerId: dealerId,
        outletId: outlet.id,
        departmentId: department.id,
        designationId: designation.id,
        startDate: item.startDate,
        endDate: null,
        isCurrentlyWorking: true,
        status: "completed",
        invitationSendBy: "dealer",
        employeementType: "full-time",
        isActive: true,
      });

      await addEmailJob({
        to: item.email,
        subject: "Employee Temporary Password",
        templateName: "emp-temp-password.ejs",
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
