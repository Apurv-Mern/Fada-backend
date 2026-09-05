"use strict";

const { syncAdminPortalRbac } = require("./helpers/admin-portal-rbac");
const {
  syncSystemRoles,
  syncSuperAdminAccount,
  assignDefaultStaffRoleToAdmins,
} = require("./helpers/system-roles");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await syncSystemRoles(queryInterface);
    await syncAdminPortalRbac(queryInterface);
    await syncSuperAdminAccount(queryInterface);
    await assignDefaultStaffRoleToAdmins(queryInterface);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("RolePermissions", null, {});
    await queryInterface.bulkDelete("Permissions", null, {});
    await queryInterface.bulkDelete("Modules", null, {});
    await queryInterface.sequelize.query(
      "UPDATE Roles SET `key` = NULL, description = NULL, assignableTo = 'staff', isSystem = false, isSuperRole = false, isActive = true",
    );
    await queryInterface.sequelize.query(
      "UPDATE Admins SET isEditable = true, isDeletable = false",
    );
  },
};
