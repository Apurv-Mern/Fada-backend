const { Admin, Employee, Dealer } = require("../database/models");
const { addEmailJob, addEmailJobs } = require("../queues");
const { getEmailBrandDefaults } = require("../utils/emailBrandUtil");

const EMAIL_TEMPLATES = {
  OTP: "otp.ejs",
  TEMP_PASSWORD: "temp-password.ejs",
  EMP_TEMP_PASSWORD: "emp-temp-password.ejs",
  ANNOUNCEMENT: "announcement.ejs",
  ADMIN_ACTION_ALERT: "admin-action-alert.ejs",
  STATUS_UPDATE: "status-update.ejs",
  WORKFLOW_NOTIFICATION: "workflow-notification.ejs",
  WELCOME_DEALER: "welcome-dealer.ejs",
  WELCOME_EMPLOYEE: "welcome-employee-created.ejs",
  STAFF_ACCOUNT_CREATED: "staff-account-created.ejs",
  PROFILE_REMOVED: "profile-removed.ejs",
  KYC_PENDING: "kyc-pending.ejs",
  SIGNUP_SUCCESS_DEALER: "signup-success-dealer.ejs",
  PROFILE_PENDING_DEALER: "profile-pending-dealer.ejs",
};

function getPortalUrls() {
  const website = process.env.APP_WEBSITE || "www.fada-id.com";
  const websiteUrl = website.startsWith("http") ? website : `https://${website}`;

  return {
    adminPortalUrl: process.env.ADMIN_PORTAL_URL || websiteUrl,
    dealerPortalUrl: process.env.DEALER_PORTAL_URL || websiteUrl,
    employeeAppUrl: process.env.EMPLOYEE_APP_URL || websiteUrl,
    websiteUrl,
  };
}

function buildBaseEmailData(data = {}) {
  const urls = getPortalUrls();

  return {
    ...getEmailBrandDefaults(),
    year: new Date().getFullYear(),
    supportEmail: process.env.SUPPORT_EMAIL || "support@fada-id.com",
    supportPhone: process.env.SUPPORT_PHONE || "+91 123 456 7890",
    ...urls,
    ...data,
  };
}

async function queueEmail({ to, subject, templateName, data = {} }) {
  if (!to?.trim()) return null;

  return addEmailJob({
    to: to.trim(),
    subject,
    templateName,
    data: buildBaseEmailData(data),
  });
}

async function safeSendEmail(task) {
  try {
    return await task();
  } catch (error) {
    console.error("[email-notification]", error.message);
    return null;
  }
}

async function getActiveAdminEmails() {
  const admins = await Admin.findAll({
    attributes: ["email"],
    where: { isActive: true },
  });

  return admins.map((admin) => admin.email).filter(Boolean);
}

async function emailAllActiveAdmins({ subject, templateName, data = {} }) {
  const emails = await getActiveAdminEmails();
  if (!emails.length) return [];

  return addEmailJobs(
    emails.map((to) => ({
      to,
      subject,
      templateName,
      data: buildBaseEmailData(data),
    })),
  );
}

async function emailEmployeeById(employeeId, { subject, templateName, data = {} }) {
  const employee = await Employee.findByPk(employeeId, {
    attributes: ["id", "name", "email"],
  });

  if (!employee?.email) return null;

  return queueEmail({
    to: employee.email,
    subject,
    templateName,
    data: { name: employee.name, email: employee.email, ...data },
  });
}

async function emailDealerById(dealerId, { subject, templateName, data = {} }) {
  const dealer = await Dealer.findByPk(dealerId, {
    attributes: ["id", "name", "email"],
  });

  if (!dealer?.email) return null;

  return queueEmail({
    to: dealer.email,
    subject,
    templateName,
    data: { name: dealer.name, email: dealer.email, companyName: dealer.name, ...data },
  });
}

// --- High priority: admin alerts ---

async function emailAdminNewDealerRegistration({ dealerName, dealerId }) {
  const { adminPortalUrl } = getPortalUrls();

  return emailAllActiveAdmins({
    subject: "New dealer registration pending review",
    templateName: EMAIL_TEMPLATES.ADMIN_ACTION_ALERT,
    data: {
      title: "New Dealer Registration",
      messageBody: `${dealerName} has registered on FADA-ID and is pending admin review.`,
      entityLabel: `Dealer ID: ${dealerId}`,
      actionUrl: adminPortalUrl,
    },
  });
}

