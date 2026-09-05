const { Op } = require("sequelize");
const {
  Admin,
  Dealer,
  Role,
  DealerRole,
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
  model: DealerRole,
  as: "dealerRole",
  attributes: [
    "id",
    "key",
    "name",
    "description",
    "dealerId",
    "isSystem",
    "isSuperRole",
    "isActive",
  ],
};

const adminRoleAssignableFilter = {
  assignableTo: { [Op.in]: ["staff", "all"] },
};

function buildDealerRoleAccessFilter(companyDealerId) {
  return {
    [Op.or]: [
      { dealerId: null, isSystem: true },
      { dealerId: companyDealerId },
    ],
  };
}

function buildDealerOwnedRoleFilter(companyDealerId) {
  return { dealerId: companyDealerId };
}

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

async function validateDealerRole(dealerRoleId, companyDealerId) {
  return DealerRole.findOne({
    where: {
      id: dealerRoleId,
      isActive: true,
      ...buildDealerRoleAccessFilter(companyDealerId),
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

async function getDealerPermissionKeysForRole(dealerRole) {
  if (!dealerRole) return [];
  if (dealerRole.isSuperRole) {
    const permissions = await Permission.findAll({
      where: {
        isActive: true,
        key: { [Op.like]: "dealer\\_%" },
      },
      attributes: ["key"],
      order: [["key", "ASC"]],
    });
    return permissions.map((permission) => permission.key);
  }

  const permissions = await dealerRole.getPermissions({
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
  if (!dealer?.dealerRole) return [];
  return getDealerPermissionKeysForRole(dealer.dealerRole);
}

async function getAdminPortalModules() {
  return Module.findAll({
    where: {
      isActive: true,
      key: { [Op.notLike]: "dealer\\_%" },
    },
    attributes: ["id", "key", "name", "description", "sortOrder"],
    include: [
      {
        model: Permission,
        as: "permissions",
        attributes: ["id", "key", "name", "action"],
        where: {
          isActive: true,
          key: { [Op.notLike]: "dealer\\_%" },
        },
        required: false,
      },
    ],
    order: [
      ["sortOrder", "ASC"],
      [{ model: Permission, as: "permissions" }, "key", "ASC"],
    ],
  });
}

async function getAdminPortalPermissions() {
  return Permission.findAll({
    where: {
      isActive: true,
      key: { [Op.notLike]: "dealer\\_%" },
    },
    attributes: ["id", "key", "name", "action", "moduleId"],
    order: [["key", "ASC"]],
  });
}

async function validateAdminPortalPermissionKeys(permissionKeys) {
  if (!Array.isArray(permissionKeys) || permissionKeys.length === 0) {
    return { error: "At least one permission is required" };
  }

  const permissions = await Permission.findAll({
    where: {
      isActive: true,
      [Op.and]: [
        { key: { [Op.in]: permissionKeys } },
        { key: { [Op.notLike]: "dealer\\_%" } },
      ],
    },
  });

  if (permissions.length !== permissionKeys.length) {
    return {
      error:
        "One or more permission keys are invalid or not allowed for the admin portal",
    };
  }

  return { permissions };
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

async function dealerHasPermission(dealerId, permissionKey) {
  const dealer = await loadDealerWithRole(dealerId);
  if (!dealer?.dealerRole || dealer.isActive === false) return false;
  if (dealer.dealerRole.isSuperRole) return true;

  const permission = await Permission.findOne({
    where: { key: permissionKey, isActive: true },
    include: [
      {
        model: DealerRole,
        as: "dealerRoles",
        where: { id: dealer.dealerRoleId },
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

async function adminHasAnyPermission(adminId, permissionKeys = []) {
  if (!Array.isArray(permissionKeys) || permissionKeys.length === 0) return false;

  for (const permissionKey of permissionKeys) {
    if (await adminHasPermission(adminId, permissionKey)) {
      return true;
    }
  }

  return false;
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
  adminRoleAssignableFilter,
  buildDealerRoleAccessFilter,
  buildDealerOwnedRoleFilter,
  loadAdminWithRole,
  loadDealerWithRole,
  validateDealerRole,
  getAdminPortalModules,
  getAdminPortalPermissions,
  validateAdminPortalPermissionKeys,
  getDealerPortalModules,
  getDealerPortalPermissions,
  validateDealerPortalPermissionKeys,
  getAllPermissionKeys,
  getPermissionKeysForRole,
  getDealerPermissionKeysForRole,
  getPermissionKeysForAdmin,
  getPermissionKeysForDealer,
  adminHasPermission,
  adminHasAnyPermission,
  dealerHasPermission,
  formatAdminAuthPayload,
};
