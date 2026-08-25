"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Modules", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      key: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

    await queryInterface.createTable("Permissions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      moduleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Modules", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      key: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      action: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    await queryInterface.addColumn("Roles", "key", {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn("Roles", "description", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("Roles", "assignableTo", {
      type: Sequelize.ENUM("staff", "all"),
      allowNull: false,
      defaultValue: "staff",
    });
    await queryInterface.addColumn("Roles", "isSystem", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn("Roles", "isSuperRole", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn("Roles", "isActive", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.createTable("RolePermissions", {
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: "Roles", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      permissionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: "Permissions", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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

    await queryInterface.addColumn("Admins", "isEditable", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
    await queryInterface.addColumn("Admins", "isDeletable", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addIndex("Permissions", ["moduleId"], {
      name: "permissions_module_id_index",
    });
    await queryInterface.addIndex("RolePermissions", ["roleId"], {
      name: "role_permissions_role_id_index",
    });
    await queryInterface.addIndex("RolePermissions", ["permissionId"], {
      name: "role_permissions_permission_id_index",
    });
    await queryInterface.addIndex("Admins", ["roleId"], {
      name: "admins_role_id_index",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("Admins", "admins_role_id_index");
    await queryInterface.dropTable("RolePermissions");
    await queryInterface.removeColumn("Admins", "isDeletable");
    await queryInterface.removeColumn("Admins", "isEditable");
    await queryInterface.removeColumn("Roles", "isActive");
    await queryInterface.removeColumn("Roles", "isSuperRole");
    await queryInterface.removeColumn("Roles", "isSystem");
    await queryInterface.removeColumn("Roles", "assignableTo");
    await queryInterface.removeColumn("Roles", "description");
    await queryInterface.removeColumn("Roles", "key");
    await queryInterface.dropTable("Permissions");
    await queryInterface.dropTable("Modules");
  },
};
