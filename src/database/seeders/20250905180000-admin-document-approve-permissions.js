"use strict";

const DOCUMENT_APPROVE_PERMISSIONS = [
  {
    moduleKey: "dealers",
    key: "dealers.approve_documents",
    name: "Approve company documents",
    action: "approve_documents",
  },
  {
    moduleKey: "employees",
    key: "employees.approve_documents",
    name: "Approve employee documents",
    action: "approve_documents",
  },
];

const LEGACY_PERMISSION_MAP = [
  { legacy: "dealers.approve", granted: ["dealers.approve_documents"] },
  { legacy: "employees.verify", granted: ["employees.approve_documents"] },
];

const STAFF_ROLE_PERMISSION_KEYS = ["dealers.approve_documents", "employees.approve_documents"];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [modules] = await queryInterface.sequelize.query(
      "SELECT id, `key` FROM Modules WHERE `key` IN ('dealers', 'employees')",
    );
    const moduleIdByKey = Object.fromEntries(modules.map((module) => [module.key, module.id]));

    for (const permission of DOCUMENT_APPROVE_PERMISSIONS) {
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
      "SELECT id, `key` FROM Permissions WHERE `key` IN (:keys)",
      {
        replacements: {
          keys: DOCUMENT_APPROVE_PERMISSIONS.map((permission) => permission.key),
        },
      },
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

    for (const key of STAFF_ROLE_PERMISSION_KEYS) {
      const permissionId = permissionRows.find((permission) => permission.key === key)?.id;
      if (!permissionId) continue;

      const [[existingStaffGrant]] = await queryInterface.sequelize.query(
        "SELECT roleId FROM RolePermissions WHERE roleId = 2 AND permissionId = :permissionId LIMIT 1",
        { replacements: { permissionId } },
      );
      if (existingStaffGrant) continue;

      await queryInterface.bulkInsert("RolePermissions", [
        {
          roleId: 2,
          permissionId,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }

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

      const [grantedPermissions] = await queryInterface.sequelize.query(
        "SELECT id FROM Permissions WHERE `key` IN (:keys)",
        { replacements: { keys: mapping.granted } },
      );

      for (const role of rolesWithLegacy) {
        for (const permission of grantedPermissions) {
          const [[exists]] = await queryInterface.sequelize.query(
            "SELECT roleId FROM RolePermissions WHERE roleId = :roleId AND permissionId = :permissionId LIMIT 1",
            {
              replacements: {
                roleId: role.roleId,
                permissionId: permission.id,
              },
            },
          );

          if (exists) continue;

          await queryInterface.bulkInsert("RolePermissions", [
            {
              roleId: role.roleId,
              permissionId: permission.id,
              createdAt: now,
              updatedAt: now,
            },
          ]);
        }
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "DELETE rp FROM RolePermissions rp INNER JOIN Permissions p ON rp.permissionId = p.id WHERE p.`key` IN (:keys)",
      {
        replacements: {
          keys: DOCUMENT_APPROVE_PERMISSIONS.map((permission) => permission.key),
        },
      },
    );
    await queryInterface.sequelize.query(
      "DELETE FROM Permissions WHERE `key` IN (:keys)",
      {
        replacements: {
          keys: DOCUMENT_APPROVE_PERMISSIONS.map((permission) => permission.key),
        },
      },
    );
  },
};
