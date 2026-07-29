"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ScoreStages", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      minScore: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      maxScore: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      colorHex: {
        type: Sequelize.STRING(7),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    await queryInterface.addIndex("ScoreStages", ["name"], {
      unique: true,
      name: "score_stages_name_unique",
    });
    await queryInterface.addIndex("ScoreStages", ["minScore"]);
    await queryInterface.addIndex("ScoreStages", ["maxScore"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("ScoreStages");
  },
};
