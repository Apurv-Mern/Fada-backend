"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const table = await queryInterface.describeTable("OutletBrandCategories");

    if (table.category) {
      await queryInterface.sequelize.query(`
        ALTER TABLE \`OutletBrandCategories\`
        CHANGE \`category\` \`vehicleClassId\` INT NOT NULL
      `);
    }

    const [indexes] = await queryInterface.sequelize.query(
      "SHOW INDEX FROM `OutletBrandCategories`"
    );
    const indexNames = new Set(indexes.map((index) => index.Key_name));

    if (
      indexNames.has("outlet_brand_categories_outlet_brand_category_unique") &&
      !indexNames.has("outlet_brand_categories_outlet_brand_vehicle_class_unique")
    ) {
      await queryInterface.sequelize.query(`
        ALTER TABLE \`OutletBrandCategories\`
        RENAME INDEX \`outlet_brand_categories_outlet_brand_category_unique\`
        TO \`outlet_brand_categories_outlet_brand_vehicle_class_unique\`
      `);
    }
  },
  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("OutletBrandCategories");

    const [indexes] = await queryInterface.sequelize.query(
      "SHOW INDEX FROM `OutletBrandCategories`"
    );
    const indexNames = new Set(indexes.map((index) => index.Key_name));

    if (
      indexNames.has("outlet_brand_categories_outlet_brand_vehicle_class_unique") &&
      !indexNames.has("outlet_brand_categories_outlet_brand_category_unique")
    ) {
      await queryInterface.sequelize.query(`
        ALTER TABLE \`OutletBrandCategories\`
        RENAME INDEX \`outlet_brand_categories_outlet_brand_vehicle_class_unique\`
        TO \`outlet_brand_categories_outlet_brand_category_unique\`
      `);
    }

    if (table.vehicleClassId) {
      await queryInterface.sequelize.query(`
        ALTER TABLE \`OutletBrandCategories\`
        CHANGE \`vehicleClassId\` \`category\` VARCHAR(255) NOT NULL
      `);
    }
  },
};
