"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DealerLocation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DealerLocation.belongsTo(models.Dealer, {
        foreignKey: "dealerId",
        as: "dealer",
      });
    }
  }
  DealerLocation.init(
    {
      dealerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      pinCode: {
        type: DataTypes.STRING(6),
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "India",
      },
      gstNumber: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "DealerLocation",
      paranoid: true,
    }
  );
  return DealerLocation;
};
