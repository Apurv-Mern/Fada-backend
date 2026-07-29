"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const outletColumns = await queryInterface.describeTable("Outlets");

    if (!outletColumns.brandId) {
      await queryInterface.addColumn("Outlets", "brandId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Brands",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });

      await queryInterface.sequelize.query(`
        UPDATE Outlets o
        INNER JOIN (
          SELECT outletId, MIN(brandId) AS brandId
          FROM OutletBrandCategories
          WHERE deletedAt IS NULL
          GROUP BY outletId
        ) obc ON obc.outletId = o.id
        SET o.brandId = obc.brandId
        WHERE o.brandId IS NULL
      `);

      await queryInterface.addIndex("Outlets", ["brandId"], {
        name: "outlets_brand_id_index",
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("Outlets", "outlets_brand_id_index");
    await queryInterface.removeColumn("Outlets", "brandId");
  },
};
