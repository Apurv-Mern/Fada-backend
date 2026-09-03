const Validator = require("validatorjs");
const { Op } = require("sequelize");
const { Dealer, Role } = require("../../../database/models");
const {
  hashPassword,
  generateTempPassword,
} = require("../../../utils/passwordUtil");
const { addEmailJob } = require("../../../queues");
const {
  dealerRoleInclude,
  validateDealerRole,
} = require("../../../services/rbacService");

const staffAttributes = {
  exclude: [
    "password",
    "otp",
    "refreshToken",
    "emailOTP",
    "mpin",
  ],
};

const createValidationRules = {
  name: "required|string",
  email: "required|email",
  phone: "string",
  roleId: "required|integer",
  password: "required|string|min:8",
  confirmPassword: "required|string|min:8",
  isActive: "boolean",
};

const updateValidationRules = {
  name: "required|string",
  email: "required|email",
  phone: "string",
  roleId: "required|integer",
  password: "string|min:8",
  confirmPassword: "string|min:8",
  isActive: "boolean",
};

const getCompanyDealerId = (req) => req.currentDealerId;

function ensurePrimaryDealerCanMutate(req, res) {
  if (req.auth?.userType === "staff") {
    res.apiError("Only the primary dealer account can manage staff members", 403);
    return false;
  }
  return true;
}

function validatePasswordConfirmation(body, res, passwordRequired = false) {
  const { password, confirmPassword } = body;

  if (passwordRequired && !password) {
    res.apiError("Password is required", 422);
    return false;
  }

  if (password || confirmPassword) {
    if (!password || !confirmPassword) {
      res.apiError("Password and confirm password are required", 422);
      return false;
    }
    if (password !== confirmPassword) {
      res.apiError("Password and confirm password do not match", 422);
      return false;
    }
  }

  return true;
}

async function findCompanyStaffOrError(id, companyDealerId, res) {
  const staff = await Dealer.findOne({
    where: {
      id,
      parentDealerId: companyDealerId,
      userType: "staff",
    },
    attributes: staffAttributes,
    include: [dealerRoleInclude],
  });

  if (!staff) {
    res.apiError("Staff member not found", 404);
    return null;
  }

  return staff;
}

