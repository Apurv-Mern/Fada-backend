"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Dealer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Dealer.init(
    {
      name: DataTypes.STRING,
      dealerCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      roleId: DataTypes.INTEGER,
      email: DataTypes.STRING,
      password: DataTypes.TEXT,
      phone: DataTypes.STRING,
      otp: DataTypes.STRING,
      profilePicture: DataTypes.STRING,
      isActive: DataTypes.BOOLEAN,
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      refreshToken: DataTypes.TEXT,
      status: {
        type: DataTypes.ENUM("temporary", "pending", "approved", "rejected"),
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      modelName: "Dealer",
      paranoid: true,
    }
  );
  return Dealer;
};
