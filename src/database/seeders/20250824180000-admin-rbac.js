"use strict";

const {
  MODULES,
  LEGACY_MODULES,
  PERMISSIONS,
  STAFF_ROLE_PERMISSION_KEYS,
  ADMIN_ROLE_ID,
  STAFF_ROLE_ID,
} = require("./data/admin-portal-rbac");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const allModules = [...MODULES, ...LEGACY_MODULES];

    for (const module of allModules) {
      await queryInterface.bulkInsert("Modules", [
        {
          key: module.key,
          name: module.name,
          sortOrder: module.sortOrder,
          isActive: !LEGACY_MODULES.some((legacy) => legacy.key === module.key),
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }

    const [modules] = await queryInterface.sequelize.query("SELECT id, `key` FROM Modules");
    const moduleIdByKey = Object.fromEntries(modules.map((module) => [module.key, module.id]));

    for (const permission of PERMISSIONS) {
      await queryInterface.bulkInsert("Permissions", [
        {
          moduleId: moduleIdByKey[permission.moduleKey],
          key: permission.key,
          name: permission.name,
          action: permission.action,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }

    await queryInterface.sequelize.query(
      "UPDATE Roles SET `key` = 'admin', name = 'Admin', description = 'Full access to every module in the FADA Admin Portal.', assignableTo = 'all', isSystem = true, isSuperRole = true, isActive = true WHERE id = 1",
    );
    await queryInterface.sequelize.query(
      "UPDATE Roles SET `key` = 'staff', name = 'Staff', description = 'FADA staff who manage companies and verify employees.', assignableTo = 'staff', isSystem = true, isSuperRole = false, isActive = true WHERE id = 2",
    );

    const [permissions] = await queryInterface.sequelize.query(
      "SELECT id, `key` FROM Permissions WHERE isActive = true",
    );
    const permissionIdByKey = Object.fromEntries(
      permissions.map((permission) => [permission.key, permission.id]),
    );

    for (const permission of permissions) {
      await queryInterface.bulkInsert("RolePermissions", [
        {
          roleId: ADMIN_ROLE_ID,
          permissionId: permission.id,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }

    for (const key of STAFF_ROLE_PERMISSION_KEYS) {
      const permissionId = permissionIdByKey[key];
      if (!permissionId) continue;

      await queryInterface.bulkInsert("RolePermissions", [
        {
          roleId: STAFF_ROLE_ID,
          permissionId,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }

    await queryInterface.sequelize.query(
      "UPDATE Admins SET roleId = 1, isEditable = false, isDeletable = false WHERE id = 1",
    );
    await queryInterface.sequelize.query(
      "UPDATE Admins SET roleId = COALESCE(roleId, 2), isEditable = true, isDeletable = true WHERE id != 1",
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("RolePermissions", null, {});
    await queryInterface.bulkDelete("Permissions", null, {});
    await queryInterface.bulkDelete("Modules", null, {});
    await queryInterface.sequelize.query(
      "UPDATE Roles SET `key` = NULL, description = NULL, assignableTo = 'staff', isSystem = false, isSuperRole = false, isActive = true",
    );
    await queryInterface.sequelize.query(
      "UPDATE Admins SET isEditable = true, isDeletable = false",
    );
  },
};
