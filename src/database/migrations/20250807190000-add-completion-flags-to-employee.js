"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable("Employees");
    const booleanColumn = (name) => ({
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    if (!columns.isRegistrationCompleted) {
      await queryInterface.addColumn(
        "Employees",
        "isRegistrationCompleted",
        booleanColumn("isRegistrationCompleted"),
      );
    }
    if (!columns.isProfileCompleted) {
      await queryInterface.addColumn(
        "Employees",
        "isProfileCompleted",
        booleanColumn("isProfileCompleted"),
      );
    }
    if (!columns.isKycCompleted) {
      await queryInterface.addColumn(
        "Employees",
        "isKycCompleted",
        booleanColumn("isKycCompleted"),
      );
    }
    if (!columns.isJourneyCompleted) {
      await queryInterface.addColumn(
        "Employees",
        "isJourneyCompleted",
        booleanColumn("isJourneyCompleted"),
      );
    }
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable("Employees");

    if (columns.isJourneyCompleted) {
      await queryInterface.removeColumn("Employees", "isJourneyCompleted");
    }
    if (columns.isKycCompleted) {
      await queryInterface.removeColumn("Employees", "isKycCompleted");
    }
    if (columns.isProfileCompleted) {
      await queryInterface.removeColumn("Employees", "isProfileCompleted");
    }
    if (columns.isRegistrationCompleted) {
      await queryInterface.removeColumn(
        "Employees",
        "isRegistrationCompleted",
      );
    }
  },
};