async function emailAdminNewEmployeeRegistration({ employeeName, employeeId }) {
  const { adminPortalUrl } = getPortalUrls();

  return emailAllActiveAdmins({
    subject: "New employee registration pending review",
    templateName: EMAIL_TEMPLATES.ADMIN_ACTION_ALERT,
    data: {
      title: "New Employee Registration",
      messageBody: `${employeeName} has registered on FADA-ID and is pending admin review.`,
      entityLabel: `Employee ID: ${employeeId}`,
      actionUrl: adminPortalUrl,
    },
  });
}

async function emailAdminDocumentUploaded({
  uploaderName,
  documentName,
  entityType,
  entityId,
}) {
  const { adminPortalUrl } = getPortalUrls();

  return emailAllActiveAdmins({
    subject: `${entityType} document pending verification`,
    templateName: EMAIL_TEMPLATES.ADMIN_ACTION_ALERT,
    data: {
      title: "Document Pending Verification",
      messageBody: `${uploaderName} uploaded "${documentName}" for verification.`,
      entityLabel: `${entityType} ID: ${entityId}`,
      actionUrl: adminPortalUrl,
    },
  });
}

async function emailAdminDealerOutletCreated({ dealerName, outletName, outletId }) {
  const { adminPortalUrl } = getPortalUrls();

  return emailAllActiveAdmins({
    subject: "New outlet created by dealer",
    templateName: EMAIL_TEMPLATES.ADMIN_ACTION_ALERT,
    data: {
      title: "New Outlet Created",
      messageBody: `${dealerName} created a new outlet "${outletName}".`,
      entityLabel: `Outlet ID: ${outletId}`,
      actionUrl: adminPortalUrl,
    },
  });
}

// --- High priority: onboarding ---

async function emailWelcomeDealer({ to, name, companyName, tempPassword }) {
  const { dealerPortalUrl } = getPortalUrls();

  return queueEmail({
    to,
    subject: "Welcome to FADA-ID — Your Dealer Account",
    templateName: EMAIL_TEMPLATES.WELCOME_DEALER,
    data: { name, companyName, tempPassword, portalUrl: dealerPortalUrl },
  });
}

async function emailWelcomeEmployee({ to, name, createdBy, tempPassword }) {
  const { employeeAppUrl } = getPortalUrls();

  return queueEmail({
    to,
    subject: "Welcome to FADA-ID — Your Employee Account",
    templateName: EMAIL_TEMPLATES.WELCOME_EMPLOYEE,
    data: { name, createdBy, tempPassword, appUrl: employeeAppUrl },
  });
}

async function emailKycPendingToEmployee({ to, name }) {
  const { employeeAppUrl } = getPortalUrls();

  return queueEmail({
    to,
    subject: "FADA-ID — Your Profile Is Pending Review",
    templateName: EMAIL_TEMPLATES.KYC_PENDING,
    data: { name, appUrl: employeeAppUrl },
  });
}

async function emailSignupSuccessToDealer({ to, name, companyName }) {
  const { dealerPortalUrl } = getPortalUrls();

  return queueEmail({
    to,
    subject: "FADA-ID — Registration Successful",
    templateName: EMAIL_TEMPLATES.SIGNUP_SUCCESS_DEALER,
    data: { name, companyName, portalUrl: dealerPortalUrl },
  });
}

async function emailProfilePendingToDealer({ to, name }) {
  const { dealerPortalUrl } = getPortalUrls();

  return queueEmail({
    to,
    subject: "FADA-ID — Your Company Profile Is Pending Review",
    templateName: EMAIL_TEMPLATES.PROFILE_PENDING_DEALER,
    data: { name, portalUrl: dealerPortalUrl },
  });
}

async function emailStaffAccountCreated({
  to,
  name,
  email,
  tempPassword,
  portalName,
  organizationName,
  portalUrl,
}) {
  return queueEmail({
    to,
    subject: `Your ${portalName || "FADA-ID"} Staff Account`,
    templateName: EMAIL_TEMPLATES.STAFF_ACCOUNT_CREATED,
    data: { name, email, tempPassword, portalName, organizationName, portalUrl },
  });
}

