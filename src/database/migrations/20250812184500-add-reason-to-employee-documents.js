"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("EmployeeDocuments");
    if (!table.reason) {
      await queryInterface.addColumn("EmployeeDocuments", "reason", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("EmployeeDocuments");
    if (table.reason) {
      await queryInterface.removeColumn("EmployeeDocuments", "reason");
    }
  },
};
