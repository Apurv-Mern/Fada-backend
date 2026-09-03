"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE Roles
      MODIFY COLUMN assignableTo ENUM('staff', 'all', 'dealer') NOT NULL DEFAULT 'staff'
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE Roles SET assignableTo = 'staff' WHERE assignableTo = 'dealer'
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE Roles
      MODIFY COLUMN assignableTo ENUM('staff', 'all') NOT NULL DEFAULT 'staff'
    `);
  },
};
