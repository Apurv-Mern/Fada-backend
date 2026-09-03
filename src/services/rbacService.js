const { Op } = require("sequelize");
const {
  Admin,
  Dealer,
  Role,
  Permission,
  Module,
} = require("../database/models");

const roleInclude = {
  model: Role,
  as: "role",
  attributes: [
    "id",
    "key",
    "name",
    "description",
    "assignableTo",
    "isSystem",
    "isSuperRole",
    "isActive",
  ],
};

const dealerRoleInclude = {
  model: Role,
  as: "role",
  attributes: [
    "id",
    "key",
    "name",
    "description",
    "assignableTo",
    "isSystem",
    "isSuperRole",
    "isActive",
  ],
};

async function loadAdminWithRole(adminId) {
  return Admin.findByPk(adminId, {
    include: [roleInclude],
  });
}

async function loadDealerWithRole(dealerId) {
  return Dealer.findByPk(dealerId, {
    include: [dealerRoleInclude],
  });
}

async function validateDealerRole(roleId) {
  return Role.findOne({
    where: {
      id: roleId,
      isActive: true,
      assignableTo: { [Op.in]: ["dealer", "all"] },
    },
  });
}

async function getAllPermissionKeys() {
  const permissions = await Permission.findAll({
    where: { isActive: true },
    attributes: ["key"],
    order: [["key", "ASC"]],
  });
  return permissions.map((permission) => permission.key);
}

async function getPermissionKeysForRole(role) {
  if (!role) return [];
  if (role.isSuperRole) {
    return getAllPermissionKeys();
  }

  const permissions = await role.getPermissions({
    where: { isActive: true },
    attributes: ["key"],
    joinTableAttributes: [],
  });

  return permissions.map((permission) => permission.key);
}

async function getPermissionKeysForAdmin(adminId) {
  const admin = await loadAdminWithRole(adminId);
  if (!admin?.role) return [];
  return getPermissionKeysForRole(admin.role);
}

async function getPermissionKeysForDealer(dealerId) {
  const dealer = await loadDealerWithRole(dealerId);
  if (!dealer?.role) return [];
  return getPermissionKeysForRole(dealer.role);
}

async function getDealerPortalModules() {
  return Module.findAll({
    where: {
      isActive: true,
      key: { [Op.like]: "dealer\\_%" },
    },
    attributes: ["id", "key", "name", "description", "sortOrder"],
    include: [
      {
        model: Permission,
        as: "permissions",
        attributes: ["id", "key", "name", "action"],
        where: { isActive: true },
        required: false,
      },
    ],
    order: [
      ["sortOrder", "ASC"],
      [{ model: Permission, as: "permissions" }, "key", "ASC"],
    ],
  });
}

async function getDealerPortalPermissions() {
  return Permission.findAll({
    where: {
      isActive: true,
      key: { [Op.like]: "dealer\\_%" },
    },
    attributes: ["id", "key", "name", "action", "moduleId"],
    order: [["key", "ASC"]],
  });
}

async function validateDealerPortalPermissionKeys(permissionKeys) {
  if (!Array.isArray(permissionKeys) || permissionKeys.length === 0) {
    return { error: "At least one permission is required" };
  }

  const permissions = await Permission.findAll({
    where: {
      isActive: true,
      [Op.and]: [
        { key: { [Op.in]: permissionKeys } },
        { key: { [Op.like]: "dealer\\_%" } },
      ],
    },
  });

  if (permissions.length !== permissionKeys.length) {
    return {
      error:
        "One or more permission keys are invalid or not allowed for the dealer portal",
    };
  }

  return { permissions };
}

const dealerRoleAssignableFilter = {
  assignableTo: { [Op.in]: ["dealer", "all"] },
};

const dealerRoleManagementFilter = {
  assignableTo: "dealer",
};

async function dealerHasPermission(dealerId, permissionKey) {
  const dealer = await loadDealerWithRole(dealerId);
  if (!dealer?.role || dealer.isActive === false) return false;
  if (dealer.role.isSuperRole) return true;

  const permission = await Permission.findOne({
    where: { key: permissionKey, isActive: true },
    include: [
      {
        model: Role,
        as: "roles",
        where: { id: dealer.roleId },
        through: { attributes: [] },
        required: true,
      },
    ],
  });

  return !!permission;
}

async function adminHasPermission(adminId, permissionKey) {
  const admin = await loadAdminWithRole(adminId);
  if (!admin?.role || admin.isActive === false) return false;
  if (admin.role.isSuperRole) return true;

  const permission = await Permission.findOne({
    where: { key: permissionKey, isActive: true },
    include: [
      {
        model: Role,
        as: "roles",
        where: { id: admin.roleId },
        through: { attributes: [] },
        required: true,
      },
    ],
  });

  return !!permission;
}

function formatAdminAuthPayload(admin, permissions = []) {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    phone: admin.phone,
    profilePicture: admin.profilePicture,
    roleId: admin.roleId,
    role: admin.role
      ? {
          id: admin.role.id,
          key: admin.role.key,
          name: admin.role.name,
          isSuperRole: admin.role.isSuperRole,
        }
      : null,
    isActive: admin.isActive,
    isEditable: admin.isEditable,
    isDeletable: admin.isDeletable,
    mustChangePassword: admin.mustChangePassword,
    permissions,
  };
}

module.exports = {
  roleInclude,
  dealerRoleInclude,
  loadAdminWithRole,
  loadDealerWithRole,
  validateDealerRole,
  getDealerPortalModules,
  getDealerPortalPermissions,
  validateDealerPortalPermissionKeys,
  dealerRoleAssignableFilter,
  dealerRoleManagementFilter,
  getAllPermissionKeys,
  getPermissionKeysForRole,
  getPermissionKeysForAdmin,
  getPermissionKeysForDealer,
  adminHasPermission,
  dealerHasPermission,
  formatAdminAuthPayload,
};
