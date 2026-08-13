const config = require("../config/config");

/**
 * Normalize Indian mobile numbers to MSISDN format expected by AOC (91XXXXXXXXXX).
 */
const normalizePhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 11) return `91${digits.slice(1)}`;
  return digits;
};

const buildOtpMessage = (otp) =>
  `Dear User, Your OTP is ${otp}. Use this to verify your account - CLICKMYCAR`;

/**
 * Send SMS via AOC Portal API.
 * Accepts either { phone, otp } or { to, message }.
 */
const sendSMS = async (data = {}) => {
  const to = normalizePhone(data.phone || data.to);
  const text = data.message || data.text || (data.otp ? buildOtpMessage(data.otp) : "");

  if (!to) {
    throw new Error("SMS recipient phone is required");
  }
  if (!text) {
    throw new Error("SMS message text is required");
  }

  if (!config.sms.enabled) {
    console.log("[sms] skipped (IS_SMS_ENABLED=false):", { to, text });
    return { skipped: true, to, text };
  }

  if (!config.sms.apiUrl) {
    throw new Error("Missing SMS_API_URL");
  }

  if (!config.sms.apiKey) {
    throw new Error("Missing SMS_API_KEY");
  }

  const payload = {
    sender: config.sms.sender,
    to,
    text,
    type: data.type || config.sms.type,
  };

  console.log("[sms] Sending to", to);

  const response = await fetch(config.sms.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: config.sms.apiKey,
    },
    body: JSON.stringify(payload),
  });

  let result;
  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok) {
    const errorMessage =
      result?.message || result?.error || `SMS API failed with status ${response.status}`;
    console.error("[sms] Failed:", errorMessage, result);
    throw new Error(errorMessage);
  }

  if (result?.error) {
    console.error("[sms] Provider error:", result.message || result.error, {
      sender: payload.sender,
      type: payload.type,
    });
    throw new Error(
      typeof result.error === "string" ? result.error : JSON.stringify(result.error),
    );
  }

  console.log("[sms] Sent successfully to", to, "id:", result?.id);
  return result;
};

module.exports = {
  sendSMS,
  buildOtpMessage,
  normalizePhone,
};
