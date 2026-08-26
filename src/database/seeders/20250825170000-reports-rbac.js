"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [[existingModule]] = await queryInterface.sequelize.query(
      "SELECT id FROM Modules WHERE `key` = 'reports' LIMIT 1",
    );
    if (existingModule) return;

    await queryInterface.bulkInsert("Modules", [
      {
        key: "reports",
        name: "Reports",
        sortOrder: 10,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const [[reportsModule]] = await queryInterface.sequelize.query(
      "SELECT id FROM Modules WHERE `key` = 'reports' LIMIT 1",
    );

    const permissions = [
      {
        moduleId: reportsModule.id,
        key: "reports.view",
        name: "View reports",
        action: "view",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        moduleId: reportsModule.id,
        key: "reports.export",
        name: "Export reports",
        action: "export",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ];

    await queryInterface.bulkInsert("Permissions", permissions);

    const [permissionRows] = await queryInterface.sequelize.query(
      "SELECT id, `key` FROM Permissions WHERE `key` IN ('reports.view', 'reports.export')",
    );

    for (const permission of permissionRows) {
      await queryInterface.bulkInsert("RolePermissions", [
        {
          roleId: 1,
          permissionId: permission.id,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }

    for (const permission of permissionRows) {
      await queryInterface.bulkInsert("RolePermissions", [
        {
          roleId: 2,
          permissionId: permission.id,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "DELETE rp FROM RolePermissions rp INNER JOIN Permissions p ON rp.permissionId = p.id WHERE p.`key` IN ('reports.view', 'reports.export')",
    );
    await queryInterface.sequelize.query(
      "DELETE FROM Permissions WHERE `key` IN ('reports.view', 'reports.export')",
    );
    await queryInterface.sequelize.query(
      "DELETE FROM Modules WHERE `key` = 'reports'",
    );
  },
};
