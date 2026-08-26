"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EmployeeSkill extends Model {
    static associate(models) {
      EmployeeSkill.belongsTo(models.Employee, {
        foreignKey: "employeeId",
        as: "employee",
      });

      EmployeeSkill.belongsTo(models.Dealer, {
        foreignKey: "dealerId",
        as: "dealership",
      });
    }
  }

  EmployeeSkill.init(
    {
      employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dealerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      skillName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      skillCategory: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      proficiencyLevel: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      learningSource: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      skillDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "EmployeeSkill",
      paranoid: true,
      indexes: [
        { fields: ["employeeId"] },
        { fields: ["dealerId"] },
      ],
    },
  );

  return EmployeeSkill;
};
