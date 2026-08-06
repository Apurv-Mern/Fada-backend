"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EmployeeJourney extends Model {
    static associate(models) {
      EmployeeJourney.belongsTo(models.Employee, {
        foreignKey: "employeeId",
        as: "employee",
      });
    }
  }

  EmployeeJourney.init(
    {
      employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subtitle: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      journeyDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      attachments: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "EmployeeJourney",
      paranoid: true,
      indexes: [
        {
          fields: ["employeeId"],
        },
      ],
    },
  );

  return EmployeeJourney;
};
