"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class EmployeeDesignation extends Model {
    static associate(models) {
      EmployeeDesignation.belongsTo(models.Employee, {
        foreignKey: "employeeId",
        as: "employee",
      });

      EmployeeDesignation.belongsTo(models.OrganizationStructure, {
        foreignKey: "departmentId",
        as: "department",
      });

      EmployeeDesignation.belongsTo(models.OrganizationStructure, {
        foreignKey: "designationId",
        as: "designation",
      });

      EmployeeDesignation.belongsTo(models.Dealer, {
        foreignKey: "dealerId",
        as: "dealership",
      });
    }
  }
  EmployeeDesignation.init(
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
      departmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      designationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
    },
    {
      sequelize,
      modelName: "EmployeeDesignation",
      paranoid: true,
    }
  );
  return EmployeeDesignation;
};
