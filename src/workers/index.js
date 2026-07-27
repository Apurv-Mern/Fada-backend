require("dotenv").config();

const { Worker } = require("bullmq");
const connection = require("../config/redis");
const { sendEmail } = require("../utils/emailUtil");

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
    console.log(`[sms-worker] Processing job ${job.id}`, job.data);
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

console.log("Workers started: email, sms");

const shutdown = async () => {
  console.log("Shutting down workers...");
  await Promise.all([emailWorker.close(), smsWorker.close()]);
  await connection.quit();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
