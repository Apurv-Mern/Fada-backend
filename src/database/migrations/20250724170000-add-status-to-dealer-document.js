"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("DealerDocuments", "status", {
      type: Sequelize.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    });

    await queryInterface.sequelize.query(
      "UPDATE DealerDocuments SET status = 'approved' WHERE isVerified = true"
    );
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("DealerDocuments", "status");
  },
};
