const Validator = require("validatorjs");
const { Op } = require("sequelize");
const { Dealer, DealerRole, Permission } = require("../../../database/models");
const {
  validateDealerPortalPermissionKeys,
  buildDealerRoleAccessFilter,
  buildDealerOwnedRoleFilter,
} = require("../../../services/rbacService");

const roleAttributes = [
  "id",
  "key",
  "name",
  "description",
  "dealerId",
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

const getCompanyDealerId = (req) => req.currentDealerId;

function ensurePrimaryDealerCanMutate(req, res) {
  if (req.auth?.userType === "staff") {
    res.apiError("Only the primary dealer account can manage roles", 403);
    return false;
  }
  return true;
}

function formatRole(role) {
  const plain = role.toJSON();
  return {
    ...plain,
    permissions: (plain.permissions || []).map((permission) => permission.key),
  };
}

async function findAccessibleDealerRoleOrError(id, companyDealerId, res) {
  const role = await DealerRole.findOne({
    attributes: roleAttributes,
    where: {
      id,
      ...buildDealerRoleAccessFilter(companyDealerId),
    },
    include: [permissionInclude],
  });

  if (!role) {
    res.apiError("Role not found", 404);
    return null;
  }

  return role;
}

async function findOwnedDealerRoleOrError(id, companyDealerId, res) {
  const role = await DealerRole.findOne({
    attributes: roleAttributes,
    where: {
      id,
      ...buildDealerOwnedRoleFilter(companyDealerId),
    },
    include: [permissionInclude],
  });

  if (!role) {
    res.apiError("Role not found", 404);
    return null;
  }

  return role;
}

/*
@API: GET /dealers/roles
@Desc: List dealer portal roles with permission keys
@Access: Private
*/
exports.getRoles = async (req, res) => {
  try {
    const companyDealerId = getCompanyDealerId(req);
    const { search, isActive } = req.query;
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const accessFilter = buildDealerRoleAccessFilter(companyDealerId);
    const where = { ...accessFilter };

    if (search) {
      where[Op.and] = [
        accessFilter,
        {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { key: { [Op.like]: `%${search}%` } },
          ],
        },
      ];
      delete where[Op.or];
    }

    if (isActive !== undefined && isActive !== "") {
      where.isActive = isActive === "true" || isActive === "1";
    }

    const { rows: roles, count: total } = await DealerRole.findAndCountAll({
      attributes: roleAttributes,
      where,
      include: [permissionInclude],
      order: [
        ["isSystem", "DESC"],
        ["name", "ASC"],
      ],
      limit,
      offset,
      distinct: true,
    });

    return res.apiSuccess("Roles fetched successfully", {
      roles: roles.map(formatRole),
      pagination: { total, limit, offset },
    });
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /dealers/roles/:id
@Desc: Get dealer portal role by id
@Access: Private
*/
exports.getRoleById = async (req, res) => {
  try {
    const role = await findAccessibleDealerRoleOrError(
      req.params.id,
      getCompanyDealerId(req),
      res,
    );
    if (!role) return;

    return res.apiSuccess("Role fetched successfully", formatRole(role));
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: POST /dealers/roles
@Desc: Create custom dealer portal role
@Access: Private
*/
exports.createRole = async (req, res) => {
  try {
    if (!ensurePrimaryDealerCanMutate(req, res)) return;

    const companyDealerId = getCompanyDealerId(req);

    const validator = new Validator(req.body, {
      key: "required|string|regex:/^[a-z0-9_-]+$/",
      name: "required|string",
      description: "string",
      permissions: "required|array",
      isActive: "boolean",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const roleKey = req.body.key.trim().toLowerCase();

    const existing = await DealerRole.findOne({
      where: {
        key: roleKey,
        [Op.or]: [
          { dealerId: companyDealerId },
          { dealerId: null, isSystem: true },
        ],
      },
    });

    if (existing) {
      return res.apiError("A role with this key already exists", 409);
    }

    const validation = await validateDealerPortalPermissionKeys(
      req.body.permissions,
    );
    if (validation.error) {
      return res.apiError(validation.error, 422);
    }

    const role = await DealerRole.create({
      key: roleKey,
      name: req.body.name.trim(),
      description: req.body.description || null,
      dealerId: companyDealerId,
      isSystem: false,
      isSuperRole: false,
      isActive: req.body.isActive ?? true,
    });

    await role.setPermissions(validation.permissions);

    const created = await findOwnedDealerRoleOrError(role.id, companyDealerId, res);
    return res.apiSuccess("Role created successfully", formatRole(created));
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /dealers/roles/:id
@Desc: Update dealer portal role and replace permissions
@Access: Private
*/
exports.updateRole = async (req, res) => {
  try {
    if (!ensurePrimaryDealerCanMutate(req, res)) return;

    const companyDealerId = getCompanyDealerId(req);

    const validator = new Validator(req.body, {
      name: "required|string",
      description: "string",
      permissions: "required|array",
      isActive: "boolean",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const role = await DealerRole.findOne({
      where: {
        id: req.params.id,
        ...buildDealerOwnedRoleFilter(companyDealerId),
      },
    });

    if (!role) {
      return res.apiError("Role not found", 404);
    }

    if (role.isSystem) {
      return res.apiError("System roles cannot be updated", 400);
    }

    const validation = await validateDealerPortalPermissionKeys(
      req.body.permissions,
    );
    if (validation.error) {
      return res.apiError(validation.error, 422);
    }

    await role.update({
      name: req.body.name.trim(),
      description: req.body.description || null,
      isActive: req.body.isActive ?? role.isActive,
    });

    if (!role.isSuperRole) {
      await role.setPermissions(validation.permissions);
    }

    const updated = await findOwnedDealerRoleOrError(role.id, companyDealerId, res);
    return res.apiSuccess("Role updated successfully", formatRole(updated));
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: DELETE /dealers/roles/:id
@Desc: Delete custom dealer portal role
@Access: Private
*/
exports.deleteRole = async (req, res) => {
  try {
    if (!ensurePrimaryDealerCanMutate(req, res)) return;

    const companyDealerId = getCompanyDealerId(req);

    const role = await DealerRole.findOne({
      where: {
        id: req.params.id,
        ...buildDealerOwnedRoleFilter(companyDealerId),
      },
    });

    if (!role) {
      return res.apiError("Role not found", 404);
    }

    if (role.isSystem) {
      return res.apiError("System roles cannot be deleted", 400);
    }

    const assignedCount = await Dealer.count({
      where: {
        dealerRoleId: role.id,
        userType: "staff",
        parentDealerId: companyDealerId,
      },
    });

    if (assignedCount > 0) {
      return res.apiError(
        "Role is assigned to staff members and cannot be deleted",
        400,
      );
    }

    await role.destroy();
    return res.apiSuccess("Role deleted successfully");
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};
