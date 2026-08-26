"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Announcements", "postType", {
      type: Sequelize.ENUM(
        "updates",
        "reminders",
        "celebration",
        "announcement",
        "announcement_circular",
      ),
      allowNull: false,
      defaultValue: "announcement",
    });

    await queryInterface.sequelize.query(
      "UPDATE Announcements SET postType = 'announcement' WHERE postType = 'announcement_circular'",
    );

    await queryInterface.changeColumn("Announcements", "postType", {
      type: Sequelize.ENUM("updates", "reminders", "celebration", "announcement"),
      allowNull: false,
      defaultValue: "announcement",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Announcements", "postType", {
      type: Sequelize.ENUM("announcement_circular", "announcement"),
      allowNull: false,
      defaultValue: "announcement_circular",
    });

    await queryInterface.sequelize.query(
      "UPDATE Announcements SET postType = 'announcement_circular' WHERE postType = 'announcement'",
    );

    await queryInterface.changeColumn("Announcements", "postType", {
      type: Sequelize.ENUM("announcement_circular"),
      allowNull: false,
      defaultValue: "announcement_circular",
    });
  },
};
