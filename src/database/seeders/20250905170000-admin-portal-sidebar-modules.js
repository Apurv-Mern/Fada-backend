"use strict";

const MODULES = [
  { key: "dashboard", name: "Dashboard", sortOrder: 1 },
  { key: "dealers", name: "Companies", sortOrder: 2 },
  { key: "outlets", name: "Outlets", sortOrder: 3 },
  { key: "employees", name: "Employees", sortOrder: 4 },
  { key: "staff", name: "Staff Members", sortOrder: 5 },
  { key: "reports", name: "Reports", sortOrder: 6 },
  { key: "brand_masters", name: "Brand Masters", sortOrder: 7 },
  { key: "organization_structure", name: "Organization Structure", sortOrder: 8 },
  { key: "outlet_functions", name: "Outlet Functions", sortOrder: 9 },
  { key: "document_types", name: "Document Types", sortOrder: 10 },
  { key: "employment_workflow", name: "Employment Workflow", sortOrder: 11 },
  { key: "score_configuration", name: "Score Configuration", sortOrder: 12 },
  { key: "score_rules", name: "Score Rules", sortOrder: 13 },
  { key: "communications", name: "Communications", sortOrder: 14 },
  { key: "newsroom", name: "Newsroom", sortOrder: 15 },
  { key: "roles", name: "Roles & Permissions", sortOrder: 16 },
  { key: "settings", name: "Settings", sortOrder: 17 },
];

const NEW_PERMISSIONS = [
  { moduleKey: "dealers", key: "dealers.import", name: "Import companies", action: "import" },
  { moduleKey: "dealers", key: "dealers.approve_documents", name: "Approve company documents", action: "approve_documents" },
  { moduleKey: "employees", key: "employees.import", name: "Import employees", action: "import" },
  { moduleKey: "employees", key: "employees.create", name: "Create employees", action: "create" },
  { moduleKey: "employees", key: "employees.edit", name: "Edit employees", action: "edit" },
  { moduleKey: "employees", key: "employees.delete", name: "Delete employees", action: "delete" },
  { moduleKey: "employees", key: "employees.approve_documents", name: "Approve employee documents", action: "approve_documents" },
  { moduleKey: "outlets", key: "outlets.view", name: "View outlets", action: "view" },
  { moduleKey: "outlets", key: "outlets.create", name: "Create outlets", action: "create" },
  { moduleKey: "outlets", key: "outlets.edit", name: "Edit outlets", action: "edit" },
  { moduleKey: "outlets", key: "outlets.delete", name: "Delete outlets", action: "delete" },
  { moduleKey: "outlets", key: "outlets.import", name: "Import outlets", action: "import" },
  { moduleKey: "brand_masters", key: "brand_masters.view", name: "View brand masters", action: "view" },
  { moduleKey: "brand_masters", key: "brand_masters.manage", name: "Manage brand masters", action: "manage" },
  {
    moduleKey: "organization_structure",
    key: "organization_structure.view",
    name: "View organization structure",
    action: "view",
  },
  {
    moduleKey: "organization_structure",
    key: "organization_structure.manage",
    name: "Manage organization structure",
    action: "manage",
  },
  {
    moduleKey: "outlet_functions",
    key: "outlet_functions.view",
    name: "View outlet functions",
    action: "view",
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
  {
    moduleKey: "outlet_functions",
    key: "outlet_functions.manage",
    name: "Manage outlet functions",
    action: "manage",
  },
  {
    moduleKey: "document_types",
    key: "document_types.view",
    name: "View document types",
    action: "view",
  },
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
    moduleKey: "document_types",
    key: "document_types.manage",
    name: "Manage document types",
    action: "manage",
  },
  {
    moduleKey: "employment_workflow",
    key: "employment_workflow.view",
    name: "View employment workflow",
    action: "view",
  },
  {
    moduleKey: "employment_workflow",
    key: "employment_workflow.manage",
    name: "Manage employment workflow",
    action: "manage",
  },
  {
    moduleKey: "score_configuration",
    key: "score_configuration.view",
    name: "View score configuration",
    action: "view",
  },
  {
    moduleKey: "score_configuration",
    key: "score_configuration.manage",
    name: "Manage score configuration",
    action: "manage",
  },
  { moduleKey: "score_rules", key: "score_rules.view", name: "View score rules", action: "view" },
  { moduleKey: "score_rules", key: "score_rules.create", name: "Create score rules", action: "create" },
  { moduleKey: "score_rules", key: "score_rules.edit", name: "Edit score rules", action: "edit" },
  { moduleKey: "score_rules", key: "score_rules.delete", name: "Delete score rules", action: "delete" },
  { moduleKey: "score_rules", key: "score_rules.manage", name: "Manage score rules", action: "manage" },
  { moduleKey: "newsroom", key: "newsroom.view", name: "View newsroom", action: "view" },
  { moduleKey: "newsroom", key: "newsroom.create", name: "Create newsroom posts", action: "create" },
  { moduleKey: "newsroom", key: "newsroom.edit", name: "Edit newsroom posts", action: "edit" },
  { moduleKey: "newsroom", key: "newsroom.delete", name: "Delete newsroom posts", action: "delete" },
  { moduleKey: "newsroom", key: "newsroom.manage", name: "Manage newsroom", action: "manage" },
];

