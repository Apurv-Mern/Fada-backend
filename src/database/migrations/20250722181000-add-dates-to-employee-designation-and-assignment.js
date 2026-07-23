"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("EmployeeDesignations", "startDate", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn("EmployeeDesignations", "endDate", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn("EmployeeAssignments", "startDate", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn("EmployeeAssignments", "endDate", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("EmployeeAssignments", "endDate");
    await queryInterface.removeColumn("EmployeeAssignments", "startDate");
    await queryInterface.removeColumn("EmployeeDesignations", "endDate");
    await queryInterface.removeColumn("EmployeeDesignations", "startDate");
  },
};
