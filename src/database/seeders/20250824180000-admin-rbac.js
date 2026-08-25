"use strict";

const MODULES = [
  { key: "dashboard", name: "Dashboard", sortOrder: 1 },
  { key: "dealers", name: "Companies", sortOrder: 2 },
  { key: "employees", name: "Employees", sortOrder: 3 },
  { key: "staff", name: "Staff Members", sortOrder: 4 },
  { key: "masters", name: "Masters", sortOrder: 5 },
  { key: "score", name: "Score Engine", sortOrder: 6 },
  { key: "communications", name: "Communications", sortOrder: 7 },
  { key: "roles", name: "Roles & Permissions", sortOrder: 8 },
  { key: "settings", name: "Settings", sortOrder: 9 },
];

const PERMISSIONS = [
  { moduleKey: "dashboard", key: "dashboard.view", name: "View dashboard", action: "view" },
  { moduleKey: "dealers", key: "dealers.view", name: "View companies", action: "view" },
  { moduleKey: "dealers", key: "dealers.create", name: "Create companies", action: "create" },
  { moduleKey: "dealers", key: "dealers.edit", name: "Edit companies", action: "edit" },
  { moduleKey: "dealers", key: "dealers.delete", name: "Delete companies", action: "delete" },
  { moduleKey: "dealers", key: "dealers.approve", name: "Approve company registrations", action: "approve" },
  { moduleKey: "employees", key: "employees.view", name: "View employees", action: "view" },
  { moduleKey: "employees", key: "employees.verify", name: "Verify employment", action: "verify" },
  { moduleKey: "staff", key: "staff.view", name: "View staff members", action: "view" },
  { moduleKey: "staff", key: "staff.create", name: "Create staff members", action: "create" },
  { moduleKey: "staff", key: "staff.edit", name: "Edit staff members", action: "edit" },
  { moduleKey: "staff", key: "staff.delete", name: "Delete staff members", action: "delete" },
  { moduleKey: "masters", key: "masters.view", name: "View masters", action: "view" },
  { moduleKey: "masters", key: "masters.manage", name: "Manage masters", action: "manage" },
  { moduleKey: "score", key: "score.view", name: "View score engine", action: "view" },
  { moduleKey: "score", key: "score.manage", name: "Manage score engine", action: "manage" },
  { moduleKey: "communications", key: "communications.view", name: "View communications", action: "view" },
  { moduleKey: "communications", key: "communications.manage", name: "Manage communications", action: "manage" },
  { moduleKey: "roles", key: "roles.manage", name: "Manage roles & permissions", action: "manage" },
  { moduleKey: "settings", key: "settings.manage", name: "Manage settings", action: "manage" },
];

const STAFF_ROLE_PERMISSION_KEYS = [
  "dashboard.view",
  "dealers.view",
  "dealers.edit",
  "dealers.approve",
  "employees.view",
  "employees.verify",
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    for (const module of MODULES) {
      await queryInterface.bulkInsert("Modules", [
        {
          key: module.key,
          name: module.name,
          sortOrder: module.sortOrder,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }

    const [modules] = await queryInterface.sequelize.query(
      "SELECT id, `key` FROM Modules",
    );
    const moduleIdByKey = Object.fromEntries(modules.map((m) => [m.key, m.id]));

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
      permissions.map((p) => [p.key, p.id]),
    );

    for (const permission of permissions) {
      await queryInterface.bulkInsert("RolePermissions", [
        {
          roleId: 1,
          permissionId: permission.id,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }

    for (const key of STAFF_ROLE_PERMISSION_KEYS) {
      await queryInterface.bulkInsert("RolePermissions", [
        {
          roleId: 2,
          permissionId: permissionIdByKey[key],
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
