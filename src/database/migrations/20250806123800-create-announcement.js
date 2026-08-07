"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Announcements", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      createdByAdminId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Admins",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      postType: {
        type: Sequelize.ENUM("announcement_circular"),
        allowNull: false,
        defaultValue: "announcement_circular",
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      messageBody: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      targetAudience: {
        type: Sequelize.ENUM(
          "employees",
          "dealers",
          "members_and_dealers",
          "all",
        ),
        allowNull: false,
      },
      deliveryChannels: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: ["in_app"],
        comment: "Selected channels e.g. in_app, email, push",
      },
      status: {
        type: Sequelize.ENUM("draft", "published", "scheduled"),
        allowNull: false,
        defaultValue: "draft",
      },
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      scheduledAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex("Announcements", ["status"], {
      name: "announcements_status_index",
    });

    await queryInterface.addIndex("Announcements", ["targetAudience"], {
      name: "announcements_target_audience_index",
    });

    await queryInterface.addIndex("Announcements", ["createdByAdminId"], {
      name: "announcements_created_by_admin_id_index",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Announcements");
  },
};
