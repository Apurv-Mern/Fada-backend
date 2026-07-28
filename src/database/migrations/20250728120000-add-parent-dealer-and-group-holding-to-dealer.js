"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Dealers", "parentDealerId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Dealers",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("Dealers", "isGroupHoldingEntity", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addIndex("Dealers", ["parentDealerId"]);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("Dealers", ["parentDealerId"]);
    await queryInterface.removeColumn("Dealers", "isGroupHoldingEntity");
    await queryInterface.removeColumn("Dealers", "parentDealerId");
  },
};
