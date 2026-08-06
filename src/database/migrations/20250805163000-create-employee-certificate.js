"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("EmployeeCertificates", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Employees",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      certificateName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      issuingAuthority: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      issueDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      certificateNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      attachment: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "URL or path to certificate PDF/image",
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

    await queryInterface.addIndex("EmployeeCertificates", ["employeeId"], {
      name: "employee_certificates_employee_id_index",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("EmployeeCertificates");
  },
};
