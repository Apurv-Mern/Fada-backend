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

const NEW_PERMISSIONS = [
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
    moduleKey: "dealer_communications",
    key: "dealer_communications.view",
    name: "View communications",
    action: "view",
  },
];

const ROLE_PERMISSIONS = {
  dealer_admin: [
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
    "dealer_settings.manage",
    "dealer_staff.view",
    "dealer_staff.create",
    "dealer_staff.edit",
    "dealer_staff.delete",
  ],
  dealer_manager: [
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
  dealer_viewer: [
    "dealer_dashboard.view",
    "dealer_company_profile.view",
    "dealer_outlets.view",
    "dealer_employees.view",
    "dealer_employment_requests.view",
    "dealer_reports.view",
    "dealer_communications.view",
    "dealer_staff.view",
  ],
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [[existingDashboard]] = await queryInterface.sequelize.query(
      "SELECT id FROM Modules WHERE `key` = 'dealer_dashboard' LIMIT 1",
    );
    if (!existingDashboard) return;

    for (const module of MODULES) {
      const [[existing]] = await queryInterface.sequelize.query(
        "SELECT id FROM Modules WHERE `key` = :key LIMIT 1",
        { replacements: { key: module.key } },
      );

      if (existing) {
        await queryInterface.sequelize.query(
          "UPDATE Modules SET name = :name, sortOrder = :sortOrder, updatedAt = :updatedAt WHERE `key` = :key",
          {
            replacements: {
              key: module.key,
              name: module.name,
              sortOrder: module.sortOrder,
              updatedAt: now,
            },
          },
        );
      } else {
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
    }

    const [modules] = await queryInterface.sequelize.query(
      "SELECT id, `key` FROM Modules WHERE `key` LIKE 'dealer_%'",
    );
    const moduleIdByKey = Object.fromEntries(modules.map((item) => [item.key, item.id]));

    const [[settingsModule]] = await queryInterface.sequelize.query(
      "SELECT id FROM Modules WHERE `key` = 'dealer_settings' LIMIT 1",
    );

    if (settingsModule) {
      await queryInterface.sequelize.query(
        "UPDATE Permissions SET moduleId = :moduleId, updatedAt = :updatedAt WHERE `key` LIKE 'dealer_staff.%'",
        { replacements: { moduleId: settingsModule.id, updatedAt: now } },
      );
    }

    await queryInterface.sequelize.query(
      "DELETE FROM Modules WHERE `key` = 'dealer_staff'",
    );

    for (const permission of NEW_PERMISSIONS) {
      const [[existingPermission]] = await queryInterface.sequelize.query(
        "SELECT id FROM Permissions WHERE `key` = :key LIMIT 1",
        { replacements: { key: permission.key } },
      );

      if (existingPermission) continue;

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

    for (const [roleKey, permissionKeys] of Object.entries(ROLE_PERMISSIONS)) {
      const [[role]] = await queryInterface.sequelize.query(
        "SELECT id FROM DealerRoles WHERE `key` = :key LIMIT 1",
        { replacements: { key: roleKey } },
      );

      if (!role) continue;

      await queryInterface.sequelize.query(
        "DELETE drp FROM DealerRolePermissions drp INNER JOIN Permissions p ON drp.permissionId = p.id WHERE drp.dealerRoleId = :dealerRoleId AND p.`key` LIKE 'dealer_%'",
        { replacements: { dealerRoleId: role.id } },
      );

      for (const permissionKey of permissionKeys) {
        const permissionId = permissionIdByKey[permissionKey];
        if (!permissionId) continue;

        await queryInterface.bulkInsert("DealerRolePermissions", [
          {
            dealerRoleId: role.id,
            permissionId,
            createdAt: now,
            updatedAt: now,
          },
        ]);
      }
    }
  },

  async down(queryInterface) {
    const now = new Date();

    await queryInterface.sequelize.query(
      "DELETE rp FROM RolePermissions rp INNER JOIN Permissions p ON rp.permissionId = p.id WHERE p.`key` IN ('dealer_company_profile.view', 'dealer_company_profile.edit', 'dealer_employment_requests.view', 'dealer_employment_requests.manage', 'dealer_communications.view')",
    );
    await queryInterface.sequelize.query(
      "DELETE FROM Permissions WHERE `key` IN ('dealer_company_profile.view', 'dealer_company_profile.edit', 'dealer_employment_requests.view', 'dealer_employment_requests.manage', 'dealer_communications.view')",
    );
    await queryInterface.sequelize.query(
      "DELETE FROM Modules WHERE `key` IN ('dealer_company_profile', 'dealer_employment_requests', 'dealer_communications')",
    );

    const [[staffModule]] = await queryInterface.sequelize.query(
      "SELECT id FROM Modules WHERE `key` = 'dealer_staff' LIMIT 1",
    );

    if (!staffModule) {
      await queryInterface.bulkInsert("Modules", [
        {
          key: "dealer_staff",
          name: "Dealer Staff",
          sortOrder: 104,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }
  },
};
