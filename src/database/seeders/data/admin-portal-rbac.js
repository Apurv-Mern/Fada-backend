"use strict";

/** Admin portal sidebar modules (active). Legacy `masters` and `score` are deactivated by the sync seeder. */
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

/** Legacy modules kept in DB for backward-compatible permission keys. */
const LEGACY_MODULES = [
  { key: "masters", name: "Masters", sortOrder: 99 },
  { key: "score", name: "Score Engine", sortOrder: 100 },
];

const LEGACY_MODULE_KEYS = LEGACY_MODULES.map((module) => module.key);

const PERMISSIONS = [
  { moduleKey: "dashboard", key: "dashboard.view", name: "View dashboard", action: "view" },

  { moduleKey: "dealers", key: "dealers.view", name: "View companies", action: "view" },
  { moduleKey: "dealers", key: "dealers.create", name: "Create companies", action: "create" },
  { moduleKey: "dealers", key: "dealers.edit", name: "Edit companies", action: "edit" },
  { moduleKey: "dealers", key: "dealers.delete", name: "Delete companies", action: "delete" },
  { moduleKey: "dealers", key: "dealers.approve", name: "Approve company registrations", action: "approve" },
  { moduleKey: "dealers", key: "dealers.approve_documents", name: "Approve company documents", action: "approve_documents" },
  { moduleKey: "dealers", key: "dealers.import", name: "Import companies", action: "import" },

  { moduleKey: "outlets", key: "outlets.view", name: "View outlets", action: "view" },
  { moduleKey: "outlets", key: "outlets.create", name: "Create outlets", action: "create" },
  { moduleKey: "outlets", key: "outlets.edit", name: "Edit outlets", action: "edit" },
  { moduleKey: "outlets", key: "outlets.delete", name: "Delete outlets", action: "delete" },
  { moduleKey: "outlets", key: "outlets.import", name: "Import outlets", action: "import" },

  { moduleKey: "employees", key: "employees.view", name: "View employees", action: "view" },
  { moduleKey: "employees", key: "employees.create", name: "Create employees", action: "create" },
  { moduleKey: "employees", key: "employees.edit", name: "Edit employees", action: "edit" },
  { moduleKey: "employees", key: "employees.delete", name: "Delete employees", action: "delete" },
  { moduleKey: "employees", key: "employees.verify", name: "Verify employment", action: "verify" },
  { moduleKey: "employees", key: "employees.approve_documents", name: "Approve employee documents", action: "approve_documents" },
  { moduleKey: "employees", key: "employees.import", name: "Import employees", action: "import" },

  { moduleKey: "staff", key: "staff.view", name: "View staff members", action: "view" },
  { moduleKey: "staff", key: "staff.create", name: "Create staff members", action: "create" },
  { moduleKey: "staff", key: "staff.edit", name: "Edit staff members", action: "edit" },
  { moduleKey: "staff", key: "staff.delete", name: "Delete staff members", action: "delete" },

  { moduleKey: "reports", key: "reports.view", name: "View reports", action: "view" },
  { moduleKey: "reports", key: "reports.export", name: "Export reports", action: "export" },

  { moduleKey: "brand_masters", key: "brand_masters.view", name: "View brand masters", action: "view" },
  { moduleKey: "brand_masters", key: "brand_masters.manage", name: "Manage brand masters", action: "manage" },

  { moduleKey: "organization_structure", key: "organization_structure.view", name: "View organization structure", action: "view" },
  { moduleKey: "organization_structure", key: "organization_structure.manage", name: "Manage organization structure", action: "manage" },

  { moduleKey: "outlet_functions", key: "outlet_functions.view", name: "View outlet functions", action: "view" },
  { moduleKey: "outlet_functions", key: "outlet_functions.create", name: "Create outlet functions", action: "create" },
  { moduleKey: "outlet_functions", key: "outlet_functions.edit", name: "Edit outlet functions", action: "edit" },
  { moduleKey: "outlet_functions", key: "outlet_functions.delete", name: "Delete outlet functions", action: "delete" },
  { moduleKey: "outlet_functions", key: "outlet_functions.manage", name: "Manage outlet functions", action: "manage" },

  { moduleKey: "document_types", key: "document_types.view", name: "View document types", action: "view" },
  { moduleKey: "document_types", key: "document_types.create", name: "Create document types", action: "create" },
  { moduleKey: "document_types", key: "document_types.edit", name: "Edit document types", action: "edit" },
  { moduleKey: "document_types", key: "document_types.delete", name: "Delete document types", action: "delete" },
  { moduleKey: "document_types", key: "document_types.manage", name: "Manage document types", action: "manage" },

  { moduleKey: "employment_workflow", key: "employment_workflow.view", name: "View employment workflow", action: "view" },
  { moduleKey: "employment_workflow", key: "employment_workflow.manage", name: "Manage employment workflow", action: "manage" },

  { moduleKey: "score_configuration", key: "score_configuration.view", name: "View score configuration", action: "view" },
  { moduleKey: "score_configuration", key: "score_configuration.manage", name: "Manage score configuration", action: "manage" },

  { moduleKey: "score_rules", key: "score_rules.view", name: "View score rules", action: "view" },
  { moduleKey: "score_rules", key: "score_rules.create", name: "Create score rules", action: "create" },
  { moduleKey: "score_rules", key: "score_rules.edit", name: "Edit score rules", action: "edit" },
  { moduleKey: "score_rules", key: "score_rules.delete", name: "Delete score rules", action: "delete" },
  { moduleKey: "score_rules", key: "score_rules.manage", name: "Manage score rules", action: "manage" },

  { moduleKey: "communications", key: "communications.view", name: "View communications", action: "view" },
  { moduleKey: "communications", key: "communications.manage", name: "Manage communications", action: "manage" },

  { moduleKey: "newsroom", key: "newsroom.view", name: "View newsroom", action: "view" },
  { moduleKey: "newsroom", key: "newsroom.create", name: "Create newsroom posts", action: "create" },
  { moduleKey: "newsroom", key: "newsroom.edit", name: "Edit newsroom posts", action: "edit" },
  { moduleKey: "newsroom", key: "newsroom.delete", name: "Delete newsroom posts", action: "delete" },
  { moduleKey: "newsroom", key: "newsroom.manage", name: "Manage newsroom", action: "manage" },

  { moduleKey: "roles", key: "roles.manage", name: "Manage roles & permissions", action: "manage" },
  { moduleKey: "settings", key: "settings.manage", name: "Manage settings", action: "manage" },

  // Legacy permissions (modules deactivated in UI)
  { moduleKey: "masters", key: "masters.view", name: "View masters", action: "view" },
  { moduleKey: "masters", key: "masters.manage", name: "Manage masters", action: "manage" },
  { moduleKey: "score", key: "score.view", name: "View score engine", action: "view" },
  { moduleKey: "score", key: "score.manage", name: "Manage score engine", action: "manage" },
];

