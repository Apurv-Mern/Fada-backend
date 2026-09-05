"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Roles", [
      {
        name: "Admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        assignableTo: "all",
      },
      {
        name: "Staff",
        createdAt: new Date(),
        updatedAt: new Date(),
        assignableTo: "staff",
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Roles", null, {});
  },
};
