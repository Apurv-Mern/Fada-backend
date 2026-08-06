"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("EmployeeSkills", {
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
      skillName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      skillCategory: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      proficiencyLevel: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      learningSource: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "How the employee learned this skill",
      },
      skillDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex("EmployeeSkills", ["employeeId"], {
      name: "employee_skills_employee_id_index",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("EmployeeSkills");
  },
};
