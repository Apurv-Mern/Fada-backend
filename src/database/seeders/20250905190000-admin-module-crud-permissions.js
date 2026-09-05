"use strict";

const CRUD_PERMISSIONS = [
  { moduleKey: "employees", key: "employees.create", name: "Create employees", action: "create" },
  { moduleKey: "employees", key: "employees.edit", name: "Edit employees", action: "edit" },
  { moduleKey: "employees", key: "employees.delete", name: "Delete employees", action: "delete" },
  {
    moduleKey: "document_types",
    key: "document_types.create",
    name: "Create document types",
    action: "create",
  },
  {
    moduleKey: "document_types",
    key: "document_types.edit",
    name: "Edit document types",
    action: "edit",
  },
  {
    moduleKey: "document_types",
    key: "document_types.delete",
    name: "Delete document types",
    action: "delete",
  },
  {
    moduleKey: "outlet_functions",
    key: "outlet_functions.create",
    name: "Create outlet functions",
    action: "create",
  },
  {
    moduleKey: "outlet_functions",
    key: "outlet_functions.edit",
    name: "Edit outlet functions",
    action: "edit",
  },
  {
    moduleKey: "outlet_functions",
    key: "outlet_functions.delete",
    name: "Delete outlet functions",
    action: "delete",
  },
  { moduleKey: "score_rules", key: "score_rules.create", name: "Create score rules", action: "create" },
  { moduleKey: "score_rules", key: "score_rules.edit", name: "Edit score rules", action: "edit" },
  { moduleKey: "score_rules", key: "score_rules.delete", name: "Delete score rules", action: "delete" },
  { moduleKey: "newsroom", key: "newsroom.create", name: "Create newsroom posts", action: "create" },
  { moduleKey: "newsroom", key: "newsroom.edit", name: "Edit newsroom posts", action: "edit" },
  { moduleKey: "newsroom", key: "newsroom.delete", name: "Delete newsroom posts", action: "delete" },
];

const MANAGE_TO_CRUD = [
  { moduleKey: "document_types", manageKey: "document_types.manage" },
  { moduleKey: "outlet_functions", manageKey: "outlet_functions.manage" },
  { moduleKey: "score_rules", manageKey: "score_rules.manage" },
  { moduleKey: "newsroom", manageKey: "newsroom.manage" },
];

