require("dotenv").config();

const { Worker } = require("bullmq");
const connection = require("../config/redis");
const { sendEmail } = require("../utils/emailUtil");
const { sendSMS } = require("../utils/smsUtil");
const { sendPushNotification } = require("../utils/notificationUtil");



const emailWorker = new Worker(
  "email",
  async (job) => {
    console.log(`[email-worker] Processing job ${job.id} for ${job.data.to}`);
    await sendEmail(job.data);
    console.log(`[email-worker] Completed job ${job.id}`);
  },
  { connection }
);



const smsWorker = new Worker(
  "sms",
  async (job) => {
    console.log(`[sms-worker] Processing job ${job.id} for ${job.data.to || job.data.phone}`);
    await sendSMS(job.data);
    console.log(`[sms-worker] Completed job ${job.id}`);
  },
  { connection }
);



const pushWorker = new Worker(
  "push",
  async (job) => {
    const target =
      job.data.topic ||
      job.data.token ||
      job.data.deviceToken ||
      (job.data.tokens || job.data.deviceTokens || []).length ||
      "unknown";
    console.log(`[push-worker] Processing job ${job.id} for ${target}`);
    await sendPushNotification(job.data);
    console.log(`[push-worker] Completed job ${job.id}`);
  },
  { connection }
);

emailWorker.on("failed", (job, error) => {
  console.error(`[email-worker] Job ${job?.id} failed:`, error.message);
});

emailWorker.on("error", (error) => {
  console.error("[email-worker] Error:", error.message);
});

smsWorker.on("failed", (job, error) => {
  console.error(`[sms-worker] Job ${job?.id} failed:`, error.message);
});

smsWorker.on("error", (error) => {
  console.error("[sms-worker] Error:", error.message);
});

pushWorker.on("failed", (job, error) => {
  console.error(`[push-worker] Job ${job?.id} failed:`, error.message);
});

pushWorker.on("error", (error) => {
  console.error("[push-worker] Error:", error.message);
});

console.log("Workers started: email, sms, push");

const shutdown = async () => {
  console.log("Shutting down workers...");
  await Promise.all([emailWorker.close(), smsWorker.close(), pushWorker.close()]);
  await connection.quit();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
