"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DealerDocument extends Model {
    static associate(models) {
      DealerDocument.belongsTo(models.Dealer, {
        foreignKey: "dealerId",
        as: "dealer",
      });

      DealerDocument.belongsTo(models.Document, {
        foreignKey: "documentId",
        as: "document",
      });
    }
  }
  DealerDocument.init(
    {
      dealerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      documentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      documentUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      modelName: "DealerDocument",
      paranoid: true,
    }
  );
  return DealerDocument;
};
