"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EmployeeEmergencyContact extends Model {
    static associate(models) {
      EmployeeEmergencyContact.belongsTo(models.Employee, {
        foreignKey: "employeeId",
        as: "employee",
      });
    }
  }

  EmployeeEmergencyContact.init(
    {
      employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      relation: {
        type: DataTypes.STRING,
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
      modelName: "EmployeeEmergencyContact",
      paranoid: true,
      indexes: [
        {
          fields: ["employeeId"],
        },
      ],
    },
  );

  return EmployeeEmergencyContact;
};
