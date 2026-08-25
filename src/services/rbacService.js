const { Op } = require("sequelize");
const {
  Admin,
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

async function loadAdminWithRole(adminId) {
  return Admin.findByPk(adminId, {
    include: [roleInclude],
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
  loadAdminWithRole,
  getAllPermissionKeys,
  getPermissionKeysForRole,
  getPermissionKeysForAdmin,
  adminHasPermission,
  formatAdminAuthPayload,
};
