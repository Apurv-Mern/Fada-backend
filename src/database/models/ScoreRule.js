"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ScoreRule extends Model {
    static associate(models) {
      // define association here
    }
  }

  ScoreRule.init(
    {
      category: {
        type: DataTypes.ENUM(
          "Engagement",
          "Growth",
          "Learning",
          "Other",
          "Performance",
          "Recognition",
        ),
        allowNull: false,
      },
      points: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      frequency: {
        type: DataTypes.STRING,
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
      modelName: "ScoreRule",
      paranoid: true,
    },
  );

  return ScoreRule;
};