const STAFF_ROLE_PERMISSION_KEYS = [
  "dashboard.view",
  "dealers.view",
  "dealers.edit",
  "dealers.approve",
  "dealers.approve_documents",
  "employees.view",
  "employees.create",
  "employees.edit",
  "employees.delete",
  "employees.verify",
  "employees.approve_documents",
  "employees.import",
  "reports.view",
  "reports.export",
];

/** Grant new granular permissions to roles that still hold legacy keys. */
const LEGACY_PERMISSION_MAP = [
  {
    legacy: "masters.view",
    granted: PERMISSIONS.filter(
      (permission) =>
        permission.action === "view" &&
        permission.moduleKey !== "outlets" &&
        permission.moduleKey !== "newsroom" &&
        !permission.moduleKey.startsWith("score"),
    ).map((permission) => permission.key),
  },
  {
    legacy: "masters.manage",
    granted: [
      ...PERMISSIONS.filter(
        (permission) =>
          permission.action === "manage" &&
          permission.moduleKey !== "outlets" &&
          permission.moduleKey !== "newsroom" &&
          !permission.moduleKey.startsWith("score"),
      ).map((permission) => permission.key),
      "document_types.create",
      "document_types.edit",
      "document_types.delete",
      "outlet_functions.create",
      "outlet_functions.edit",
      "outlet_functions.delete",
    ],
  },
  { legacy: "score.view", granted: ["score_configuration.view", "score_rules.view"] },
  {
    legacy: "score.manage",
    granted: [
      "score_configuration.manage",
      "score_rules.manage",
      "score_rules.create",
      "score_rules.edit",
      "score_rules.delete",
    ],
  },
  { legacy: "communications.view", granted: ["newsroom.view"] },
  {
    legacy: "communications.manage",
    granted: [
      "newsroom.manage",
      "newsroom.create",
      "newsroom.edit",
      "newsroom.delete",
    ],
  },
  { legacy: "dealers.view", granted: ["outlets.view"] },
  { legacy: "dealers.create", granted: ["outlets.create"] },
  { legacy: "dealers.edit", granted: ["outlets.edit"] },
  { legacy: "dealers.delete", granted: ["outlets.delete"] },
  { legacy: "dealers.import", granted: ["outlets.import"] },
  { legacy: "dealers.approve", granted: ["dealers.approve_documents"] },
  { legacy: "employees.verify", granted: ["employees.approve_documents"] },
  { legacy: "employees.view", granted: ["employees.create", "employees.edit", "employees.delete"] },
  { legacy: "document_types.manage", granted: ["document_types.create", "document_types.edit", "document_types.delete"] },
  { legacy: "outlet_functions.manage", granted: ["outlet_functions.create", "outlet_functions.edit", "outlet_functions.delete"] },
  { legacy: "score_rules.manage", granted: ["score_rules.create", "score_rules.edit", "score_rules.delete"] },
  { legacy: "newsroom.manage", granted: ["newsroom.create", "newsroom.edit", "newsroom.delete"] },
];

const ADMIN_ROLE_ID = 1;
const STAFF_ROLE_ID = 2;

module.exports = {
  MODULES,
  LEGACY_MODULES,
  LEGACY_MODULE_KEYS,
  PERMISSIONS,
  STAFF_ROLE_PERMISSION_KEYS,
  LEGACY_PERMISSION_MAP,
  ADMIN_ROLE_ID,
  STAFF_ROLE_ID,
};
