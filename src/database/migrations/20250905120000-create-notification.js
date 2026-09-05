"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Notifications", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Employees",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      dealerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Dealers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "general",
        comment: "e.g. announcement, employment, invitation, system",
      },
      data: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Optional payload for in-app navigation or metadata",
      },
      sourceType: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Related entity type e.g. Announcement",
      },
      sourceId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "Related entity id",
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      readAt: {
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

    await queryInterface.addIndex("Notifications", ["employeeId"], {
      name: "notifications_employee_id_index",
    });

    await queryInterface.addIndex("Notifications", ["dealerId"], {
      name: "notifications_dealer_id_index",
    });

    await queryInterface.addIndex("Notifications", ["employeeId", "isRead"], {
      name: "notifications_employee_id_is_read_index",
    });

    await queryInterface.addIndex("Notifications", ["dealerId", "isRead"], {
      name: "notifications_dealer_id_is_read_index",
    });

    await queryInterface.addIndex("Notifications", ["sourceType", "sourceId"], {
      name: "notifications_source_type_source_id_index",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Notifications");
  },
};
