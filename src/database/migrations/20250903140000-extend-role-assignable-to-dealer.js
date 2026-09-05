"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE Roles
      MODIFY COLUMN assignableTo ENUM('admin','employee','dealer') NOT NULL DEFAULT 'admin'
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE Roles SET assignableTo = 'admin' WHERE assignableTo = 'dealer'
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE Roles
      MODIFY COLUMN assignableTo ENUM('admin', 'dealer') NOT NULL DEFAULT 'admin'
    `);
  },
};
