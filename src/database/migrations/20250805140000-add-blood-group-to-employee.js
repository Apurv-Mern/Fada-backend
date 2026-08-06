"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable("Employees");

    if (!columns.bloodGroup) {
      await queryInterface.addColumn("Employees", "bloodGroup", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable("Employees");

    if (columns.bloodGroup) {
      await queryInterface.removeColumn("Employees", "bloodGroup");
    }
  },
};
