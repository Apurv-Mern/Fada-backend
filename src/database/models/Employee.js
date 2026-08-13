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

      Employee.hasMany(models.EmployeeEmergencyContact, {
        foreignKey: "employeeId",
        as: "emergencyContacts",
      });

      Employee.hasMany(models.EmployeeDocument, {
        foreignKey: "employeeId",
        as: "documents",
      });

      Employee.hasMany(models.EmployeeCertificate, {
        foreignKey: "employeeId",
        as: "certificates",
      });

      Employee.hasMany(models.EmployeeSkill, {
        foreignKey: "employeeId",
        as: "skills",
      });

      Employee.hasMany(models.EmployeeTraining, {
        foreignKey: "employeeId",
        as: "trainings",
      });

      Employee.hasMany(models.EmployeeAppreciation, {
        foreignKey: "employeeId",
        as: "appreciations",
      });

      Employee.hasMany(models.EmployeePromotion, {
        foreignKey: "employeeId",
        as: "promotions",
      });

      Employee.hasMany(models.EmployeeJourney, {
        foreignKey: "employeeId",
        as: "journeys",
      });

      Employee.hasMany(models.EmployeeProfileShare, {
        foreignKey: "employeeId",
        as: "profileShares",
      });

      Employee.hasOne(models.EmployeeAssignment, {
        foreignKey: "employeeId",
        as: "assignment",
      });
    }
  }
  Employee.init(
    {
      fadaId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.TEXT,
      phone: DataTypes.STRING,
      otp: DataTypes.STRING,
      emailOTP: DataTypes.STRING,
      mpin: DataTypes.STRING,
      dob: DataTypes.STRING,
      gender: DataTypes.STRING,
      bloodGroup: DataTypes.STRING,
      profilePicture: DataTypes.STRING,
      isProfilePrivate: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isRegistrationCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isProfileCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isKycCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isJourneyCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isActive: DataTypes.BOOLEAN,
      isVerified: DataTypes.BOOLEAN,
      isPhoneVerified: DataTypes.BOOLEAN,
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      refreshToken: DataTypes.TEXT,
      status: {
        type: DataTypes.ENUM("temporary", "pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      joinedDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Employee",
      paranoid: true,
    }
  );
  return Employee;
};
