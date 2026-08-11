"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable("EmployeeAssignments");

    if (!columns.invitationSendBy) {
      await queryInterface.addColumn("EmployeeAssignments", "invitationSendBy", {
        type: Sequelize.ENUM("employee", "dealer"),
        allowNull: false,
        defaultValue: "dealer",
      });
    }

    if (!columns.status) {
      await queryInterface.addColumn("EmployeeAssignments", "status", {
        type: Sequelize.ENUM("pending", "rejected", "verified"),
        allowNull: false,
        defaultValue: "verified",
      });
    }
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable("EmployeeAssignments");

    if (columns.status) {
      await queryInterface.removeColumn("EmployeeAssignments", "status");
    }

    if (columns.invitationSendBy) {
      await queryInterface.removeColumn("EmployeeAssignments", "invitationSendBy");
    }
  },
};
