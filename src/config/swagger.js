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
        url: `http://localhost:${process.env.PORT || 8080}`,
        description: "Local server",
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
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
