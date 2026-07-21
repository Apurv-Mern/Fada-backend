"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Employees", "fadaId", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    await queryInterface.addColumn("Employees", "status", {
      type: Sequelize.ENUM("temporary", "pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    });

    await queryInterface.addColumn("Employees", "refreshToken", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("Employees", "refreshToken");
    await queryInterface.removeColumn("Employees", "status");
    await queryInterface.removeColumn("Employees", "fadaId");
  },
};
