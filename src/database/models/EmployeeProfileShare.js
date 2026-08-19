"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EmployeeProfileShare extends Model {
    static associate(models) {
      EmployeeProfileShare.belongsTo(models.Employee, {
        foreignKey: "employeeId",
        as: "employee",
      });

      EmployeeProfileShare.belongsTo(models.Dealer, {
        foreignKey: "dealerId",
        as: "dealership",
      });
    }
  }

  EmployeeProfileShare.init(
    {
      employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dealerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "EmployeeProfileShare",
      paranoid: true,
      indexes: [
        {
          fields: ["employeeId"],
        },
        {
          fields: ["dealerId"],
        },
        {
          unique: true,
          fields: ["employeeId", "dealerId"],
        },
      ],
    },
  );

  return EmployeeProfileShare;
};
