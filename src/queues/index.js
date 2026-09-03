const { Queue } = require("bullmq");

const connection = require("../config/redis");

const emailQueue = new Queue("email", { connection });
const smsQueue = new Queue("sms", { connection });
const pushQueue = new Queue("push", { connection });

const addEmailJob = async (data) => {
  return emailQueue.add("email", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  });
};

const addEmailJobs = async (jobs) => {
  return await emailQueue.addBulk(
    jobs.map((data) => ({
      name: "email",
      data,
      opts: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }))
  );
};

const addSmsJob = async (data) => {
  return smsQueue.add("sms", data);
};

const addPushJob = async (data) => {
  return pushQueue.add("push", data);
};

const addPushJobs = async (jobs) => {
  return pushQueue.addBulk(
    jobs.map((data) => ({
      name: "push",
      data,
      opts: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }))
  );
};

module.exports = {
  addEmailJob,
  addEmailJobs,
  addSmsJob,
  addPushJob,
  addPushJobs
};
