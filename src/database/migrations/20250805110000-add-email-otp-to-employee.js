"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable("Employees");

    if (!columns.emailOTP) {
      await queryInterface.addColumn("Employees", "emailOTP", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable("Employees");

    if (columns.emailOTP) {
      await queryInterface.removeColumn("Employees", "emailOTP");
    }
  },
};
