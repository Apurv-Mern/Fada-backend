"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let columns;
    try {
      columns = await queryInterface.describeTable("EmployeeEmergencyContacts");
    } catch {
      return;
    }

    if (columns.contactPerson && !columns.name) {
      await queryInterface.renameColumn(
        "EmployeeEmergencyContacts",
        "contactPerson",
        "name",
      );
    }

    if (columns.fullName && !columns.name) {
      await queryInterface.renameColumn(
        "EmployeeEmergencyContacts",
        "fullName",
        "name",
      );
    }

    if (columns.contactNumber && !columns.phone) {
      await queryInterface.renameColumn(
        "EmployeeEmergencyContacts",
        "contactNumber",
        "phone",
      );
    }

    if (columns.relationship && !columns.relation) {
      await queryInterface.renameColumn(
        "EmployeeEmergencyContacts",
        "relationship",
        "relation",
      );
    }

    if (columns.type) {
      await queryInterface.removeColumn("EmployeeEmergencyContacts", "type");
    }

    columns = await queryInterface.describeTable("EmployeeEmergencyContacts");

    if (columns.name) {
      await queryInterface.changeColumn("EmployeeEmergencyContacts", "name", {
        type: Sequelize.STRING,
        allowNull: false,
      });
    }

    if (columns.phone) {
      await queryInterface.changeColumn("EmployeeEmergencyContacts", "phone", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (columns.relation) {
      await queryInterface.changeColumn("EmployeeEmergencyContacts", "relation", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (columns.employeeId) {
      await queryInterface.changeColumn(
        "EmployeeEmergencyContacts",
        "employeeId",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Employees",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
      );
    }

    if (columns.isActive) {
      await queryInterface.changeColumn(
        "EmployeeEmergencyContacts",
        "isActive",
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
      );
    }

    await queryInterface
      .addIndex("EmployeeEmergencyContacts", ["employeeId"], {
        name: "employee_emergency_contacts_employee_id_index",
      })
      .catch(() => {});
  },

  async down(queryInterface, Sequelize) {
    let columns;
    try {
      columns = await queryInterface.describeTable("EmployeeEmergencyContacts");
    } catch {
      return;
    }

    if (columns.name && !columns.contactPerson) {
      await queryInterface.renameColumn(
        "EmployeeEmergencyContacts",
        "name",
        "contactPerson",
      );
    }

    if (columns.phone && !columns.contactNumber) {
      await queryInterface.renameColumn(
        "EmployeeEmergencyContacts",
        "phone",
        "contactNumber",
      );
    }

    if (columns.relation && !columns.relationship) {
      await queryInterface.renameColumn(
        "EmployeeEmergencyContacts",
        "relation",
        "relationship",
      );
    }

    if (!columns.type) {
      await queryInterface.addColumn("EmployeeEmergencyContacts", "type", {
        type: Sequelize.ENUM("Family", "Friend", "Colleague", "Office", "Other"),
        allowNull: true,
        defaultValue: "Family",
      });
    }

    await queryInterface
      .removeIndex(
        "EmployeeEmergencyContacts",
        "employee_emergency_contacts_employee_id_index",
      )
      .catch(() => {});
  },
};
