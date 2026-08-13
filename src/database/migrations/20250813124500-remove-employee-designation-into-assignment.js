"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const assignmentTable = await queryInterface.describeTable(
      "EmployeeAssignments",
    );

    if (!assignmentTable.departmentId) {
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
    }

    // Backfill department/designation from EmployeeDesignations into matching assignments
    await queryInterface.sequelize.query(`
      UPDATE EmployeeAssignments AS ea
      INNER JOIN EmployeeDesignations AS ed
        ON ed.employeeId = ea.employeeId
        AND ed.deletedAt IS NULL
      SET
        ea.departmentId = COALESCE(ea.departmentId, ed.departmentId),
        ea.designationId = COALESCE(ea.designationId, ed.designationId)
      WHERE ea.deletedAt IS NULL
    `);

    // Create assignments for designation rows that have no assignment yet
    await queryInterface.sequelize.query(`
      INSERT INTO EmployeeAssignments (
        employeeId,
        dealerId,
        outletId,
        departmentId,
        designationId,
        startDate,
        endDate,
        isActive,
        invitationSendBy,
        status,
        createdAt,
        updatedAt
      )
      SELECT
        ed.employeeId,
        ed.dealerId,
        NULL,
        ed.departmentId,
        ed.designationId,
        ed.startDate,
        ed.endDate,
        COALESCE(ed.isActive, 1),
        'dealer',
        'verified',
        NOW(),
        NOW()
      FROM EmployeeDesignations AS ed
      WHERE ed.deletedAt IS NULL
        AND NOT EXISTS (
          SELECT 1
          FROM EmployeeAssignments AS ea
          WHERE ea.employeeId = ed.employeeId
            AND ea.deletedAt IS NULL
        )
    `);

    await queryInterface.dropTable("EmployeeDesignations");
  },

  async down(queryInterface, Sequelize) {
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
        unique: true,
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
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
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

    await queryInterface.sequelize.query(`
      INSERT INTO EmployeeDesignations (
        employeeId,
        dealerId,
        departmentId,
        designationId,
        startDate,
        endDate,
        isActive,
        createdAt,
        updatedAt
      )
      SELECT
        ea.employeeId,
        ea.dealerId,
        ea.departmentId,
        ea.designationId,
        ea.startDate,
        ea.endDate,
        ea.isActive,
        NOW(),
        NOW()
      FROM EmployeeAssignments AS ea
      WHERE ea.deletedAt IS NULL
        AND ea.departmentId IS NOT NULL
        AND ea.designationId IS NOT NULL
    `);
  },
};
