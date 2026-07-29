const swaggerJsdoc = require("swagger-jsdoc");
const { applyTagGroups } = require("./swaggerTags");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FADA Backend API",
      version: "1.0.0",
      description:
        "FADA Backend API documentation grouped by Admin, Dealer, Employee, and Common endpoints.",
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
    "./src/docs/swagger/outlets.js",
    "./src/docs/swagger/employees.js",
    "./src/docs/swagger/score-rules.js",
    "./src/docs/swagger/score-stages.js",
    "./src/docs/swagger/dashboard.js",
  ],
};

const swaggerSpec = applyTagGroups(swaggerJsdoc(options));

module.exports = swaggerSpec;
