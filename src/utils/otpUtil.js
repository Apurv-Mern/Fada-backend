const crypto = require("crypto");
const config = require("../config/config");




const generateOTP = (digits = 6) => {
  return  config.otp.useDefault
  ? String(config.otp.default) : crypto.randomInt(10 ** (digits - 1), 10 ** digits).toString();
};

module.exports = {
  generateOTP,
};