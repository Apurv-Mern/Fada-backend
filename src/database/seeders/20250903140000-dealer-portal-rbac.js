"use strict";

const MODULES = [
  { key: "dealer_dashboard", name: "Dashboard", sortOrder: 101 },
  { key: "dealer_company_profile", name: "Company Profile", sortOrder: 102 },
  { key: "dealer_outlets", name: "Outlets", sortOrder: 103 },
  { key: "dealer_employees", name: "Employees", sortOrder: 104 },
  {
    key: "dealer_employment_requests",
    name: "Employment Requests",
    sortOrder: 105,
  },
  { key: "dealer_reports", name: "Reports", sortOrder: 106 },
  { key: "dealer_communications", name: "Communications", sortOrder: 107 },
  { key: "dealer_settings", name: "Settings", sortOrder: 108 },
];

const PERMISSIONS = [
  {
    moduleKey: "dealer_dashboard",
    key: "dealer_dashboard.view",
    name: "View dashboard",
    action: "view",
  },
  {
    moduleKey: "dealer_company_profile",
    key: "dealer_company_profile.view",
    name: "View company profile",
    action: "view",
  },
  {
    moduleKey: "dealer_company_profile",
    key: "dealer_company_profile.edit",
    name: "Edit company profile",
    action: "edit",
  },
  {
    moduleKey: "dealer_outlets",
    key: "dealer_outlets.view",
    name: "View outlets",
    action: "view",
  },
  {
    moduleKey: "dealer_outlets",
    key: "dealer_outlets.manage",
    name: "Manage outlets",
    action: "manage",
  },
  {
    moduleKey: "dealer_employees",
    key: "dealer_employees.view",
    name: "View employees",
    action: "view",
  },
  {
    moduleKey: "dealer_employees",
    key: "dealer_employees.manage",
    name: "Manage employees",
    action: "manage",
  },
  {
    moduleKey: "dealer_employment_requests",
    key: "dealer_employment_requests.view",
    name: "View employment requests",
    action: "view",
  },
  {
    moduleKey: "dealer_employment_requests",
    key: "dealer_employment_requests.manage",
    name: "Manage employment requests",
    action: "manage",
  },
  {
    moduleKey: "dealer_reports",
    key: "dealer_reports.view",
    name: "View reports",
    action: "view",
  },
  {
    moduleKey: "dealer_reports",
    key: "dealer_reports.export",
    name: "Export reports",
    action: "export",
  },
  {
    moduleKey: "dealer_communications",
    key: "dealer_communications.view",
    name: "View communications",
    action: "view",
  },
  {
    moduleKey: "dealer_settings",
    key: "dealer_settings.manage",
    name: "Manage settings",
    action: "manage",
  },
  {
    moduleKey: "dealer_settings",
    key: "dealer_staff.view",
    name: "View staff members",
    action: "view",
  },
  {
    moduleKey: "dealer_settings",
    key: "dealer_staff.create",
    name: "Create staff members",
    action: "create",
  },
  {
    moduleKey: "dealer_settings",
    key: "dealer_staff.edit",
    name: "Edit staff members",
    action: "edit",
  },
  {
    moduleKey: "dealer_settings",
    key: "dealer_staff.delete",
    name: "Delete staff members",
    action: "delete",
  },
];

const DEALER_ROLES = [
  {
    key: "dealer_admin",
    name: "Dealer Admin",
    description: "Full access to the dealer portal.",
    assignableTo: "dealer",
    isSystem: true,
    isSuperRole: true,
    permissionKeys: PERMISSIONS.map((item) => item.key),
  },
  {
    key: "dealer_manager",
    name: "Dealer Manager",
    description: "Manage outlets, employees, employment requests, and reports.",
    assignableTo: "dealer",
    isSystem: true,
    isSuperRole: false,
    permissionKeys: [
      "dealer_dashboard.view",
      "dealer_company_profile.view",
      "dealer_company_profile.edit",
      "dealer_outlets.view",
      "dealer_outlets.manage",
      "dealer_employees.view",
      "dealer_employees.manage",
      "dealer_employment_requests.view",
      "dealer_employment_requests.manage",
      "dealer_reports.view",
      "dealer_reports.export",
      "dealer_communications.view",
      "dealer_staff.view",
    ],
  },
  {
    key: "dealer_viewer",
    name: "Dealer Viewer",
    description: "Read-only access to the dealer portal.",
    assignableTo: "dealer",
    isSystem: true,
    isSuperRole: false,
    permissionKeys: [
      "dealer_dashboard.view",
      "dealer_company_profile.view",
      "dealer_outlets.view",
      "dealer_employees.view",
      "dealer_employment_requests.view",
      "dealer_reports.view",
      "dealer_communications.view",
      "dealer_staff.view",
    ],
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [[existingModule]] = await queryInterface.sequelize.query(
      "SELECT id FROM Modules WHERE `key` = 'dealer_dashboard' LIMIT 1",
    );
    if (existingModule) return;

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
      "SELECT id, `key` FROM Modules WHERE `key` LIKE 'dealer_%'",
    );
    const moduleIdByKey = Object.fromEntries(modules.map((item) => [item.key, item.id]));

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

    const [permissionRows] = await queryInterface.sequelize.query(
      "SELECT id, `key` FROM Permissions WHERE `key` LIKE 'dealer_%'",
    );
    const permissionIdByKey = Object.fromEntries(
      permissionRows.map((item) => [item.key, item.id]),
    );

    for (const role of DEALER_ROLES) {
      await queryInterface.bulkInsert("DealerRoles", [
        {
          key: role.key,
          name: role.name,
          description: role.description,
          isSystem: role.isSystem,
          isSuperRole: role.isSuperRole,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      ]);

      const [[createdRole]] = await queryInterface.sequelize.query(
        "SELECT id FROM DealerRoles WHERE `key` = :key LIMIT 1",
        { replacements: { key: role.key } },
      );

      for (const permissionKey of role.permissionKeys) {
        await queryInterface.bulkInsert("DealerRolePermissions", [
          {
            dealerRoleId: createdRole.id,
            permissionId: permissionIdByKey[permissionKey],
            createdAt: now,
            updatedAt: now,
          },
        ]);
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "DELETE drp FROM DealerRolePermissions drp INNER JOIN Permissions p ON drp.permissionId = p.id WHERE p.`key` LIKE 'dealer_%'",
    );
    await queryInterface.sequelize.query(
      "DELETE FROM Permissions WHERE `key` LIKE 'dealer_%'",
    );
    await queryInterface.sequelize.query(
      "DELETE FROM Modules WHERE `key` LIKE 'dealer_%'",
    );
    await queryInterface.sequelize.query(
      "DELETE FROM DealerRoles WHERE `key` IN ('dealer_admin', 'dealer_manager', 'dealer_viewer')",
    );
  },
};
