"use strict";

const {
  syncSuperAdminAccount,
  assignDefaultStaffRoleToAdmins,
} = require("./helpers/system-roles");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await syncSuperAdminAccount(queryInterface);
    await assignDefaultStaffRoleToAdmins(queryInterface);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "DELETE FROM Admins WHERE email = 'superadmin@gmail.com'",
    );
  },
};
