"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable("Notifications");

    if (!columns.adminId) {
      await queryInterface.addColumn("Notifications", "adminId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Admins",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      });
    }

    await queryInterface.addIndex("Notifications", ["adminId"], {
      name: "notifications_admin_id_index",
    });

    await queryInterface.addIndex("Notifications", ["adminId", "isRead"], {
      name: "notifications_admin_id_is_read_index",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "Notifications",
      "notifications_admin_id_is_read_index",
    );
    await queryInterface.removeIndex(
      "Notifications",
      "notifications_admin_id_index",
    );

    const columns = await queryInterface.describeTable("Notifications");

    if (columns.adminId) {
      await queryInterface.removeColumn("Notifications", "adminId");
    }
  },
};
