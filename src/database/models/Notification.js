"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.Employee, {
        foreignKey: "employeeId",
        as: "employee",
      });

      Notification.belongsTo(models.Dealer, {
        foreignKey: "dealerId",
        as: "dealer",
      });

      Notification.belongsTo(models.Admin, {
        foreignKey: "adminId",
        as: "admin",
      });
    }
  }

  Notification.init(
    {
      employeeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      dealerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      adminId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "general",
      },
      data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      sourceType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sourceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      readAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Notification",
      paranoid: true,
      indexes: [
        { fields: ["employeeId"] },
        { fields: ["dealerId"] },
        { fields: ["adminId"] },
        { fields: ["employeeId", "isRead"] },
        { fields: ["dealerId", "isRead"] },
        { fields: ["adminId", "isRead"] },
        { fields: ["sourceType", "sourceId"] },
      ],
    },
  );

  return Notification;
};
