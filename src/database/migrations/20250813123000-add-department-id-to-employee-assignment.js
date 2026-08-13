"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("EmployeeAssignments");

    if (!table.departmentId) {
      await queryInterface.addColumn("EmployeeAssignments", "departmentId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "OrganizationStructures",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      });

      await queryInterface.addIndex("EmployeeAssignments", ["departmentId"], {
        name: "employee_assignments_department_id_index",
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("EmployeeAssignments");

    if (table.departmentId) {
      await queryInterface.removeIndex(
        "EmployeeAssignments",
        "employee_assignments_department_id_index",
      );
      await queryInterface.removeColumn("EmployeeAssignments", "departmentId");
    }
  },
};
