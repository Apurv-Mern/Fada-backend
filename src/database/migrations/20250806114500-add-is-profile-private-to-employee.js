"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable("Employees");

    if (!columns.isProfilePrivate) {
      await queryInterface.addColumn("Employees", "isProfilePrivate", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable("Employees");

    if (columns.isProfilePrivate) {
      await queryInterface.removeColumn("Employees", "isProfilePrivate");
    }
  },
};
