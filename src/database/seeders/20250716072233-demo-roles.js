"use strict";

const { syncSystemRoles } = require("./helpers/system-roles");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await syncSystemRoles(queryInterface);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "DELETE FROM Roles WHERE `key` IN ('admin', 'staff')",
    );
  },
};
