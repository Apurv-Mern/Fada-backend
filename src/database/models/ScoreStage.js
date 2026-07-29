"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ScoreStage extends Model {
    static associate(models) {
      // define association here
    }
  }

  ScoreStage.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      minScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      maxScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      colorHex: {
        type: DataTypes.STRING(7),
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "ScoreStage",
      paranoid: true,
    },
  );

  return ScoreStage;
};
