// src/app.js

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

/**
 * If you're behind Nginx or a reverse proxy,
 * keep this enabled. It is also required for
 * secure cookies in production.
 */
app.set("trust proxy", 1);

/**
 * Allowed Origins
 */
const allowedOrigins = [
  "http://localhost:8080", // Vue
  "http://localhost:5173", // Vite
  "http://localhost:3000", // React
  "https://yourdomain.com",
  "https://admin.yourdomain.com",
];

/**
 * Security
 */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

/**
 * CORS
 */
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);



/**
 * Middlewares
 */
app.use(compression());
app.use(morgan("combined"));

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(cookieParser());

/**
 * Swagger Docs
 */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

/**
 * Routes
 */
require("./routes")(app);

/**
 * Default API Route
 */
app.get("/api", (req, res) => {
  res.json({
    status: true,
    message: "Server running...",
  });
});

/**
 * Health Check
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;