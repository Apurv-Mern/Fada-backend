"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class EmployeeAssignment extends Model {
    static associate(models) {
      EmployeeAssignment.belongsTo(models.Employee, {
        foreignKey: "employeeId",
        as: "employee",
      });

      EmployeeAssignment.belongsTo(models.Dealer, {
        foreignKey: "dealerId",
        as: "dealership",
      });

      EmployeeAssignment.belongsTo(models.Outlet, {
        foreignKey: "outletId",
        as: "branch",
      });

      EmployeeAssignment.belongsTo(models.OrganizationStructure, {
        foreignKey: "departmentId",
        as: "department",
      });

      EmployeeAssignment.belongsTo(models.OrganizationStructure, {
        foreignKey: "designationId",
        as: "designation",
      });

      EmployeeAssignment.hasMany(models.EmployeeEmployerStatus, {
        foreignKey: "employeeAssignmentId",
        as: "statuses",
        where: { slug: "joining" },
      });

      EmployeeAssignment.hasMany(models.EmployeeLeaveEmployeement, {
        foreignKey: "employeeAssignmentId",
        as: "leaveEmployeements",
      });
    }
  }
  EmployeeAssignment.init(
    {
      employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      dealerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      outletId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      departmentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      designationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      employeementType: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "full-time",
      },
      isCurrentlyWorking: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      highlights: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      invitationSendBy: {
        type: DataTypes.ENUM("employee", "dealer"),
        allowNull: false,
        defaultValue: "dealer",
      },
      status: {
        type: DataTypes.ENUM("pending", "rejected", "verified"),
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      modelName: "EmployeeAssignment",
      paranoid: true,
      indexes: [
        {
          fields: ["employeeId"],
        },
        {
          fields: ["dealerId"],
        },
        {
          fields: ["outletId"],
        },
        {
          fields: ["departmentId"],
        },
        {
          fields: ["status"],
        },
      ],
    }
  );
  return EmployeeAssignment;
};
