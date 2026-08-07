"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("EmployeeProfileShares", {
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
      dealerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Dealers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        comment: "Organisation (dealer) granted profile access",
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    await queryInterface.addIndex("EmployeeProfileShares", ["employeeId"], {
      name: "employee_profile_shares_employee_id_index",
    });

    await queryInterface.addIndex("EmployeeProfileShares", ["dealerId"], {
      name: "employee_profile_shares_dealer_id_index",
    });

    await queryInterface.addIndex(
      "EmployeeProfileShares",
      ["employeeId", "dealerId"],
      {
        unique: true,
        name: "employee_profile_shares_employee_dealer_unique",
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("EmployeeProfileShares");
  },
};
