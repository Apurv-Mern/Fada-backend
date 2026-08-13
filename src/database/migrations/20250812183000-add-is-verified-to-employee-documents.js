"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("EmployeeDocuments");
    if (!table.isVerified) {
      await queryInterface.addColumn("EmployeeDocuments", "isVerified", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("EmployeeDocuments");
    if (table.isVerified) {
      await queryInterface.removeColumn("EmployeeDocuments", "isVerified");
    }
  },
};
