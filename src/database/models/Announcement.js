"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Announcement extends Model {
    static associate(models) {
      Announcement.belongsTo(models.Admin, {
        foreignKey: "createdByAdminId",
        as: "createdBy",
      });
    }
  }

  Announcement.init(
    {
      createdByAdminId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      postType: {
        type: DataTypes.ENUM("announcement_circular"),
        allowNull: false,
        defaultValue: "announcement_circular",
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      messageBody: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      targetAudience: {
        type: DataTypes.ENUM(
          "employees",
          "dealers",
          "members_and_dealers",
          "both",
        ),
        allowNull: false,
      },
      deliveryChannels: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: ["in_app"],
      },
      status: {
        type: DataTypes.ENUM("draft", "published", "scheduled"),
        allowNull: false,
        defaultValue: "draft",
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      scheduledAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Announcement",
      paranoid: true,
      indexes: [
        { fields: ["status"] },
        { fields: ["targetAudience"] },
        { fields: ["createdByAdminId"] },
      ],
    },
  );

  return Announcement;
};
