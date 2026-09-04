const admin = require("firebase-admin");
const config = require("../config/config");

const serviceAccount = require("../config/fada-id-firebase-key.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

function normalizeDeviceTokens(input) {
  if (!input) return [];

  const list = Array.isArray(input) ? input : [input];

  return [
    ...new Set(
      list
        .map((token) => String(token || "").trim())
        .filter(Boolean),
    ),
  ];
}

function normalizeDataPayload(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, String(value)]),
  );
}

function buildBaseMessage({ title, body, data, imageUrl }) {
  const normalizedTitle = String(title || "").trim();
  const normalizedBody = String(body || "").trim();

  if (!normalizedTitle) {
    throw new Error("Push notification title is required");
  }

  if (!normalizedBody) {
    throw new Error("Push notification body is required");
  }

  const message = {
    notification: {
      title: normalizedTitle,
      body: normalizedBody,
    },
    android: {
      priority: "high",
    },
  };

  if (imageUrl) {
    message.notification.imageUrl = imageUrl;
  }

  const normalizedData = normalizeDataPayload(data);
  if (normalizedData && Object.keys(normalizedData).length) {
    message.data = normalizedData;
  }

  return message;
}

/**
 * Send push notification via Firebase Admin SDK.
 *
 * Accepts:
 * - token / deviceToken: single device token
 * - tokens / deviceTokens: array of device tokens
 * - title, body: required notification text
 * - data: optional key/value payload for the client app
 * - imageUrl: optional notification image
 */
async function sendPushNotification(data = {}) {
  const tokens = normalizeDeviceTokens(
    data.tokens || data.deviceTokens || data.token || data.deviceToken,
  );
  const baseMessage = buildBaseMessage(data);

  if (!tokens.length) {
    throw new Error("Device token(s) are required");
  }

  if (!config.push.enabled) {
    console.log("[push] skipped (IS_PUSH_ENABLED=false):", {
      tokens: tokens.length,
      title: data.title,
    });
    return {
      skipped: true,
      tokens: tokens.length,
    };
  }

  if (tokens.length === 1) {
    const response = await admin.messaging().send({
      ...baseMessage,
      token: tokens[0],
    });

    return { token: tokens[0], messageId: response };
  }

  const response = await admin.messaging().sendEachForMulticast({
    ...baseMessage,
    tokens,
  });

  if (response.successCount === 0 && response.failureCount > 0) {
    const firstError = response.responses.find((item) => item.error)?.error;
    throw new Error(firstError?.message || "Push notification delivery failed");
  }

  return {
    multicast: true,
    successCount: response.successCount,
    failureCount: response.failureCount,
    responses: response.responses.map((item, index) => ({
      token: tokens[index],
      success: item.success,
      messageId: item.messageId || null,
      error: item.error?.message || null,
    })),
  };
}

module.exports = {
  sendPushNotification,
  normalizeDeviceTokens,
};
