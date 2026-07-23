"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class OutletBrandCategory extends Model {
    static associate(models) {
      OutletBrandCategory.belongsTo(models.Outlet, {
        foreignKey: "outletId",
        as: "outlet",
      });

      OutletBrandCategory.belongsTo(models.Brand, {
        foreignKey: "brandId",
        as: "brand",
      });
    }
  }
  OutletBrandCategory.init(
    {
      outletId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      brandId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      vehicleClassId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "OutletBrandCategory",
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ["outletId", "brandId", "vehicleClassId"],
        },
      ],
    }
  );
  return OutletBrandCategory;
};
