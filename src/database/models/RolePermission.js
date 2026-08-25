"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    static associate(models) {
      RolePermission.belongsTo(models.Role, {
        foreignKey: "roleId",
        as: "role",
      });
      RolePermission.belongsTo(models.Permission, {
        foreignKey: "permissionId",
        as: "permission",
      });
    }
  }

  RolePermission.init(
    {
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      permissionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: "RolePermission",
      timestamps: true,
    },
  );

  return RolePermission;
};
