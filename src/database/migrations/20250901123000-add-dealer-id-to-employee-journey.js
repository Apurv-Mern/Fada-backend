"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("EmployeeJourneys", "dealerId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Dealers",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addIndex("EmployeeJourneys", ["dealerId"], {
      name: "employeejourneys_dealer_id_index",
    });

    await queryInterface.sequelize.query(`
      UPDATE \`EmployeeJourneys\` AS target
      INNER JOIN EmployeeAssignments AS assignment
        ON assignment.employeeId = target.employeeId
        AND assignment.isCurrentlyWorking = true
        AND assignment.deletedAt IS NULL
      SET target.dealerId = assignment.dealerId
      WHERE target.dealerId IS NULL
    `);

    await queryInterface.sequelize.query(`
      UPDATE \`EmployeeJourneys\` AS target
      INNER JOIN (
        SELECT ea.employeeId, ea.dealerId
        FROM EmployeeAssignments AS ea
        INNER JOIN (
          SELECT employeeId, MAX(createdAt) AS latestCreatedAt
          FROM EmployeeAssignments
          WHERE deletedAt IS NULL
          GROUP BY employeeId
        ) AS latest ON latest.employeeId = ea.employeeId
          AND latest.latestCreatedAt = ea.createdAt
        WHERE ea.deletedAt IS NULL
      ) AS assignment ON assignment.employeeId = target.employeeId
      SET target.dealerId = assignment.dealerId
      WHERE target.dealerId IS NULL
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "EmployeeJourneys",
      "employeejourneys_dealer_id_index",
    );
    await queryInterface.removeColumn("EmployeeJourneys", "dealerId");
  },
};
