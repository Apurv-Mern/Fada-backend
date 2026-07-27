"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("DealerDocuments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      dealerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Dealers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      documentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Documents",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      documentUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    await queryInterface.addIndex("DealerDocuments", ["dealerId", "documentId"], {
      unique: true,
      name: "dealer_documents_dealer_id_document_id_unique",
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("DealerDocuments");
  },
};
