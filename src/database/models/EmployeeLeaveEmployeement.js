"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EmployeeLeaveEmployeement extends Model {
    static associate(models) {
      EmployeeLeaveEmployeement.belongsTo(models.EmployeeAssignment, {
        foreignKey: "employeeAssignmentId",
        as: "assignment",
      });

      EmployeeLeaveEmployeement.belongsTo(models.Employee, {
        foreignKey: "employeeId",
        as: "employee",
      });

      EmployeeLeaveEmployeement.belongsTo(models.Dealer, {
        foreignKey: "dealerId",
        as: "dealership",
      });

      EmployeeLeaveEmployeement.belongsTo(models.Outlet, {
        foreignKey: "outletId",
        as: "branch",
      });

      // Status rows reuse employeeAssignmentId column to store leave request id when slug=leaving
      EmployeeLeaveEmployeement.hasMany(models.EmployeeEmployerStatus, {
        foreignKey: "employeeAssignmentId",
        as: "statuses",
        constraints: false,
        scope: { slug: "leaving" },
      });
    }
  }
  EmployeeLeaveEmployeement.init(
    {
      employeeAssignmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dealerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      outletId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      lastWorkingDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      initiatedBy: {
        type: DataTypes.ENUM("employee", "dealer"),
        allowNull: false,
        defaultValue: "employee",
      },
      initiatedById: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "rejected", "accepted"),
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      modelName: "EmployeeLeaveEmployeement",
      paranoid: true,
      indexes: [
        { fields: ["employeeAssignmentId"] },
        { fields: ["employeeId"] },
        { fields: ["dealerId"] },
        { fields: ["status"] },
      ],
    },
  );

  return EmployeeLeaveEmployeement;
};
