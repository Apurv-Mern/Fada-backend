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
      modelName: "EmployeeAssignment",
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ["employeeId"],
        },
        {
          fields: ["dealerId"],
        },
        {
          fields: ["outletId"],
        },
      ],
    }
  );
  return EmployeeAssignment;
};
