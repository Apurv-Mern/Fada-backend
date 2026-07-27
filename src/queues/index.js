const { Queue } = require("bullmq");
const connection = require("../config/redis");

const emailQueue = new Queue("email", { connection });
const smsQueue = new Queue("sms", { connection });
//const whatsappQueue = new Queue("whatsapp", { connection });
const pushQueue = new Queue("push", { connection });


const addEmailJob = async (data) => {
  await emailQueue.add("email", data);
};

const addSmsJob = async (data) => {
  await smsQueue.add("sms", data);
};
 
const addPushJob = async (data) => {
  await pushQueue.add("push", data);
};

module.exports = {
  addEmailJob,
  addSmsJob,
  addPushJob,
};