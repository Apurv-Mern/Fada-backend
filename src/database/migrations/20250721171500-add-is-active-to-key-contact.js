"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("KeyContacts", "isActive", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("KeyContacts", "isActive");
  },
};
