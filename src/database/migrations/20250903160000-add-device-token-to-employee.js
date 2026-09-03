"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable("Employees");

    if (!columns.deviceToken) {
      await queryInterface.addColumn("Employees", "deviceToken", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable("Employees");

    if (columns.deviceToken) {
      await queryInterface.removeColumn("Employees", "deviceToken");
    }
  },
};
