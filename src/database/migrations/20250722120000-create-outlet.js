"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Outlets", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      dealerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Dealers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      manager: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pinCode: {
        type: Sequelize.STRING(6),
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      brandCategories: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      functions: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex("Outlets", ["dealerId"], {
      name: "outlets_dealer_id_index",
    });

    await queryInterface.addIndex("Outlets", ["dealerId", "code"], {
      unique: true,
      name: "outlets_dealer_id_code_unique",
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Outlets");
  },
};
