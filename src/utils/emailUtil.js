const path = require("path");
const ejs = require("ejs");
const nodemailer = require("nodemailer");
const config = require("../config/config");
const { getEmailBrandDefaults, getEmailAttachments } = require("./emailBrandUtil");

const transporter = nodemailer.createTransport({
  host: config.smtp.host, // smtp.gmail.com
  port: Number(config.smtp.port), // 465
  secure: true, // SSL for port 465
  auth: {
    user: config.smtp.user, // support@fadaid.com
    pass: config.smtp.pass, // Gmail App Password
  },
});

const OTP_TEMPLATE_PATH = path.join(__dirname, "../views/emails");

const actionLabels = {
  registration: "complete your registration",
  login: "log in to your account",
  verification: "verify your account",
};

const OTP_DIGITS = 4;

const buildOtpTemplateData = (data = {}) => {
  const otp = String(data.otp || "");
  const website = process.env.APP_WEBSITE || "www.fada-id.com";
  const websiteUrl = website.startsWith("http") ? website : `https://${website}`;

  return {
    ...getEmailBrandDefaults(),
    name: data.name || "User",
    otp,
    otpDigits:
      data.otpDigits ||
      otp.padStart(OTP_DIGITS, "0").slice(0, OTP_DIGITS).split(""),
    purpose: data.purpose || "verification",
    action: data.action || actionLabels[data.purpose] || actionLabels.verification,
    expiresInMinutes:
      data.expiresInMinutes || config.otp.expiresInMinutes || 10,
    appName: data.appName || process.env.APP_NAME || "FADA-ID",
    websiteUrl: data.websiteUrl || websiteUrl,
    websiteLabel: data.websiteLabel || website.replace(/^https?:\/\//, ""),
    supportEmail: data.supportEmail || process.env.SUPPORT_EMAIL || "support@fadaid.com",
    supportPhone: data.supportPhone || process.env.SUPPORT_PHONE || "+91 123 456 7890",
    year: data.year || new Date().getFullYear(),
    tempPassword: data?.password || "",
  };
};

const renderEmailTemplate = async (payload) => {
  const defaultData = {
    ...getEmailBrandDefaults(),
    websiteUrl: process.env.APP_WEBSITE?.startsWith("http")
      ? process.env.APP_WEBSITE
      : `https://${process.env.APP_WEBSITE || "www.fada-id.com"}`,
    websiteLabel: (process.env.APP_WEBSITE || "www.fada-id.com").replace(
      /^https?:\/\//,
      "",
    ),
    supportEmail: process.env.SUPPORT_EMAIL || "support@fada-id.com",
    supportPhone: process.env.SUPPORT_PHONE || "+91 123 456 7890",
    year: new Date().getFullYear(),
  };

  const templateData =
    payload.templateName === "otp.ejs"
      ? buildOtpTemplateData(payload.data || payload)
      : {
          ...defaultData,
          ...(payload.data || payload),
        };

  return ejs.renderFile(`${OTP_TEMPLATE_PATH}/${payload.templateName}`, templateData);
};

const sendEmail = async (data) => {
  console.log("Sending email to", data.to);
  const html = await renderEmailTemplate(data);
  const attachments = getEmailAttachments(data.templateName);

 try {
  const result = await transporter.sendMail({
    from: config.smtp.from,
    to: data.to,
    subject: data.subject,
    html,
    attachments,
  });
  console.log("Email sent successfully to", data.to, "messageId:", result.messageId);
  return result;
 } catch (error) {
  console.error("Error sending email:", error);
  throw error;
 }

  
  
};

module.exports = {
  sendEmail,
  renderEmailTemplate,
  buildOtpTemplateData,
};
