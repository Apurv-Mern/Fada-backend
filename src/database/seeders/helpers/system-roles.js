"use strict";

const SYSTEM_ROLES = [
  {
    key: "admin",
    name: "Admin",
    description: "Full access to every module in the FADA Admin Portal.",
    assignableTo: "all",
    isSystem: true,
    isSuperRole: true,
    isActive: true,
  },
  {
    key: "staff",
    name: "Staff",
    description: "FADA staff who manage companies and verify employees.",
    assignableTo: "staff",
    isSystem: true,
    isSuperRole: false,
    isActive: true,
  },
];

const ADMIN_ROLE_KEY = "admin";
const STAFF_ROLE_KEY = "staff";
const SUPER_ADMIN_EMAIL = "superadmin@gmail.com";

async function getRoleIdByKey(queryInterface, roleKey) {
  const [[role]] = await queryInterface.sequelize.query(
    "SELECT id FROM Roles WHERE `key` = :roleKey LIMIT 1",
    { replacements: { roleKey } },
  );
  return role?.id ?? null;
}

async function syncSystemRoles(queryInterface) {
  const now = new Date();

  for (const role of SYSTEM_ROLES) {
    const [[existingByKey]] = await queryInterface.sequelize.query(
      "SELECT id FROM Roles WHERE `key` = :key LIMIT 1",
      { replacements: { key: role.key } },
    );

    if (existingByKey) {
      await queryInterface.sequelize.query(
        `
        UPDATE Roles
        SET name = :name,
            description = :description,
            assignableTo = :assignableTo,
            isSystem = :isSystem,
            isSuperRole = :isSuperRole,
            isActive = :isActive,
            updatedAt = :updatedAt
        WHERE \`key\` = :key
      `,
        {
          replacements: {
            key: role.key,
            name: role.name,
            description: role.description,
            assignableTo: role.assignableTo,
            isSystem: role.isSystem,
            isSuperRole: role.isSuperRole,
            isActive: role.isActive,
            updatedAt: now,
          },
        },
      );
      continue;
    }

    const [[legacyByName]] = await queryInterface.sequelize.query(
      "SELECT id FROM Roles WHERE (`key` IS NULL OR `key` = '') AND name = :name LIMIT 1",
      { replacements: { name: role.name } },
    );

    if (legacyByName) {
      await queryInterface.sequelize.query(
        `
        UPDATE Roles
        SET \`key\` = :key,
            name = :name,
            description = :description,
            assignableTo = :assignableTo,
            isSystem = :isSystem,
            isSuperRole = :isSuperRole,
            isActive = :isActive,
            updatedAt = :updatedAt
        WHERE id = :id
      `,
        {
          replacements: {
            id: legacyByName.id,
            key: role.key,
            name: role.name,
            description: role.description,
            assignableTo: role.assignableTo,
            isSystem: role.isSystem,
            isSuperRole: role.isSuperRole,
            isActive: role.isActive,
            updatedAt: now,
          },
        },
      );
      continue;
    }

    await queryInterface.bulkInsert("Roles", [
      {
        key: role.key,
        name: role.name,
        description: role.description,
        assignableTo: role.assignableTo,
        isSystem: role.isSystem,
        isSuperRole: role.isSuperRole,
        isActive: role.isActive,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }
}

async function syncSuperAdminAccount(queryInterface) {
  const now = new Date();
  const adminRoleId = await getRoleIdByKey(queryInterface, ADMIN_ROLE_KEY);
  if (!adminRoleId) return;

  const [[existingAdmin]] = await queryInterface.sequelize.query(
    "SELECT id FROM Admins WHERE email = :email LIMIT 1",
    { replacements: { email: SUPER_ADMIN_EMAIL } },
  );

  if (existingAdmin) {
    await queryInterface.sequelize.query(
      `
      UPDATE Admins
      SET roleId = :roleId,
          isEditable = false,
          isDeletable = false,
          updatedAt = :updatedAt
      WHERE email = :email
    `,
      {
        replacements: {
          email: SUPER_ADMIN_EMAIL,
          roleId: adminRoleId,
          updatedAt: now,
        },
      },
    );
    return;
  }

  const { hashPassword } = require("../../utils/passwordUtil");

  await queryInterface.bulkInsert("Admins", [
    {
      name: "Super Admin",
      email: SUPER_ADMIN_EMAIL,
      password: await hashPassword("12345678"),
      isActive: true,
      roleId: adminRoleId,
      isEditable: false,
      isDeletable: false,
      createdAt: now,
      updatedAt: now,
    },
  ]);
}

async function assignDefaultStaffRoleToAdmins(queryInterface) {
  const staffRoleId = await getRoleIdByKey(queryInterface, STAFF_ROLE_KEY);
  if (!staffRoleId) return;

  await queryInterface.sequelize.query(
    `
    UPDATE Admins
    SET roleId = :staffRoleId,
        isEditable = true,
        isDeletable = true
    WHERE email != :superAdminEmail
      AND (roleId IS NULL OR roleId = 0)
  `,
    {
      replacements: {
        staffRoleId,
        superAdminEmail: SUPER_ADMIN_EMAIL,
      },
    },
  );
}

module.exports = {
  SYSTEM_ROLES,
  ADMIN_ROLE_KEY,
  STAFF_ROLE_KEY,
  SUPER_ADMIN_EMAIL,
  getRoleIdByKey,
  syncSystemRoles,
  syncSuperAdminAccount,
  assignDefaultStaffRoleToAdmins,
};
