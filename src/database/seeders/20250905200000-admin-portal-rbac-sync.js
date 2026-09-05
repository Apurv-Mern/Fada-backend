"use strict";

const { syncAdminPortalRbac } = require("./helpers/admin-portal-rbac");

/** Idempotent sync for existing databases — modules, permissions, and role grants. */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [[existingDashboard]] = await queryInterface.sequelize.query(
      "SELECT id FROM Modules WHERE `key` = 'dashboard' LIMIT 1",
    );
    if (!existingDashboard) return;

    await syncAdminPortalRbac(queryInterface);
  },

  async down() {
    // No-op: this seeder only syncs forward-compatible RBAC state.
  },
};
