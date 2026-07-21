"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class OrganizationStructure extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      OrganizationStructure.belongsTo(models.OrganizationStructure, {
        foreignKey: "parentId",
        as: "parent",
      });

      OrganizationStructure.hasMany(models.OrganizationStructure, {
        foreignKey: "parentId",
        as: "children",
      });
    }
  }
  OrganizationStructure.init(
    {
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
         
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      flag: {
        type: DataTypes.ENUM("business_function", "department", "role"),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "OrganizationStructure",
      paranoid: true,
    }
  );
  return OrganizationStructure;
};
