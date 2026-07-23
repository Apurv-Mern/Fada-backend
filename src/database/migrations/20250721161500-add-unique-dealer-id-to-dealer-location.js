"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex("DealerLocations", ["dealerId"], {
      unique: true,
      name: "dealer_locations_dealer_id_unique",
    });
  },
  async down(queryInterface) {
    await queryInterface.removeIndex(
      "DealerLocations",
      "dealer_locations_dealer_id_unique"
    );
  },
};
