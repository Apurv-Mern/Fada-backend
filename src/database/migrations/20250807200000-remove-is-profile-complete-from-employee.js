"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const columns = await queryInterface.describeTable("Employees");

    if (columns.isProfileComplete) {
      await queryInterface.removeColumn("Employees", "isProfileComplete");
    }
  },

  async down(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable("Employees");

    if (!columns.isProfileComplete) {
      await queryInterface.addColumn("Employees", "isProfileComplete", {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }
  },
};
