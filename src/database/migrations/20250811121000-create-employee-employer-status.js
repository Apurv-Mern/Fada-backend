"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("EmployeeEmployerStatuses", {
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
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      actionUserBy: {
        type: Sequelize.ENUM("admin", "dealer", "employee"),
        allowNull: true,
      },
      actionUserId: {
        type: Sequelize.INTEGER,
        allowNull: true,
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
      "EmployeeEmployerStatuses",
      ["employeeAssignmentId"],
      {
        name: "employee_employer_statuses_assignment_id_index",
      },
    );

    await queryInterface.addIndex("EmployeeEmployerStatuses", ["status"], {
      name: "employee_employer_statuses_status_index",
    });

    await queryInterface.addIndex("EmployeeEmployerStatuses", ["slug"], {
      name: "employee_employer_statuses_slug_index",
    });

    await queryInterface.addIndex("EmployeeEmployerStatuses", ["actionUserBy"], {
      name: "employee_employer_statuses_action_user_by_index",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("EmployeeEmployerStatuses");
  },
};
