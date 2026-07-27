const path = require("path");
const ejs = require("ejs");
const nodemailer = require("nodemailer");
const config = require("../config/config");

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: Number(config.smtp.port),
  secure: Number(config.smtp.port) === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
  ...(Number(config.smtp.port) === 587 ? { requireTLS: true } : {}),
});

const OTP_TEMPLATE_PATH = path.join(__dirname, "../views/emails");

const actionLabels = {
  registration: "complete your registration",
  login: "log in to your account",
  verification: "verify your account",
};

const buildOtpTemplateData = (data = {}) => {
  const otp = String(data.otp || "");
  const website = process.env.APP_WEBSITE || "www.fada-id.com";
  const websiteUrl = website.startsWith("http") ? website : `https://${website}`;

  return {
    name: data.name || "User",
    otp,
    otpDigits: data.otpDigits || otp.padStart(6, "0").slice(0, 6).split(""),
    purpose: data.purpose || "verification",
    action: data.action || actionLabels[data.purpose] || actionLabels.verification,
    expiresInMinutes:
      data.expiresInMinutes || config.otp.expiresInMinutes || 10,
    appName: data.appName || "FADA-ID",
    websiteUrl: data.websiteUrl || websiteUrl,
    websiteLabel: data.websiteLabel || website.replace(/^https?:\/\//, ""),
    supportEmail: data.supportEmail || process.env.SUPPORT_EMAIL || "support@fada-id.com",
    supportPhone: data.supportPhone || process.env.SUPPORT_PHONE || "+91 123 456 7890",
    year: data.year || new Date().getFullYear(),
  };
};

const renderEmailTemplate = async (data) => { 
  return ejs.renderFile(`${OTP_TEMPLATE_PATH}/${data.templateName}`, data);
};

const sendEmail = async (data) => {
  console.log("Sending email to", data.to);
  const html = await renderEmailTemplate(data);
  const result = await transporter.sendMail({
    from: config.smtp.from,
    to: data.to,
    subject: data.subject,
    html,
  });

  console.log("Email sent successfully to", data.to, "messageId:", result.messageId);
  return result;
};

module.exports = {
  sendEmail,
  renderEmailTemplate,
  buildOtpTemplateData,
};
