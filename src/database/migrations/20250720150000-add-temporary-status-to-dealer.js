"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // MySQL ENUM alteration: recreate column with expanded values
    await queryInterface.changeColumn("Dealers", "status", {
      type: require("sequelize").ENUM(
        "temporary",
        "pending",
        "approved",
        "rejected"
      ),
      allowNull: false,
      defaultValue: "pending",
    });
  },
  async down(queryInterface) {
    await queryInterface.changeColumn("Dealers", "status", {
      type: require("sequelize").ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    });
  },
};
