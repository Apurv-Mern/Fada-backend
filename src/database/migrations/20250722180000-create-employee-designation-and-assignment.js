"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("EmployeeDesignations", {
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
        onDelete: "RESTRICT",
      },
      departmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "OrganizationStructures",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      designationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "OrganizationStructures",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
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

    await queryInterface.addIndex("EmployeeDesignations", ["employeeId"], {
      unique: true,
      name: "employee_designations_employee_id_unique",
    });

    await queryInterface.createTable("EmployeeAssignments", {
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
      designationId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "OrganizationStructures",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      employeementType: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "full-time",
      },
      isCurrentlyWorking: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      highlights: {
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

    await queryInterface.addIndex("EmployeeAssignments", ["employeeId"], {
      unique: true,
      name: "employee_assignments_employee_id_unique",
    });

    await queryInterface.addIndex("EmployeeAssignments", ["dealerId"], {
      name: "employee_assignments_dealer_id_index",
    });

    await queryInterface.addIndex("EmployeeAssignments", ["outletId"], {
      name: "employee_assignments_outlet_id_index",
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("EmployeeAssignments");
    await queryInterface.dropTable("EmployeeDesignations");
  },
};