const LEGACY_MANAGE_TO_CRUD = [
  { legacyManageKey: "masters.manage", moduleKey: "document_types" },
  { legacyManageKey: "masters.manage", moduleKey: "outlet_functions" },
  { legacyManageKey: "score.manage", moduleKey: "score_rules" },
  { legacyManageKey: "communications.manage", moduleKey: "newsroom" },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [modules] = await queryInterface.sequelize.query(
      "SELECT id, `key` FROM Modules WHERE `key` IN (:keys)",
      {
        replacements: {
          keys: [...new Set(CRUD_PERMISSIONS.map((permission) => permission.moduleKey))],
        },
      },
    );
    const moduleIdByKey = Object.fromEntries(modules.map((module) => [module.key, module.id]));

    for (const permission of CRUD_PERMISSIONS) {
      const moduleId = moduleIdByKey[permission.moduleKey];
      if (!moduleId) continue;

      const [[existing]] = await queryInterface.sequelize.query(
        "SELECT id FROM Permissions WHERE `key` = :key LIMIT 1",
        { replacements: { key: permission.key } },
      );
      if (existing) continue;

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

    const [permissionRows] = await queryInterface.sequelize.query(
      "SELECT id, `key` FROM Permissions WHERE `key` IN (:keys)",
      {
        replacements: { keys: CRUD_PERMISSIONS.map((permission) => permission.key) },
      },
    );
    const permissionIdByKey = Object.fromEntries(
      permissionRows.map((permission) => [permission.key, permission.id]),
    );

    for (const permission of permissionRows) {
      const [[existingAdminGrant]] = await queryInterface.sequelize.query(
        "SELECT roleId FROM RolePermissions WHERE roleId = 1 AND permissionId = :permissionId LIMIT 1",
        { replacements: { permissionId: permission.id } },
      );
      if (existingAdminGrant) continue;

      await queryInterface.bulkInsert("RolePermissions", [
        {
          roleId: 1,
          permissionId: permission.id,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }

    for (const mapping of MANAGE_TO_CRUD) {
      const crudKeys = ["create", "edit", "delete"].map(
        (action) => `${mapping.moduleKey}.${action}`,
      );
      const crudPermissionIds = crudKeys
        .map((key) => permissionIdByKey[key])
        .filter(Boolean);

      if (!crudPermissionIds.length) continue;

      const [rolesWithManage] = await queryInterface.sequelize.query(
        `
        SELECT DISTINCT rp.roleId
        FROM RolePermissions rp
        INNER JOIN Permissions p ON rp.permissionId = p.id
        WHERE p.\`key\` = :manageKey
      `,
        { replacements: { manageKey: mapping.manageKey } },
      );

      for (const role of rolesWithManage) {
        for (const permissionId of crudPermissionIds) {
          const [[exists]] = await queryInterface.sequelize.query(
            "SELECT roleId FROM RolePermissions WHERE roleId = :roleId AND permissionId = :permissionId LIMIT 1",
            { replacements: { roleId: role.roleId, permissionId } },
          );
          if (exists) continue;

          await queryInterface.bulkInsert("RolePermissions", [
            {
              roleId: role.roleId,
              permissionId,
              createdAt: now,
              updatedAt: now,
            },
          ]);
        }
      }
    }

    const [rolesWithEmployeeView] = await queryInterface.sequelize.query(`
      SELECT DISTINCT rp.roleId
      FROM RolePermissions rp
      INNER JOIN Permissions p ON rp.permissionId = p.id
      WHERE p.\`key\` = 'employees.view'
    `);

    const employeeCrudIds = ["employees.create", "employees.edit", "employees.delete"]
      .map((key) => permissionIdByKey[key])
      .filter(Boolean);

    for (const role of rolesWithEmployeeView) {
      for (const permissionId of employeeCrudIds) {
        const [[exists]] = await queryInterface.sequelize.query(
          "SELECT roleId FROM RolePermissions WHERE roleId = :roleId AND permissionId = :permissionId LIMIT 1",
          { replacements: { roleId: role.roleId, permissionId } },
        );
        if (exists) continue;

        await queryInterface.bulkInsert("RolePermissions", [
          {
            roleId: role.roleId,
            permissionId,
            createdAt: now,
            updatedAt: now,
          },
        ]);
      }
    }

    for (const mapping of LEGACY_MANAGE_TO_CRUD) {
      const crudKeys = ["create", "edit", "delete"].map(
        (action) => `${mapping.moduleKey}.${action}`,
      );
      const crudPermissionIds = crudKeys
        .map((key) => permissionIdByKey[key])
        .filter(Boolean);

      if (!crudPermissionIds.length) continue;

      const [rolesWithLegacyManage] = await queryInterface.sequelize.query(
        `
        SELECT DISTINCT rp.roleId
        FROM RolePermissions rp
        INNER JOIN Permissions p ON rp.permissionId = p.id
        WHERE p.\`key\` = :legacyManageKey
      `,
        { replacements: { legacyManageKey: mapping.legacyManageKey } },
      );

      for (const role of rolesWithLegacyManage) {
        for (const permissionId of crudPermissionIds) {
          const [[exists]] = await queryInterface.sequelize.query(
            "SELECT roleId FROM RolePermissions WHERE roleId = :roleId AND permissionId = :permissionId LIMIT 1",
            { replacements: { roleId: role.roleId, permissionId } },
          );
          if (exists) continue;

          await queryInterface.bulkInsert("RolePermissions", [
            {
              roleId: role.roleId,
              permissionId,
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
        replacements: { keys: CRUD_PERMISSIONS.map((permission) => permission.key) },
      },
    );
    await queryInterface.sequelize.query(
      "DELETE FROM Permissions WHERE `key` IN (:keys)",
      {
        replacements: { keys: CRUD_PERMISSIONS.map((permission) => permission.key) },
      },
    );
  },
};
