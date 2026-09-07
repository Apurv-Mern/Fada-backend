const fs = require("fs");
const path = require("path");

const EMAIL_ASSETS_DIR = path.join(__dirname, "../views/emails/assets");
const EMAIL_LOGO_PATH = path.join(EMAIL_ASSETS_DIR, "fada-logo.png");
const SECURE_EMAIL_ICON_PATH = path.join(EMAIL_ASSETS_DIR, "secure-email.png");

const EMAIL_LOGO_CID = "fada-logo@fada-id";
const SECURE_EMAIL_ICON_CID = "secure-email@fada-id";

const TEMPLATES_WITH_SECURE_ICON = new Set(["otp.ejs", "announcement.ejs"]);

function getEmailLogoUrl() {
  if (process.env.EMAIL_LOGO_URL?.trim()) {
    return process.env.EMAIL_LOGO_URL.trim();
  }

  return `cid:${EMAIL_LOGO_CID}`;
}

function getSecureEmailIconUrl() {
  return `cid:${SECURE_EMAIL_ICON_CID}`;
}

function getEmailBrandDefaults() {
  return {
    appName: process.env.APP_NAME || "FADA-ID",
    logoUrl: getEmailLogoUrl(),
    secureEmailIconUrl: getSecureEmailIconUrl(),
  };
}

function getEmailAttachments(templateName = "") {
  const attachments = [];

  if (!process.env.EMAIL_LOGO_URL?.trim() && fs.existsSync(EMAIL_LOGO_PATH)) {
    attachments.push({
      filename: "fada-logo.png",
      path: EMAIL_LOGO_PATH,
      cid: EMAIL_LOGO_CID,
    });
  }

  if (
    TEMPLATES_WITH_SECURE_ICON.has(templateName) &&
    fs.existsSync(SECURE_EMAIL_ICON_PATH)
  ) {
    attachments.push({
      filename: "secure-email.png",
      path: SECURE_EMAIL_ICON_PATH,
      cid: SECURE_EMAIL_ICON_CID,
    });
  }

  return attachments;
}

module.exports = {
  EMAIL_LOGO_CID,
  SECURE_EMAIL_ICON_CID,
  EMAIL_LOGO_PATH,
  SECURE_EMAIL_ICON_PATH,
  getEmailLogoUrl,
  getSecureEmailIconUrl,
  getEmailBrandDefaults,
  getEmailAttachments,
};
