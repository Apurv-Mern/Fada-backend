"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class DealerRole extends Model {
    static associate(models) {
      DealerRole.belongsTo(models.Dealer, {
        foreignKey: "dealerId",
        as: "dealer",
      });

      DealerRole.belongsToMany(models.Permission, {
        through: models.DealerRolePermission,
        foreignKey: "dealerRoleId",
        otherKey: "permissionId",
        as: "permissions",
      });

      DealerRole.hasMany(models.Dealer, {
        foreignKey: "dealerRoleId",
        as: "staffMembers",
      });
    }
  }

  DealerRole.init(
    {
      key: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      dealerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: DataTypes.TEXT,
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
    },
    {
      sequelize,
      modelName: "DealerRole",
      paranoid: true,
      indexes: [
        { fields: ["dealerId"] },
        { unique: true, fields: ["dealerId", "key"] },
      ],
    },
  );

  return DealerRole;
};
