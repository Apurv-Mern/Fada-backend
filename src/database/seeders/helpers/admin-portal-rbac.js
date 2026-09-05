"use strict";

const {
  MODULES,
  LEGACY_MODULES,
  LEGACY_MODULE_KEYS,
  PERMISSIONS,
  STAFF_ROLE_PERMISSION_KEYS,
  LEGACY_PERMISSION_MAP,
  ADMIN_ROLE_ID,
  STAFF_ROLE_ID,
} = require("../data/admin-portal-rbac");

async function loadModuleIdByKey(queryInterface) {
  const [modules] = await queryInterface.sequelize.query("SELECT id, `key` FROM Modules");
  return Object.fromEntries(modules.map((module) => [module.key, module.id]));
}

async function loadPermissionIdByKey(queryInterface, keys) {
  const [permissions] = await queryInterface.sequelize.query(
    "SELECT id, `key` FROM Permissions WHERE `key` IN (:keys)",
    { replacements: { keys } },
  );
  return Object.fromEntries(permissions.map((permission) => [permission.key, permission.id]));
}

async function grantRolePermissions(queryInterface, roleId, permissionIds, now) {
  for (const permissionId of permissionIds) {
    if (!permissionId) continue;

    const [[exists]] = await queryInterface.sequelize.query(
      "SELECT roleId FROM RolePermissions WHERE roleId = :roleId AND permissionId = :permissionId LIMIT 1",
      { replacements: { roleId, permissionId } },
    );
    if (exists) continue;

    await queryInterface.bulkInsert("RolePermissions", [
      {
        roleId,
        permissionId,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }
}

async function applyLegacyPermissionMap(queryInterface, now) {
  for (const mapping of LEGACY_PERMISSION_MAP) {
    const [rolesWithLegacy] = await queryInterface.sequelize.query(
      `
      SELECT DISTINCT rp.roleId
      FROM RolePermissions rp
      INNER JOIN Permissions p ON rp.permissionId = p.id
      WHERE p.\`key\` = :legacyKey
    `,
      { replacements: { legacyKey: mapping.legacy } },
    );

    if (!rolesWithLegacy.length) continue;

    const grantedIds = (
      await loadPermissionIdByKey(queryInterface, [...new Set(mapping.granted)])
    );
    const permissionIds = mapping.granted.map((key) => grantedIds[key]).filter(Boolean);

    for (const role of rolesWithLegacy) {
      await grantRolePermissions(queryInterface, role.roleId, permissionIds, now);
    }
  }
}

async function syncAdminPortalRbac(queryInterface) {
  const now = new Date();
  const allModules = [...MODULES, ...LEGACY_MODULES];

  for (const module of allModules) {
    const isLegacy = LEGACY_MODULE_KEYS.includes(module.key);
    const [[existing]] = await queryInterface.sequelize.query(
      "SELECT id FROM Modules WHERE `key` = :key LIMIT 1",
      { replacements: { key: module.key } },
    );

    if (existing) {
      await queryInterface.sequelize.query(
        "UPDATE Modules SET name = :name, sortOrder = :sortOrder, isActive = :isActive, updatedAt = :updatedAt WHERE `key` = :key",
        {
          replacements: {
            key: module.key,
            name: module.name,
            sortOrder: module.sortOrder,
            isActive: !isLegacy,
            updatedAt: now,
          },
        },
      );
      continue;
    }

    await queryInterface.bulkInsert("Modules", [
      {
        key: module.key,
        name: module.name,
        sortOrder: module.sortOrder,
        isActive: !isLegacy,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }

  const moduleIdByKey = await loadModuleIdByKey(queryInterface);

  for (const permission of PERMISSIONS) {
    const moduleId = moduleIdByKey[permission.moduleKey];
    if (!moduleId) continue;

    const [[existing]] = await queryInterface.sequelize.query(
      "SELECT id FROM Permissions WHERE `key` = :key LIMIT 1",
      { replacements: { key: permission.key } },
    );

    if (existing) {
      await queryInterface.sequelize.query(
        "UPDATE Permissions SET moduleId = :moduleId, name = :name, action = :action, isActive = true, updatedAt = :updatedAt WHERE `key` = :key",
        {
          replacements: {
            key: permission.key,
            moduleId,
            name: permission.name,
            action: permission.action,
            updatedAt: now,
          },
        },
      );
      continue;
    }

    await queryInterface.bulkInsert("Permissions", [
      {
        moduleId,
        key: permission.key,
        name: permission.name,
        action: permission.action,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }

  const permissionIdByKey = await loadPermissionIdByKey(
    queryInterface,
    PERMISSIONS.map((permission) => permission.key),
  );

  await grantRolePermissions(
    queryInterface,
    ADMIN_ROLE_ID,
    PERMISSIONS.map((permission) => permissionIdByKey[permission.key]),
    now,
  );

  await grantRolePermissions(
    queryInterface,
    STAFF_ROLE_ID,
    STAFF_ROLE_PERMISSION_KEYS.map((key) => permissionIdByKey[key]),
    now,
  );

  await applyLegacyPermissionMap(queryInterface, now);
}

module.exports = {
  syncAdminPortalRbac,
};
