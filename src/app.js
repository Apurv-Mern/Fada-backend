// src/app.js

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const { addEmailJob, addSmsJob } = require("./queues");
const app = express();
const upload = require("./utils/fileUtil");
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
  "http://localhost:8080",
  "https://admin.fadaid.com",
  "https://dealer.fadaid.com",
  "http://localhost:8081",
  "https://api.fadaid.com",
  "*"
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
      "x-dealer-id"
    ],
  })
);

//app.use("/uploads", express.static(upload.uploadsDir));

// Uploads: allow embedding from dealer portal
app.use(
  "/uploads",
  express.static("uploads", {
    setHeaders(res) {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
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
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      tagsSorter: "alpha",
      operationsSorter: "alpha",
      docExpansion: "none",
    },
  }),
);
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



app.post("/test-email", async (req, res) => {
  await addEmailJob({
    to: req.body.email,
    subject: "Test Email",
    templateName: "otp.ejs",
    data: {
      name: "John Doe",
      otp: "123456",
      purpose: "registration",
    },
  });

  res.json({
    status: true,
    message: "Email sent successfully",
  });
});

app.post("/test-sms", async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(422).json({
        success: false,
        message: "phone and otp are required",
      });
    }

    await addSmsJob({
      phone: phone,
      otp: otp,
    });

    res.json({
      status: true,
      message: "SMS queued successfully",
    });
  } catch (error) {
    console.error("Error queueing test SMS:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to queue SMS",
    });
  }
});


app.post("/file-upload", upload.single("file"), (req, res) => {
  res.json({
    success: true,
    file: process.env.API_URL + "/uploads/" + req.file.filename,
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