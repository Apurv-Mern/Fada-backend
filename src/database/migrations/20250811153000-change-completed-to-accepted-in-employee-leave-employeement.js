"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "UPDATE EmployeeLeaveEmployeements SET status = 'accepted' WHERE status = 'completed'",
    );

    await queryInterface.changeColumn("EmployeeLeaveEmployeements", "status", {
      type: Sequelize.ENUM("pending", "rejected", "accepted"),
      allowNull: false,
      defaultValue: "pending",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "UPDATE EmployeeLeaveEmployeements SET status = 'completed' WHERE status = 'accepted'",
    );

    await queryInterface.changeColumn("EmployeeLeaveEmployeements", "status", {
      type: Sequelize.ENUM("pending", "rejected", "completed"),
      allowNull: false,
      defaultValue: "pending",
    });
  },
};