// --- High priority: status updates ---

async function emailStatusUpdateToEmployee(employeeId, payload = {}) {
  const { employeeAppUrl } = getPortalUrls();

  return emailEmployeeById(employeeId, {
    subject: payload.subject || payload.title,
    templateName: EMAIL_TEMPLATES.STATUS_UPDATE,
    data: {
      title: payload.title,
      messageBody: payload.messageBody || payload.body,
      statusLabel: payload.statusLabel,
      statusTone: payload.statusTone,
      reason: payload.reason,
      actionUrl: payload.actionUrl || employeeAppUrl,
      actionLabel: payload.actionLabel || "Open App",
    },
  });
}

async function emailStatusUpdateToDealer(dealerId, payload = {}) {
  const { dealerPortalUrl } = getPortalUrls();

  return emailDealerById(dealerId, {
    subject: payload.subject || payload.title,
    templateName: EMAIL_TEMPLATES.STATUS_UPDATE,
    data: {
      title: payload.title,
      messageBody: payload.messageBody || payload.body,
      statusLabel: payload.statusLabel,
      statusTone: payload.statusTone,
      reason: payload.reason,
      actionUrl: payload.actionUrl || dealerPortalUrl,
      actionLabel: payload.actionLabel || "Open Dealer Portal",
    },
  });
}

// --- Medium priority: workflow notifications ---

async function emailWorkflowToEmployee(employeeId, payload = {}) {
  const { employeeAppUrl } = getPortalUrls();

  return emailEmployeeById(employeeId, {
    subject: payload.subject || payload.title,
    templateName: EMAIL_TEMPLATES.WORKFLOW_NOTIFICATION,
    data: {
      title: payload.title,
      messageBody: payload.messageBody || payload.body,
      categoryLabel: payload.categoryLabel,
      actionUrl: payload.actionUrl || employeeAppUrl,
      actionLabel: payload.actionLabel || "View Details",
    },
  });
}

async function emailWorkflowToDealer(dealerId, payload = {}) {
  const { dealerPortalUrl } = getPortalUrls();

  return emailDealerById(dealerId, {
    subject: payload.subject || payload.title,
    templateName: EMAIL_TEMPLATES.WORKFLOW_NOTIFICATION,
    data: {
      title: payload.title,
      messageBody: payload.messageBody || payload.body,
      categoryLabel: payload.categoryLabel,
      actionUrl: payload.actionUrl || dealerPortalUrl,
      actionLabel: payload.actionLabel || "View Request",
    },
  });
}

async function emailProfileRemovedToEmployee(employeeId, { title, messageBody }) {
  return emailEmployeeById(employeeId, {
    subject: title || "Your FADA-ID profile has been removed",
    templateName: EMAIL_TEMPLATES.PROFILE_REMOVED,
    data: { title, messageBody },
  });
}

async function emailProfileRemovedToDealer(dealerId, { title, messageBody }) {
  return emailDealerById(dealerId, {
    subject: title || "Employee profile removed",
    templateName: EMAIL_TEMPLATES.PROFILE_REMOVED,
    data: { title, messageBody },
  });
}

module.exports = {
  EMAIL_TEMPLATES,
  buildBaseEmailData,
  getPortalUrls,
  queueEmail,
  safeSendEmail,
  emailAllActiveAdmins,
  emailEmployeeById,
  emailDealerById,
  emailAdminNewDealerRegistration,
  emailAdminNewEmployeeRegistration,
  emailAdminDocumentUploaded,
  emailAdminDealerOutletCreated,
  emailWelcomeDealer,
  emailWelcomeEmployee,
  emailKycPendingToEmployee,
  emailSignupSuccessToDealer,
  emailProfilePendingToDealer,
  emailStaffAccountCreated,
  emailStatusUpdateToEmployee,
  emailStatusUpdateToDealer,
  emailWorkflowToEmployee,
  emailWorkflowToDealer,
  emailProfileRemovedToEmployee,
  emailProfileRemovedToDealer,
};
