const Validator = require("validatorjs");
const { Op } = require("sequelize");
const { Role, Permission, Admin } = require("../../../database/models");

const roleAttributes = [
  "id",
  "key",
  "name",
  "description",
  "assignableTo",
  "isSystem",
  "isSuperRole",
  "isActive",
  "createdAt",
  "updatedAt",
];

const permissionInclude = {
  model: Permission,
  as: "permissions",
  attributes: ["id", "key", "name", "action"],
  through: { attributes: [] },
  where: { isActive: true },
  required: false,
};

const formatRole = (role) => {
  const plain = role.toJSON();
  return {
    ...plain,
    permissions: (plain.permissions || []).map((permission) => permission.key),
  };
};

const findRoleOrError = async (id, res) => {
  const role = await Role.findByPk(id, {
    attributes: roleAttributes,
    include: [permissionInclude],
  });

  if (!role) {
    res.apiError("Role not found", 404);
    return null;
  }

  return role;
};

const validatePermissionKeys = async (permissionKeys, res) => {
  if (!Array.isArray(permissionKeys) || permissionKeys.length === 0) {
    res.apiError("At least one permission is required", 422);
    return null;
  }

  const permissions = await Permission.findAll({
    where: {
      key: { [Op.in]: permissionKeys },
      isActive: true,
    },
  });

  if (permissions.length !== permissionKeys.length) {
    res.apiError("One or more permission keys are invalid", 422);
    return null;
  }

  return permissions;
};

/*
@API: GET /admin/roles
@Desc: List roles with permission keys
@Access: Private
*/
exports.getRoles = async (req, res) => {
  try {
    const { search, isActive } = req.query;
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { key: { [Op.like]: `%${search}%` } },
      ];
    }
    if (isActive !== undefined && isActive !== "") {
      where.isActive = isActive === "true" || isActive === "1";
    }

    const { rows: roles, count: total } = await Role.findAndCountAll({
      attributes: roleAttributes,
      where,
      include: [permissionInclude],
      order: [["id", "ASC"]],
      limit,
      offset,
      distinct: true,
    });

    return res.apiSuccess("Roles fetched successfully", {
      roles: roles.map(formatRole),
      pagination: { total, limit, offset },
    });
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: GET /admin/roles/:id
@Desc: Get role by id
@Access: Private
*/
exports.getRoleById = async (req, res) => {
  try {
    const role = await findRoleOrError(req.params.id, res);
    if (!role) return;
    return res.apiSuccess("Role fetched successfully", formatRole(role));
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /admin/roles
@Desc: Create custom role
@Access: Private
*/
exports.createRole = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      key: "required|string|regex:/^[a-z0-9_-]+$/",
      name: "required|string",
      description: "string",
      assignableTo: "required|in:staff,all",
      permissions: "required|array",
      isActive: "boolean",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const existing = await Role.findOne({ where: { key: req.body.key } });
    if (existing) {
      return res.apiError("A role with this key already exists", 409);
    }

    const permissions = await validatePermissionKeys(req.body.permissions, res);
    if (!permissions) return;

    const role = await Role.create({
      key: req.body.key.trim().toLowerCase(),
      name: req.body.name.trim(),
      description: req.body.description || null,
      assignableTo: req.body.assignableTo,
      isSystem: false,
      isSuperRole: false,
      isActive: req.body.isActive ?? true,
    });

    await role.setPermissions(permissions);

    const created = await findRoleOrError(role.id, res);
    return res.apiSuccess("Role created successfully", formatRole(created));
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: PUT /admin/roles/:id
@Desc: Update role and replace permissions
@Access: Private
*/
exports.updateRole = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      name: "required|string",
      description: "string",
      assignableTo: "required|in:staff,all",
      permissions: "required|array",
      isActive: "boolean",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.apiError("Role not found", 404);
    }

    if (role.isSystem && req.body.key && req.body.key !== role.key) {
      return res.apiError("System role key cannot be changed", 400);
    }

    const permissions = await validatePermissionKeys(req.body.permissions, res);
    if (!permissions) return;

    await role.update({
      name: req.body.name.trim(),
      description: req.body.description || null,
      assignableTo: req.body.assignableTo,
      isActive: role.isSystem ? role.isActive : (req.body.isActive ?? role.isActive),
    });

    if (!role.isSuperRole) {
      await role.setPermissions(permissions);
    }

    const updated = await findRoleOrError(role.id, res);
    return res.apiSuccess("Role updated successfully", formatRole(updated));
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: DELETE /admin/roles/:id
@Desc: Delete custom role
@Access: Private
*/
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.apiError("Role not found", 404);
    }

    if (role.isSystem) {
      return res.apiError("System roles cannot be deleted", 400);
    }

    const assignedCount = await Admin.count({ where: { roleId: role.id } });
    if (assignedCount > 0) {
      return res.apiError("Role is assigned to staff members and cannot be deleted", 400);
    }

    await role.destroy();
    return res.apiSuccess("Role deleted successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};
