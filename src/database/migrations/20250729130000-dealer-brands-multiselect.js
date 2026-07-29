"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dealerColumns = await queryInterface.describeTable("Dealers");
    const hasBrandsColumn = Boolean(dealerColumns.brands);
    const hasBrandIdColumn = Boolean(dealerColumns.brandId);

    if (!hasBrandsColumn) {
      await queryInterface.addColumn("Dealers", "brands", {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      });
    }

    if (hasBrandIdColumn) {
      await queryInterface.sequelize.query(`
        UPDATE Dealers
        SET brands = JSON_ARRAY(brandId)
        WHERE brandId IS NOT NULL
      `);

      await queryInterface.removeConstraint(
        "Dealers",
        "Dealers_brandId_foreign_idx",
      );
      await queryInterface.removeIndex("Dealers", ["brandId"]);
      await queryInterface.removeColumn("Dealers", "brandId");
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Dealers", "brandId", {
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
      UPDATE Dealers
      SET brandId = CAST(JSON_UNQUOTE(JSON_EXTRACT(brands, '$[0]')) AS UNSIGNED)
      WHERE brands IS NOT NULL
        AND JSON_TYPE(brands) = 'ARRAY'
        AND JSON_LENGTH(brands) > 0
    `);

    await queryInterface.removeColumn("Dealers", "brands");
    await queryInterface.addIndex("Dealers", ["brandId"]);
  },
};
