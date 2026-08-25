const Validator = require("validatorjs");
const { Op } = require("sequelize");
const { Admin, Role } = require("../../../database/models");
const { hashPassword } = require("../../../utils/passwordUtil");
const { roleInclude } = require("../../../services/rbacService");

const staffAttributes = {
  exclude: ["password", "otp", "refreshToken"],
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

const validatePasswordConfirmation = (body, res, passwordRequired = false) => {
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
};

const validateRole = async (roleId, res) => {
  const role = await Role.findOne({
    where: {
      id: roleId,
      isActive: true,
      assignableTo: { [Op.in]: ["staff", "all"] },
    },
  });
  if (!role) {
    res.apiError("Invalid role", 422);
    return null;
  }
  return role;
};

const findStaffOrError = async (id, res) => {
  const staff = await Admin.findByPk(id, {
    attributes: staffAttributes,
    include: [roleInclude],
  });

  if (!staff) {
    res.apiError("Staff member not found", 404);
    return null;
  }

  return staff;
};

/*
@API: GET /admin/staff/roles
@Desc: List staff roles for dropdown
@Access: Private
*/
exports.getStaffRoles = async (_req, res) => {
  try {
    const roles = await Role.findAll({
      attributes: ["id", "name", "key"],
      where: {
        isActive: true,
        assignableTo: { [Op.in]: ["staff", "all"] },
      },
      order: [["name", "ASC"]],
    });

    return res.apiSuccess("Staff roles fetched successfully", roles);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: GET /admin/staff
@Desc: List staff members
@Access: Private
*/
exports.getStaffMembers = async (req, res) => {
  try {
    const { search, roleId, isActive } = req.query;
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const where = {};

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

    const { rows: staff, count: total } = await Admin.findAndCountAll({
      attributes: staffAttributes,
      where,
      include: [roleInclude],
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
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: GET /admin/staff/:id
@Desc: Get staff member by id
@Access: Private
*/
exports.getStaffMemberById = async (req, res) => {
  try {
    const staff = await findStaffOrError(req.params.id, res);
    if (!staff) return;

    return res.apiSuccess("Staff member fetched successfully", staff);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /admin/staff
@Desc: Create staff member
@Access: Private
*/
exports.createStaffMember = async (req, res) => {
  try {
    const validator = new Validator(req.body, createValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    if (!validatePasswordConfirmation(req.body, res, true)) return;

    const role = await validateRole(req.body.roleId, res);
    if (!role) return;

    const existingEmail = await Admin.findOne({
      where: { email: req.body.email },
    });
    if (existingEmail) {
      return res.apiError("A staff member with this email already exists", 409);
    }

    const hashedPassword = await hashPassword(req.body.password);

    const staff = await Admin.create({
      name: req.body.name.trim(),
      email: req.body.email.trim().toLowerCase(),
      phone: req.body.phone || null,
      roleId: req.body.roleId,
      password: hashedPassword,
      isActive: req.body.isActive ?? true,
      mustChangePassword: false,
    });

    const created = await Admin.findByPk(staff.id, {
      attributes: staffAttributes,
      include: [roleInclude],
    });

    return res.apiSuccess("Staff member created successfully", created);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: PUT /admin/staff/:id
@Desc: Update staff member
@Access: Private
*/
exports.updateStaffMember = async (req, res) => {
  try {
    const validator = new Validator(req.body, updateValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    if (!validatePasswordConfirmation(req.body, res)) return;

    const staff = await Admin.findByPk(req.params.id);
    if (!staff) {
      return res.apiError("Staff member not found", 404);
    }

    if (staff.isEditable === false) {
      return res.apiError("This staff member cannot be edited", 400);
    }

    const role = await validateRole(req.body.roleId, res);
    if (!role) return;

    if (
      req.body.email &&
      req.body.email.trim().toLowerCase() !== staff.email
    ) {
      const existingEmail = await Admin.findOne({
        where: { email: req.body.email.trim().toLowerCase() },
      });
      if (existingEmail) {
        return res.apiError("A staff member with this email already exists", 409);
      }
    }

    const payload = {
      name: req.body.name.trim(),
      email: req.body.email.trim().toLowerCase(),
      phone: req.body.phone || null,
      roleId: req.body.roleId,
      isActive: req.body.isActive ?? staff.isActive,
    };

    if (req.body.password) {
      payload.password = await hashPassword(req.body.password);
      payload.mustChangePassword = false;
    }

    await staff.update(payload);

    const updated = await Admin.findByPk(staff.id, {
      attributes: staffAttributes,
      include: [roleInclude],
    });

    return res.apiSuccess("Staff member updated successfully", updated);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: PUT /admin/staff/:id/active-inactive
@Desc: Toggle staff member active status
@Access: Private
*/
exports.toggleStaffActiveStatus = async (req, res) => {
  try {
    const staff = await Admin.findByPk(req.params.id);
    if (!staff) {
      return res.apiError("Staff member not found", 404);
    }

    if (staff.isEditable === false) {
      return res.apiError("This staff member cannot be edited", 400);
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
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: DELETE /admin/staff/:id
@Desc: Delete staff member
@Access: Private
*/
exports.deleteStaffMember = async (req, res) => {
  try {
    const staff = await Admin.findByPk(req.params.id);
    if (!staff) {
      return res.apiError("Staff member not found", 404);
    }

    if (staff.isDeletable === false) {
      return res.apiError("This staff member cannot be deleted", 400);
    }

    if (req.auth?.id === staff.id) {
      return res.apiError("You cannot delete your own account", 400);
    }

    await staff.destroy();

    return res.apiSuccess("Staff member deleted successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};
