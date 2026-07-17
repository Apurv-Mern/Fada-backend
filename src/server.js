// src/server.js
const fs = require("fs");
const http = require("http");
const https = require("https");
const cluster = require("cluster");
const os = require("os");
require("dotenv").config();

const app = require("./app");

const numCPUs = os.cpus().length;
const PORT = process.env.PORT || 8080;
const USE_HTTPS = process.env.USE_HTTPS === "true";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

if (IS_PRODUCTION && cluster.isMaster) {
  console.log(`Master ${process.pid} running - starting ${numCPUs} workers`);
  for (let i = 0; i < numCPUs; i++) cluster.fork();

  cluster.on("exit", (worker) => {
    console.warn(`Worker ${worker.process.pid} exited. Restarting...`);
    cluster.fork();
  });
} else {
  let server;

  if (USE_HTTPS) {
    try {
      const sslOptions = {
        key: fs.readFileSync(process.env.SSL_KEY_PATH, "utf8"),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH, "utf8"),
      };
      server = https.createServer(sslOptions, app);
    } catch (err) {
      console.error("SSL certificate load failed:", err.message);
      server = http.createServer(app);
    }
  } else {
    server = http.createServer(app);
  }

  server.listen(PORT, () => {
    console.log(
      `Server (${process.pid}) listening on port ${PORT} via ${
        USE_HTTPS ? "HTTPS" : "HTTP"
      }`
    );
  });

  const shutdown = (reason) => {
    console.log(`Shutting down due to: ${reason}`);
    if (server && typeof server.close === "function") {
      server.close(() => process.exit(0));
      setTimeout(() => {
        console.error("Force shutdown after timeout.");
        process.exit(1);
      }, 10000);
    } else {
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    shutdown("uncaughtException");
  });
  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
    shutdown("unhandledRejection");
  });
}
