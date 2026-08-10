"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable("Employees");

    if (!columns.isProfileComplete) {
      await queryInterface.addColumn("Employees", "isProfileComplete", {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "Profile completion milestone: 0, 25, 50, 75, or 100",
      });
    }
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable("Employees");

    if (columns.isProfileComplete) {
      await queryInterface.removeColumn("Employees", "isProfileComplete");
    }
  },
};
