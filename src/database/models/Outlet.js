"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Outlet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Outlet.belongsTo(models.Dealer, {
        foreignKey: "dealerId",
        as: "company",
      });

      Outlet.hasMany(models.OutletBrandCategory, {
        foreignKey: "outletId",
        as: "brandCategories",
      });

      Outlet.belongsToMany(models.Brand, {
        through: models.OutletBrandCategory,
        foreignKey: "outletId",
        otherKey: "brandId",
        as: "linkedBrands",
      });

      Outlet.hasMany(models.EmployeeAssignment, {
        foreignKey: "outletId",
        as: "employeeAssignments",
      });

      Outlet.belongsTo(models.Brand, {
        foreignKey: "brandId",
        as: "brand",
      });
    }
  }
  Outlet.init(
    {
      dealerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      manager: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pinCode: {
        type: DataTypes.STRING(6),
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      functions: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      brandId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Outlet",
      paranoid: true,
      indexes: [
        {
          fields: ["dealerId"],
        },
        {
          unique: true,
          fields: ["dealerId", "code"],
        },
      ],
    }
  );
  return Outlet;
};
