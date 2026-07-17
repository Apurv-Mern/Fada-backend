"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class EmployeeEmergencyContact extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      EmployeeEmergencyContact.belongsTo(models.Employee, {
        foreignKey: "employeeId",
        as: "employee",
      });

    }
  }
  EmployeeEmergencyContact.init(
    {
      employeeId: DataTypes.INTEGER,
      contactPerson: DataTypes.STRING,
      contactNumber: DataTypes.STRING,
      relationship: DataTypes.STRING,
      type: DataTypes.ENUM("Family", "Friend", "Colleague", "Office", "Other"),
      isActive: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "EmployeeEmergencyContact",
      paranoid: true,
    }
  );
  return EmployeeEmergencyContact;
};





