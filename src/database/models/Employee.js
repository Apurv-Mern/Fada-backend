"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Employee.hasMany(models.EmployeeAddress, {
        foreignKey: "employeeId",
        as: "addresses",
      });

      Employee.hasMany(models.EmployeeDocument, {
        foreignKey: "employeeId",
        as: "documents",
      });

    }
  }
  Employee.init(
    {
      fadaId: DataTypes.STRING,
      dealerId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.TEXT,
      phone: DataTypes.STRING,
      otp: DataTypes.STRING,
      mpin: DataTypes.STRING,
      dob: DataTypes.STRING,
      gender: DataTypes.STRING,
      profilePicture: DataTypes.STRING,
      isActive: DataTypes.BOOLEAN,
      isVerified: DataTypes.BOOLEAN,
      isPhoneVerified: DataTypes.BOOLEAN,
      isEmailVerified: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Employee",
      paranoid: true,
    }
  );
  return Employee;
};
