"use strict";

const SCORE_STAGES = [
  {
    name: "Bronze",
    minScore: 0,
    maxScore: 299,
    colorHex: "#B87333",
    isActive: true,
  },
  {
    name: "Silver",
    minScore: 300,
    maxScore: 599,
    colorHex: "#9CA3AF",
    isActive: true,
  },
  {
    name: "Gold",
    minScore: 600,
    maxScore: 799,
    colorHex: "#F5B300",
    isActive: true,
  },
  {
    name: "Platinum",
    minScore: 800,
    maxScore: 899,
    colorHex: "#7C6AE7",
    isActive: true,
  },
  {
    name: "Diamond",
    minScore: 900,
    maxScore: 1000,
    colorHex: "#3B82F6",
    isActive: true,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const stageNames = SCORE_STAGES.map((stage) => stage.name);

    const [existing] = await queryInterface.sequelize.query(
      `SELECT name FROM ScoreStages WHERE name IN (${stageNames.map(() => "?").join(", ")}) AND deletedAt IS NULL`,
      { replacements: stageNames },
    );

    const existingNames = new Set(existing.map((row) => row.name));
    const stagesToInsert = SCORE_STAGES.filter(
      (stage) => !existingNames.has(stage.name),
    ).map((stage) => ({
      ...stage,
      createdAt: now,
      updatedAt: now,
    }));

    if (!stagesToInsert.length) return;

    return queryInterface.bulkInsert("ScoreStages", stagesToInsert);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("ScoreStages", {
      name: {
        [Sequelize.Op.in]: SCORE_STAGES.map((stage) => stage.name),
      },
    });
  },
};
