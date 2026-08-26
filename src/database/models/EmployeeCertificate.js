"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EmployeeCertificate extends Model {
    static associate(models) {
      EmployeeCertificate.belongsTo(models.Employee, {
        foreignKey: "employeeId",
        as: "employee",
      });

      EmployeeCertificate.belongsTo(models.Dealer, {
        foreignKey: "dealerId",
        as: "dealership",
      });
    }
  }

  EmployeeCertificate.init(
    {
      employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dealerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      certificateName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      issuingAuthority: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      issueDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      certificateNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
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
      modelName: "EmployeeCertificate",
      paranoid: true,
      indexes: [
        { fields: ["employeeId"] },
        { fields: ["dealerId"] },
      ],
    },
  );

  return EmployeeCertificate;
};
