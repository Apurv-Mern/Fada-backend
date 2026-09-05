"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class DealerRolePermission extends Model {
    static associate(models) {
      DealerRolePermission.belongsTo(models.DealerRole, {
        foreignKey: "dealerRoleId",
        as: "dealerRole",
      });
      DealerRolePermission.belongsTo(models.Permission, {
        foreignKey: "permissionId",
        as: "permission",
      });
    }
  }

  DealerRolePermission.init(
    {
      dealerRoleId: {
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
      modelName: "DealerRolePermission",
      timestamps: true,
    },
  );

  return DealerRolePermission;
};
