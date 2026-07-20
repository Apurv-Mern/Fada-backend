"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Dealers", "dealerCode", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("Dealers", "dealerCode");
  },
};
