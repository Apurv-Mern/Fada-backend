"use strict";

const FIRST_DIGIT = "123456789";
const OTHER_DIGITS = "0123456789";
const MAX_RETRIES = 50;

function randomChar(characters) {
  return characters[Math.floor(Math.random() * characters.length)];
}

function randomDigits(length) {
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += randomChar(OTHER_DIGITS);
  }
  return result;
}

function makeDealerPublicCode() {
  return `DL${randomChar(FIRST_DIGIT)}${randomDigits(4)}`;
}

function makeOutletPublicCode() {
  return `OT${randomChar(FIRST_DIGIT)}${randomDigits(5)}`;
}

async function assignUniqueCode(queryInterface, table, field, makeCode, usedCodes) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    const code = makeCode();
    if (usedCodes.has(code)) continue;

    const [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM \`${table}\` WHERE \`${field}\` = :code LIMIT 1`,
      { replacements: { code } },
    );
    if (existing.length) continue;

    usedCodes.add(code);
    return code;
  }

  throw new Error(`Unable to generate unique ${table}.${field}`);
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Dealers", "dealerCode", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    const usedOutletCodes = new Set();
    const [outletsMissingCode] = await queryInterface.sequelize.query(
      "SELECT id FROM Outlets WHERE code IS NULL OR code = ''",
    );

    for (const outlet of outletsMissingCode) {
      const code = await assignUniqueCode(
        queryInterface,
        "Outlets",
        "code",
        makeOutletPublicCode,
        usedOutletCodes,
      );
      await queryInterface.sequelize.query(
        "UPDATE Outlets SET code = :code WHERE id = :id",
        { replacements: { code, id: outlet.id } },
      );
    }

    const [duplicateOutletCodes] = await queryInterface.sequelize.query(`
      SELECT code, GROUP_CONCAT(id ORDER BY id) AS ids
      FROM Outlets
      WHERE code IS NOT NULL AND code != ''
      GROUP BY code
      HAVING COUNT(*) > 1
    `);

    for (const row of duplicateOutletCodes) {
      const ids = String(row.ids)
        .split(",")
        .slice(1)
        .map(Number)
        .filter(Boolean);

      for (const id of ids) {
        const code = await assignUniqueCode(
          queryInterface,
          "Outlets",
          "code",
          makeOutletPublicCode,
          usedOutletCodes,
        );
        await queryInterface.sequelize.query(
          "UPDATE Outlets SET code = :code WHERE id = :id",
          { replacements: { code, id } },
        );
      }
    }

    await queryInterface.removeIndex("Outlets", "outlets_dealer_id_code_unique");

    await queryInterface.changeColumn("Outlets", "code", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });

    await queryInterface.addIndex("Outlets", ["code"], {
      unique: true,
      name: "outlets_code_unique",
    });

    const usedDealerIds = new Set();
    const [dealersToBackfill] = await queryInterface.sequelize.query(`
      SELECT id, dealerId
      FROM Dealers
      WHERE dealerId IS NULL
        OR dealerId LIKE 'DLR-%'
        OR dealerId NOT REGEXP '^DL[1-9][0-9]{4}$'
    `);

    for (const dealer of dealersToBackfill) {
      if (dealer.dealerId && /^DL[1-9][0-9]{4}$/.test(dealer.dealerId)) {
        usedDealerIds.add(dealer.dealerId);
        continue;
      }

      const dealerId = await assignUniqueCode(
        queryInterface,
        "Dealers",
        "dealerId",
        makeDealerPublicCode,
        usedDealerIds,
      );
      await queryInterface.sequelize.query(
        "UPDATE Dealers SET dealerId = :dealerId WHERE id = :id",
        { replacements: { dealerId, id: dealer.id } },
      );
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("Outlets", "outlets_code_unique");

    await queryInterface.changeColumn("Outlets", "code", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false,
    });

    await queryInterface.addIndex("Outlets", ["dealerId", "code"], {
      unique: true,
      name: "outlets_dealer_id_code_unique",
    });

    await queryInterface.changeColumn("Dealers", "dealerCode", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },
};
