"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("EmployeeTrainings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
      trainingTitle: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      trainingProvider: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      completionDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      keyLearnings: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      attachment: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "URL or path to certificate or notes",
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

    await queryInterface.addIndex("EmployeeTrainings", ["employeeId"], {
      name: "employee_trainings_employee_id_index",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("EmployeeTrainings");
  },
};
