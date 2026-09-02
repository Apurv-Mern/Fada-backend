const swaggerJsdoc = require("swagger-jsdoc");
const { applyTagGroups } = require("./swaggerTags");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FADA Backend API",
      version: "1.8.0",
      description:
        "FADA Backend API documentation grouped by Admin, Dealer, Employee (auth + mobile app), and Common endpoints. Dealer business APIs accept optional header X-Dealer-Id so a group-holding dealer can act in a child dealer context without changing the login token. Employee department/designation live on EmployeeAssignment (EmployeeDesignation removed).",
    },
    servers: [
      {
        url: "http://localhost:3005",
        description: "Local server",
      },
      {
        url: "https://api.fadaid.com",
        description: "Live server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [
    "./src/docs/swagger/components.js",
    "./src/docs/swagger/common.js",
    "./src/docs/swagger/auth.js",
    "./src/docs/swagger/admin.js",
    "./src/docs/swagger/masters.js",
    "./src/docs/swagger/dealers.js",
    "./src/docs/swagger/dealer-masters.js",
    "./src/docs/swagger/outlets.js",
    "./src/docs/swagger/employees.js",
    "./src/docs/swagger/score-rules.js",
    "./src/docs/swagger/score-stages.js",
    "./src/docs/swagger/announcements.js",
    "./src/docs/swagger/staff.js",
    "./src/docs/swagger/rbac.js",
    "./src/docs/swagger/dashboard.js",
    "./src/docs/swagger/reports.js",
    "./src/docs/swagger/employee*.js",
  ],
};

const swaggerSpec = applyTagGroups(swaggerJsdoc(options));

const employeeMobilePathCount = Object.keys(swaggerSpec.paths || {}).filter(
  (path) => path.startsWith("/api/v1/employee"),
).length;

if (employeeMobilePathCount < 31) {
  console.warn(
    `[swagger] Employee mobile app documentation incomplete (${employeeMobilePathCount} paths). ` +
      "Ensure src/docs/swagger/employee-app.js exists and matches src/api/app/v1/routes.",
  );
}

module.exports = swaggerSpec;
