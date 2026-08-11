"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EmployeeEmployerStatus extends Model {
    static associate(models) {
      EmployeeEmployerStatus.belongsTo(models.EmployeeAssignment, {
        foreignKey: "employeeAssignmentId",
        as: "assignment",
      });
    }
  }

  EmployeeEmployerStatus.init(
    {
      employeeAssignmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      actionUserBy: {
        type: DataTypes.ENUM("admin", "dealer", "employee"),
        allowNull: true,
      },
      actionUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "EmployeeEmployerStatus",
      paranoid: true,
      indexes: [
        { fields: ["employeeAssignmentId"] },
        { fields: ["status"] },
        { fields: ["slug"] },
        { fields: ["actionUserBy"] },
      ],
    },
  );

  return EmployeeEmployerStatus;
};
