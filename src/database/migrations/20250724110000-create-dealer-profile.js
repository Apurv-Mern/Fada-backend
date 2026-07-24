"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("DealerProfiles", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      dealerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "Dealers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      typeOfDealership: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      yearOfEstablishment: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      panNumber: {
        type: Sequelize.STRING(10),
        allowNull: true,
        unique: true,
      },
      fadaMembershipId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      fadaMemberSince: {
        type: Sequelize.DATEONLY,
        allowNull: true,
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
  },
  async down(queryInterface) {
    await queryInterface.dropTable("DealerProfiles");
  },
};
