"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Dealers", "status", {
      type: Sequelize.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Dealers", "status");
    // Drop the ENUM type created by Postgres/MySQL for this column
    if (queryInterface.sequelize.getDialect() === "postgres") {
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_Dealers_status";'
      );
    }
  },
};
