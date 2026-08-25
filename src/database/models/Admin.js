"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Admin.belongsTo(models.Role, {
        foreignKey: "roleId",
        as: "role",
      });

      Admin.hasMany(models.Announcement, {
        foreignKey: "createdByAdminId",
        as: "announcements",
      });
    }
  }
  Admin.init(
    {
      name: DataTypes.STRING,
      roleId: DataTypes.INTEGER,
      email: DataTypes.STRING,
      password: DataTypes.TEXT,
      phone: DataTypes.STRING,
      otp: DataTypes.STRING,
      profilePicture: DataTypes.STRING,
      isActive: DataTypes.BOOLEAN,
      refreshToken: DataTypes.TEXT,
      mustChangePassword: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isEditable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      isDeletable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Admin",
      paranoid: true,
    }
  );
  return Admin;
};
