"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable("ScoreStages");

    if (!columns.icon) {
      await queryInterface.addColumn("ScoreStages", "icon", {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Icon URL or icon identifier for the stage",
      });
    }
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable("ScoreStages");

    if (columns.icon) {
      await queryInterface.removeColumn("ScoreStages", "icon");
    }
  },
};