const LEGACY_MODULE_KEYS = ["masters", "score"];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [[existingDashboard]] = await queryInterface.sequelize.query(
      "SELECT id FROM Modules WHERE `key` = 'dashboard' LIMIT 1",
    );
    if (!existingDashboard) return;

    for (const module of MODULES) {
      const [[existing]] = await queryInterface.sequelize.query(
        "SELECT id FROM Modules WHERE `key` = :key LIMIT 1",
        { replacements: { key: module.key } },
      );

      if (existing) {
        await queryInterface.sequelize.query(
          "UPDATE Modules SET name = :name, sortOrder = :sortOrder, isActive = true, updatedAt = :updatedAt WHERE `key` = :key",
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

    await queryInterface.sequelize.query(
      "UPDATE Modules SET isActive = false, updatedAt = :updatedAt WHERE `key` IN (:keys)",
      {
        replacements: {
          keys: LEGACY_MODULE_KEYS,
          updatedAt: now,
        },
      },
    );

    const [modules] = await queryInterface.sequelize.query(
      "SELECT id, `key` FROM Modules WHERE isActive = true AND `key` NOT LIKE 'dealer_%'",
    );
    const moduleIdByKey = Object.fromEntries(modules.map((item) => [item.key, item.id]));

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

    const [newPermissions] = await queryInterface.sequelize.query(
      "SELECT id, `key` FROM Permissions WHERE `key` IN (:keys)",
      {
        replacements: {
          keys: NEW_PERMISSIONS.map((item) => item.key),
        },
      },
    );

    for (const permission of newPermissions) {
      const [[existingAssignment]] = await queryInterface.sequelize.query(
        "SELECT roleId FROM RolePermissions WHERE roleId = 1 AND permissionId = :permissionId LIMIT 1",
        { replacements: { permissionId: permission.id } },
      );

      if (existingAssignment) continue;

      await queryInterface.bulkInsert("RolePermissions", [
        {
          roleId: 1,
          permissionId: permission.id,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }

    const legacyPermissionMap = [
      { legacy: "masters.view", granted: NEW_PERMISSIONS.filter((p) => p.action === "view" && p.moduleKey !== "outlets" && p.moduleKey !== "newsroom" && !p.moduleKey.startsWith("score")).map((p) => p.key) },
      { legacy: "masters.manage", granted: NEW_PERMISSIONS.filter((p) => p.action === "manage" && p.moduleKey !== "outlets" && p.moduleKey !== "newsroom" && !p.moduleKey.startsWith("score")).map((p) => p.key) },
      { legacy: "score.view", granted: ["score_configuration.view", "score_rules.view"] },
      { legacy: "score.manage", granted: ["score_configuration.manage", "score_rules.manage"] },
      { legacy: "communications.view", granted: ["newsroom.view"] },
      { legacy: "communications.manage", granted: ["newsroom.manage"] },
      { legacy: "dealers.view", granted: ["outlets.view"] },
      { legacy: "dealers.create", granted: ["outlets.create"] },
      { legacy: "dealers.edit", granted: ["outlets.edit"] },
      { legacy: "dealers.delete", granted: ["outlets.delete"] },
      { legacy: "dealers.import", granted: ["outlets.import"] },
    ];

    for (const mapping of legacyPermissionMap) {
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
    const now = new Date();

    await queryInterface.sequelize.query(
      "DELETE rp FROM RolePermissions rp INNER JOIN Permissions p ON rp.permissionId = p.id WHERE p.`key` IN (:keys)",
      {
        replacements: {
          keys: NEW_PERMISSIONS.map((item) => item.key),
        },
      },
    );

    await queryInterface.sequelize.query(
      "DELETE FROM Permissions WHERE `key` IN (:keys)",
      {
        replacements: {
          keys: NEW_PERMISSIONS.map((item) => item.key),
        },
      },
    );

    await queryInterface.sequelize.query(
      "DELETE FROM Modules WHERE `key` IN ('outlets', 'brand_masters', 'organization_structure', 'outlet_functions', 'document_types', 'employment_workflow', 'score_configuration', 'score_rules', 'newsroom')",
    );

    await queryInterface.sequelize.query(
      "UPDATE Modules SET isActive = true, updatedAt = :updatedAt WHERE `key` IN ('masters', 'score')",
      { replacements: { updatedAt: now } },
    );
  },
};
