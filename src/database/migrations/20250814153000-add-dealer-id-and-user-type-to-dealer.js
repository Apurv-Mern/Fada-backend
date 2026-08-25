"use strict";

const DEALER_ALPHABET = "ABCDEFGHJKMNPRTUVWXY";
const DEALER_DIGITS = "0123456789";

function generateRandomString(characters, length) {
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return result;
}

function makeDealerId() {
  const letters = generateRandomString(DEALER_ALPHABET, 2);
  const digits = generateRandomString(DEALER_DIGITS, 5);
  return `DLR-${letters}-${digits}`;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Dealers", "dealerId", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    const [dealers] = await queryInterface.sequelize.query(
      "SELECT id FROM Dealers WHERE dealerId IS NULL",
    );

    const used = new Set();
    for (const dealer of dealers) {
      let dealerId = makeDealerId();
      while (used.has(dealerId)) {
        dealerId = makeDealerId();
      }
      used.add(dealerId);

      await queryInterface.sequelize.query(
        "UPDATE Dealers SET dealerId = :dealerId WHERE id = :id",
        {
          replacements: { dealerId, id: dealer.id },
        },
      );
    }

    await queryInterface.addColumn("Dealers", "userType", {
      type: Sequelize.ENUM("dealer", "staff"),
      allowNull: false,
      defaultValue: "dealer",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Dealers", "userType");
    await queryInterface.removeColumn("Dealers", "dealerId");
  },
};
