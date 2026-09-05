"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("DealerRoles", "dealerId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Dealers",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.removeIndex("DealerRoles", "key").catch(() => {});

    await queryInterface.addIndex("DealerRoles", ["dealerId"], {
      name: "dealer_roles_dealer_id_index",
    });

    await queryInterface.addIndex("DealerRoles", ["dealerId", "key"], {
      unique: true,
      name: "dealer_roles_dealer_id_key_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "DealerRoles",
      "dealer_roles_dealer_id_key_unique",
    );
    await queryInterface.removeIndex(
      "DealerRoles",
      "dealer_roles_dealer_id_index",
    );

    await queryInterface.addIndex("DealerRoles", ["key"], {
      unique: true,
      name: "key",
    });

    await queryInterface.removeColumn("DealerRoles", "dealerId");
  },
};
