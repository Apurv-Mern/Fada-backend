const dotenv = require("dotenv");
dotenv.config();

const required = (key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}`);
  }
  return process.env[key];
};

module.exports = {
  app: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || "development",
  },

  jwt: {
    secret: required("JWT_ACCESS_SECRET"),
    refreshSecret: required("JWT_REFRESH_SECRET"),
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  production: {
    host: required("DB_HOST"),
    port: process.env.DB_PORT || 3306,
    username: required("DB_USER"),
    password: required("DB_PASS"),
    database: required("DB_NAME"),
    dialect: "mysql",
  },
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
  },

  smtp: {
    host: required("SMTP_HOST"),
    port: process.env.SMTP_PORT || 465,
    user: required("SMTP_USER"),
    pass: required("SMTP_PASS"),
    from: process.env.EMAIL_FROM || `"No Reply" <noreply@example.com>`,
  },

  otp: {
    expiresInMinutes: process.env.OTP_EXPIRES_IN_MINUTES || 10,
    default: process.env.DEFAULT_OTP || 123456,
    useDefault: process.env.USE_DEFAULT_OTP === "true",
  },

  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
};
