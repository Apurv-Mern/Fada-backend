"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class EmployeeAddress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      EmployeeAddress.belongsTo(models.Employee, {
        foreignKey: "employeeId",
        as: "employee",
      });

    }
  }
  EmployeeAddress.init(
    {
      employeeId: DataTypes.INTEGER,
      addressLine1: DataTypes.STRING,
      addressLine2: DataTypes.STRING,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
      country: DataTypes.STRING,
      pincode: DataTypes.STRING,
      isActive: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "EmployeeAddress",
      paranoid: true,
    }
  );
  return EmployeeAddress;
};


