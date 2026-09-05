"use strict";

const { syncAdminPortalRbac } = require("./helpers/admin-portal-rbac");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await syncAdminPortalRbac(queryInterface);

    await queryInterface.sequelize.query(
      "UPDATE Roles SET `key` = 'admin', name = 'Admin', description = 'Full access to every module in the FADA Admin Portal.', assignableTo = 'all', isSystem = true, isSuperRole = true, isActive = true WHERE id = 1",
    );
    await queryInterface.sequelize.query(
      "UPDATE Roles SET `key` = 'staff', name = 'Staff', description = 'FADA staff who manage companies and verify employees.', assignableTo = 'staff', isSystem = true, isSuperRole = false, isActive = true WHERE id = 2",
    );

    await queryInterface.sequelize.query(
      "UPDATE Admins SET roleId = 1, isEditable = false, isDeletable = false WHERE id = 1",
    );
    await queryInterface.sequelize.query(
      "UPDATE Admins SET roleId = COALESCE(roleId, 2), isEditable = true, isDeletable = true WHERE id != 1",
    );
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
