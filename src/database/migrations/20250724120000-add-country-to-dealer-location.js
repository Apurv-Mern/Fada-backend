"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("DealerLocations", "country", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "India",
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("DealerLocations", "country");
  },
};
