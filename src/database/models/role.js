"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      Role.belongsToMany(models.Permission, {
        through: models.RolePermission,
        foreignKey: "roleId",
        otherKey: "permissionId",
        as: "permissions",
      });

      Role.hasMany(models.Admin, {
        foreignKey: "roleId",
        as: "staffMembers",
      });

      Role.hasMany(models.Dealer, {
        foreignKey: "roleId",
        as: "dealerStaffMembers",
      });
    }
  }

  Role.init(
    {
      name: DataTypes.STRING,
      key: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
      },
      description: DataTypes.TEXT,
      assignableTo: {
        type: DataTypes.ENUM("staff", "all", "dealer"),
        allowNull: false,
        defaultValue: "staff",
      },
      isSystem: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isSuperRole: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      updatedBy: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Role",
      paranoid: true,
    },
  );

  return Role;
};
