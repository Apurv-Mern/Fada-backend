const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FADA Backend API",
      version: "1.0.0",
      description: "API documentation for FADA Backend",
    },
    servers: [
      {
        url: `http://localhost:3005`,
        description: "Local server",
      },
      {
        url: `https://api.fadaid.com`,
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
    "./src/docs/swagger/auth.js",
    "./src/docs/swagger/admin.js",
    "./src/docs/swagger/masters.js",
    "./src/docs/swagger/employees.js",
    "./src/docs/swagger/outlets.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
