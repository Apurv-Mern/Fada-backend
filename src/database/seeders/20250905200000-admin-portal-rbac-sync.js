"use strict";

const { syncAdminPortalRbac } = require("./helpers/admin-portal-rbac");
const { syncSystemRoles } = require("./helpers/system-roles");

/** Idempotent sync for existing databases — safe to re-run on every deploy. */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await syncSystemRoles(queryInterface);
    await syncAdminPortalRbac(queryInterface);
  },

  async down() {
    // No-op: this seeder only syncs forward-compatible RBAC state.
  },
};
