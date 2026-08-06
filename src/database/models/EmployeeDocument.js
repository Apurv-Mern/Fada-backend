"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class EmployeeDocument extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      EmployeeDocument.belongsTo(models.Employee, {
        foreignKey: "employeeId",
        as: "employee",
      });

    }
  }
  EmployeeDocument.init(
    {
      employeeId: DataTypes.INTEGER,
      documentId: DataTypes.INTEGER, 
      frontImage: DataTypes.STRING,
      backImage: DataTypes.STRING,
      isApproved: DataTypes.BOOLEAN,
      approvedBy: DataTypes.INTEGER,
      approvedAt: DataTypes.DATE, 
      isVerified: DataTypes.BOOLEAN, 
      status: DataTypes.ENUM("pending", "approved", "rejected"),
    },
    {
      sequelize,
      modelName: "EmployeeDocument",
      paranoid: true,
    }
  );
  return EmployeeDocument;
};


