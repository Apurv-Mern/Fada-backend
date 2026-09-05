"use strict";

const IMPORT_PERMISSIONS = [
  {
    moduleKey: "dealers",
    key: "dealers.import",
    name: "Import companies",
    action: "import",
  },
  {
    moduleKey: "employees",
    key: "employees.import",
    name: "Import employees",
    action: "import",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [modules] = await queryInterface.sequelize.query(
      "SELECT id, `key` FROM Modules WHERE `key` IN ('dealers', 'employees')",
    );
    const moduleIdByKey = Object.fromEntries(modules.map((module) => [module.key, module.id]));

    for (const permission of IMPORT_PERMISSIONS) {
      const [[existing]] = await queryInterface.sequelize.query(
        "SELECT id FROM Permissions WHERE `key` = :key LIMIT 1",
        { replacements: { key: permission.key } },
      );
      if (existing) continue;

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
      "SELECT id, `key` FROM Permissions WHERE `key` IN ('dealers.import', 'employees.import')",
    );
    const permissionIdByKey = Object.fromEntries(
      permissionRows.map((permission) => [permission.key, permission.id]),
    );

    for (const permission of permissionRows) {
      const [[existingAdminGrant]] = await queryInterface.sequelize.query(
        "SELECT roleId FROM RolePermissions WHERE roleId = 1 AND permissionId = :permissionId LIMIT 1",
        { replacements: { permissionId: permission.id } },
      );
      if (!existingAdminGrant) {
        await queryInterface.bulkInsert("RolePermissions", [
          {
            roleId: 1,
            permissionId: permission.id,
            createdAt: now,
            updatedAt: now,
          },
        ]);
      }
    }

    const employeesImportId = permissionIdByKey["employees.import"];
    if (employeesImportId) {
      const [[existingStaffGrant]] = await queryInterface.sequelize.query(
        "SELECT roleId FROM RolePermissions WHERE roleId = 2 AND permissionId = :permissionId LIMIT 1",
        { replacements: { permissionId: employeesImportId } },
      );
      if (!existingStaffGrant) {
        await queryInterface.bulkInsert("RolePermissions", [
          {
            roleId: 2,
            permissionId: employeesImportId,
            createdAt: now,
            updatedAt: now,
          },
        ]);
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "DELETE rp FROM RolePermissions rp INNER JOIN Permissions p ON rp.permissionId = p.id WHERE p.`key` IN ('dealers.import', 'employees.import')",
    );
    await queryInterface.sequelize.query(
      "DELETE FROM Permissions WHERE `key` IN ('dealers.import', 'employees.import')",
    );
  },
};