/*
@API: GET /dealers/staff/roles
@Desc: List dealer-assignable roles
@Access: Private
*/
exports.getStaffRoles = async (_req, res) => {
  try {
    const roles = await Role.findAll({
      attributes: ["id", "name", "key", "description", "isSuperRole"],
      where: {
        isActive: true,
        assignableTo: { [Op.in]: ["dealer", "all"] },
      },
      order: [["name", "ASC"]],
    });

    return res.apiSuccess("Staff roles fetched successfully", roles);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /dealers/staff
@Desc: List dealer staff members
@Access: Private
*/
exports.getStaffMembers = async (req, res) => {
  try {
    const companyDealerId = getCompanyDealerId(req);
    const { search, roleId, isActive } = req.query;
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const where = {
      parentDealerId: companyDealerId,
      userType: "staff",
    };

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    if (roleId) {
      where.roleId = roleId;
    }

    if (isActive !== undefined && isActive !== "") {
      where.isActive = isActive === "true" || isActive === "1";
    }

    const { rows: staff, count: total } = await Dealer.findAndCountAll({
      attributes: staffAttributes,
      where,
      include: [dealerRoleInclude],
      order: [["id", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    return res.apiSuccess("Staff members fetched successfully", {
      staff,
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
@API: GET /dealers/staff/:id
@Desc: Get dealer staff member by id
@Access: Private
*/
exports.getStaffMemberById = async (req, res) => {
  try {
    const staff = await findCompanyStaffOrError(
      req.params.id,
      getCompanyDealerId(req),
      res,
    );
    if (!staff) return;

    return res.apiSuccess("Staff member fetched successfully", staff);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: POST /dealers/staff
@Desc: Create dealer staff member
@Access: Private
*/
exports.createStaffMember = async (req, res) => {
  try {
    if (!ensurePrimaryDealerCanMutate(req, res)) return;

    const validator = new Validator(req.body, createValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    if (!validatePasswordConfirmation(req.body, res, true)) return;

    const role = await validateDealerRole(req.body.roleId);
    if (!role) {
      return res.apiError("Invalid role", 422);
    }

    const email = req.body.email.trim().toLowerCase();
    const existingEmail = await Dealer.findOne({ where: { email } });
    if (existingEmail) {
      return res.apiError("A user with this email already exists", 409);
    }

    const password = req.body.password || generateTempPassword();
    const hashedPassword = await hashPassword(password);
    const companyDealerId = getCompanyDealerId(req);

    const staff = await Dealer.create({
      name: req.body.name.trim(),
      email,
      phone: req.body.phone || null,
      roleId: req.body.roleId,
      password: hashedPassword,
      userType: "staff",
      parentDealerId: companyDealerId,
      dealerId: null,
      dealerCode: null,
      status: "approved",
      isActive: req.body.isActive ?? true,
      isEmailVerified: true,
      mustChangePassword: false,
    });

    await addEmailJob({
      to: email,
      subject: "Dealer Portal Temporary Password",
      templateName: "temp-password.ejs",
      data: {
        name: req.body.name.trim(),
        tempPassword: password,
      },
    });

    const created = await Dealer.findByPk(staff.id, {
      attributes: staffAttributes,
      include: [dealerRoleInclude],
    });

    return res.apiSuccess("Staff member created successfully", created);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /dealers/staff/:id
@Desc: Update dealer staff member
@Access: Private
*/
exports.updateStaffMember = async (req, res) => {
  try {
    if (!ensurePrimaryDealerCanMutate(req, res)) return;

    const validator = new Validator(req.body, updateValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    if (!validatePasswordConfirmation(req.body, res)) return;

    const companyDealerId = getCompanyDealerId(req);
    const staff = await Dealer.findOne({
      where: {
        id: req.params.id,
        parentDealerId: companyDealerId,
        userType: "staff",
      },
    });

    if (!staff) {
      return res.apiError("Staff member not found", 404);
    }

    const role = await validateDealerRole(req.body.roleId);
    if (!role) {
      return res.apiError("Invalid role", 422);
    }

    const email = req.body.email.trim().toLowerCase();
    if (email !== staff.email) {
      const existingEmail = await Dealer.findOne({ where: { email } });
      if (existingEmail) {
        return res.apiError("A user with this email already exists", 409);
      }
    }

    const payload = {
      name: req.body.name.trim(),
      email,
      phone: req.body.phone || null,
      roleId: req.body.roleId,
      isActive: req.body.isActive ?? staff.isActive,
    };

    if (req.body.password) {
      payload.password = await hashPassword(req.body.password);
      payload.mustChangePassword = false;
    }

    await staff.update(payload);

    const updated = await Dealer.findByPk(staff.id, {
      attributes: staffAttributes,
      include: [dealerRoleInclude],
    });

    return res.apiSuccess("Staff member updated successfully", updated);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /dealers/staff/:id/active-inactive
@Desc: Toggle dealer staff active status
@Access: Private
*/
exports.toggleStaffActiveStatus = async (req, res) => {
  try {
    if (!ensurePrimaryDealerCanMutate(req, res)) return;

    const companyDealerId = getCompanyDealerId(req);
    const staff = await Dealer.findOne({
      where: {
        id: req.params.id,
        parentDealerId: companyDealerId,
        userType: "staff",
      },
    });

    if (!staff) {
      return res.apiError("Staff member not found", 404);
    }

    if (req.auth?.id === staff.id) {
      return res.apiError("You cannot change your own active status", 400);
    }

    await staff.update({ isActive: !staff.isActive });

    return res.apiSuccess(
      staff.isActive
        ? "Staff member activated successfully"
        : "Staff member deactivated successfully",
      { id: staff.id, isActive: staff.isActive },
    );
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: DELETE /dealers/staff/:id
@Desc: Delete dealer staff member
@Access: Private
*/
exports.deleteStaffMember = async (req, res) => {
  try {
    if (!ensurePrimaryDealerCanMutate(req, res)) return;

    const companyDealerId = getCompanyDealerId(req);
    const staff = await Dealer.findOne({
      where: {
        id: req.params.id,
        parentDealerId: companyDealerId,
        userType: "staff",
      },
    });

    if (!staff) {
      return res.apiError("Staff member not found", 404);
    }

    if (req.auth?.id === staff.id) {
      return res.apiError("You cannot delete your own account", 400);
    }

    await staff.destroy();

    return res.apiSuccess("Staff member deleted successfully");
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};
