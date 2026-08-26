"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EmployeeAppreciation extends Model {
    static associate(models) {
      EmployeeAppreciation.belongsTo(models.Employee, {
        foreignKey: "employeeId",
        as: "employee",
      });

      EmployeeAppreciation.belongsTo(models.Dealer, {
        foreignKey: "dealerId",
        as: "dealership",
      });
    }
  }

  EmployeeAppreciation.init(
    {
      employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dealerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      appreciationTitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      issuedBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      appreciationDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      quote: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      attachment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "EmployeeAppreciation",
      paranoid: true,
      indexes: [
        { fields: ["employeeId"] },
        { fields: ["dealerId"] },
      ],
    },
  );

  return EmployeeAppreciation;
};
