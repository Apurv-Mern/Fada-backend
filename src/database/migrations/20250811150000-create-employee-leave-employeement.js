"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("EmployeeLeaveEmployeements", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      employeeAssignmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "EmployeeAssignments",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Employees",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      dealerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Dealers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      outletId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Outlets",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      lastWorkingDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      initiatedBy: {
        type: Sequelize.ENUM("employee", "dealer"),
        allowNull: false,
        defaultValue: "employee",
      },
      initiatedById: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("pending", "rejected", "accepted"),
        allowNull: false,
        defaultValue: "pending",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex(
      "EmployeeLeaveEmployeements",
      ["employeeAssignmentId"],
      {
        name: "employee_leave_employeements_assignment_id_index",
      },
    );

    await queryInterface.addIndex(
      "EmployeeLeaveEmployeements",
      ["employeeId"],
      {
        name: "employee_leave_employeements_employee_id_index",
      },
    );

    await queryInterface.addIndex(
      "EmployeeLeaveEmployeements",
      ["dealerId"],
      {
        name: "employee_leave_employeements_dealer_id_index",
      },
    );

    await queryInterface.addIndex(
      "EmployeeLeaveEmployeements",
      ["status"],
      {
        name: "employee_leave_employeements_status_index",
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("EmployeeLeaveEmployeements");
  },
};
