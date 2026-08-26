"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EmployeeTraining extends Model {
    static associate(models) {
      EmployeeTraining.belongsTo(models.Employee, {
        foreignKey: "employeeId",
        as: "employee",
      });

      EmployeeTraining.belongsTo(models.Dealer, {
        foreignKey: "dealerId",
        as: "dealership",
      });
    }
  }

  EmployeeTraining.init(
    {
      employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dealerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      trainingTitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      trainingProvider: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      completionDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      keyLearnings: {
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
      modelName: "EmployeeTraining",
      paranoid: true,
      indexes: [
        { fields: ["employeeId"] },
        { fields: ["dealerId"] },
      ],
    },
  );

  return EmployeeTraining;
};
