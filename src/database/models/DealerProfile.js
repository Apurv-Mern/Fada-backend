"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DealerProfile extends Model {
    static associate(models) {
      DealerProfile.belongsTo(models.Dealer, {
        foreignKey: "dealerId",
        as: "dealer",
      });
    }
  }
  DealerProfile.init(
    {
      dealerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      typeOfDealership: DataTypes.STRING,
      yearOfEstablishment: DataTypes.STRING,
      panNumber: {
        type: DataTypes.STRING(10),
        unique: true,
      },
      fadaMembershipId: {
        type: DataTypes.STRING,
        unique: true,
      },
      fadaMemberSince: {
        type: DataTypes.DATEONLY,
        defaultValue: null
      },
    },
    {
      sequelize,
      modelName: "DealerProfile",
      paranoid: true,
    }
  );
  return DealerProfile;
};
