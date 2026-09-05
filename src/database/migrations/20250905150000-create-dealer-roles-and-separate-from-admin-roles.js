"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("DealerRoles", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      key: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      isSystem: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isSuperRole: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    await queryInterface.createTable("DealerRolePermissions", {
      dealerRoleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: "DealerRoles", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      permissionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: "Permissions", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addColumn("Dealers", "dealerRoleId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "DealerRoles", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    const [dealerRoles] = await queryInterface.sequelize.query(`
      SELECT id, \`key\`, name, description, isSystem, isSuperRole, isActive, createdAt, updatedAt, deletedAt
      FROM Roles
      WHERE assignableTo = 'dealer'
         OR \`key\` IN ('dealer_admin', 'dealer_manager', 'dealer_viewer')
         OR \`key\` LIKE 'dealer_%'
    `);

    for (const role of dealerRoles) {
      await queryInterface.bulkInsert("DealerRoles", [
        {
          key: role.key,
          name: role.name,
          description: role.description,
          isSystem: role.isSystem,
          isSuperRole: role.isSuperRole,
          isActive: role.isActive,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt,
          deletedAt: role.deletedAt,
        },
      ]);

      const [[createdRole]] = await queryInterface.sequelize.query(
        "SELECT id FROM DealerRoles WHERE `key` = :key LIMIT 1",
        { replacements: { key: role.key } },
      );

      const [rolePermissions] = await queryInterface.sequelize.query(
        "SELECT permissionId FROM RolePermissions WHERE roleId = :roleId",
        { replacements: { roleId: role.id } },
      );

      for (const item of rolePermissions) {
        await queryInterface.bulkInsert("DealerRolePermissions", [
          {
            dealerRoleId: createdRole.id,
            permissionId: item.permissionId,
            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
          },
        ]);
      }

      await queryInterface.sequelize.query(
        `
        UPDATE Dealers
        SET dealerRoleId = :dealerRoleId
        WHERE roleId = :roleId
      `,
        { replacements: { dealerRoleId: createdRole.id, roleId: role.id } },
      );
    }

    if (dealerRoles.length) {
      const dealerRoleIds = dealerRoles.map((role) => role.id);

      await queryInterface.sequelize.query(
        "DELETE FROM RolePermissions WHERE roleId IN (:dealerRoleIds)",
        { replacements: { dealerRoleIds } },
      );

      await queryInterface.sequelize.query(
        "DELETE FROM Roles WHERE id IN (:dealerRoleIds)",
        { replacements: { dealerRoleIds } },
      );
    }

    await queryInterface.removeColumn("Dealers", "roleId");

    await queryInterface.sequelize.query(`
      UPDATE Roles
      SET assignableTo = 'staff'
      WHERE assignableTo IN ('admin', 'dealer', 'employee')
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE Roles
      MODIFY COLUMN assignableTo ENUM('staff', 'all') NOT NULL DEFAULT 'staff'
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Dealers", "roleId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.removeColumn("Dealers", "dealerRoleId");
    await queryInterface.dropTable("DealerRolePermissions");
    await queryInterface.dropTable("DealerRoles");

    await queryInterface.sequelize.query(`
      ALTER TABLE Roles
      MODIFY COLUMN assignableTo ENUM('admin', 'dealer') NOT NULL DEFAULT 'admin'
    `);
  },
};
