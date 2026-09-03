const config = require("../config/config");

const MAX_TOKENS_PER_REQUEST = 1000;

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

function buildPushPayload({ title, body, data, imageUrl }) {
  const normalizedTitle = String(title || "").trim();
  const normalizedBody = String(body || "").trim();

  if (!normalizedTitle) {
    throw new Error("Push notification title is required");
  }

  if (!normalizedBody) {
    throw new Error("Push notification body is required");
  }

  const payload = {
    notification: {
      title: normalizedTitle,
      body: normalizedBody,
    },
  };

  if (imageUrl) {
    payload.notification.image = imageUrl;
  }

  if (data && typeof data === "object" && !Array.isArray(data)) {
    payload.data = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, String(value)]),
    );
  }

  return payload;
}

function chunkTokens(tokens, chunkSize = MAX_TOKENS_PER_REQUEST) {
  const chunks = [];

  for (let index = 0; index < tokens.length; index += chunkSize) {
    chunks.push(tokens.slice(index, index + chunkSize));
  }

  return chunks;
}

async function sendPushRequest(body) {
  const response = await fetch(config.push.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `key=${config.push.serverKey}`,
    },
    body: JSON.stringify(body),
  });

  let result;
  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok) {
    const errorMessage =
      result?.error ||
      result?.message ||
      `Push API failed with status ${response.status}`;
    throw new Error(
      typeof errorMessage === "string"
        ? errorMessage
        : JSON.stringify(errorMessage),
    );
  }

  if (result?.failure > 0 && result?.success === 0) {
    const firstError = result?.results?.find((item) => item?.error)?.error;
    throw new Error(firstError || "Push notification delivery failed");
  }

  return result;
}

/**
 * Send push notification via Firebase Cloud Messaging (legacy HTTP API).
 *
 * Accepts:
 * - token / deviceToken: single device token
 * - tokens / deviceTokens: array of device tokens
 * - topic: FCM topic name (mutually exclusive with tokens)
 * - title, body: required notification text
 * - data: optional key/value payload for the client app
 * - imageUrl: optional notification image
 */
async function sendPushNotification(data = {}) {
  const tokens = normalizeDeviceTokens(
    data.tokens || data.deviceTokens || data.token || data.deviceToken,
  );
  const topic = String(data.topic || "").trim();
  const notificationPayload = buildPushPayload(data);

  if (!tokens.length && !topic) {
    throw new Error("Device token(s) or topic is required");
  }

  if (tokens.length && topic) {
    throw new Error("Provide either device token(s) or topic, not both");
  }

  if (!config.push.enabled) {
    console.log("[push] skipped (IS_PUSH_ENABLED=false):", {
      tokens: tokens.length,
      topic: topic || null,
      title: data.title,
    });
    return {
      skipped: true,
      tokens: tokens.length,
      topic: topic || null,
    };
  }

  if (!config.push.serverKey) {
    throw new Error("Missing FCM_SERVER_KEY");
  }

  if (topic) {
    console.log("[push] Sending topic notification:", topic);
    const result = await sendPushRequest({
      to: `/topics/${topic}`,
      ...notificationPayload,
    });
    console.log("[push] Topic notification sent:", topic, "messageId:", result?.message_id);
    return result;
  }

  if (tokens.length === 1) {
    console.log("[push] Sending to 1 device");
    const result = await sendPushRequest({
      to: tokens[0],
      ...notificationPayload,
    });
    console.log("[push] Sent successfully:", result?.message_id || result?.multicast_id);
    return result;
  }

  const tokenChunks = chunkTokens(tokens);
  const results = [];

  for (const chunk of tokenChunks) {
    console.log(`[push] Sending multicast to ${chunk.length} devices`);
    const result = await sendPushRequest({
      registration_ids: chunk,
      ...notificationPayload,
    });
    results.push(result);
  }

  const summary = results.reduce(
    (acc, result) => {
      acc.success += result?.success ?? 0;
      acc.failure += result?.failure ?? 0;
      acc.multicastIds.push(result?.multicast_id ?? null);
      return acc;
    },
    { success: 0, failure: 0, multicastIds: [] },
  );

  console.log(
    "[push] Multicast completed:",
    `${summary.success} success, ${summary.failure} failure`,
  );

  if (summary.success === 0 && summary.failure > 0) {
    throw new Error("Push notification delivery failed for all recipients");
  }

  return {
    multicast: true,
    ...summary,
    results,
  };
}

module.exports = {
  sendPushNotification,
  buildPushPayload,
  normalizeDeviceTokens,
};
