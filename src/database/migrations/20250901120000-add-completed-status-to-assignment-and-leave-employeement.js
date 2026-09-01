"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("EmployeeAssignments", "status", {
      type: Sequelize.ENUM("pending", "rejected", "verified", "completed"),
      allowNull: false,
      defaultValue: "pending",
    });

    await queryInterface.changeColumn("EmployeeLeaveEmployeements", "status", {
      type: Sequelize.ENUM("pending", "rejected", "accepted", "completed"),
      allowNull: false,
      defaultValue: "pending",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "UPDATE EmployeeAssignments SET status = 'verified' WHERE status = 'completed'",
    );
    await queryInterface.changeColumn("EmployeeAssignments", "status", {
      type: Sequelize.ENUM("pending", "rejected", "verified"),
      allowNull: false,
      defaultValue: "pending",
    });

    await queryInterface.sequelize.query(
      "UPDATE EmployeeLeaveEmployeements SET status = 'accepted' WHERE status = 'completed'",
    );
    await queryInterface.changeColumn("EmployeeLeaveEmployeements", "status", {
      type: Sequelize.ENUM("pending", "rejected", "accepted"),
      allowNull: false,
      defaultValue: "pending",
    });
  },
};
