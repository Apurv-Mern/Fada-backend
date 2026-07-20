const crypto = require("crypto");
const config = require("../config/config");




const generateOTP = (digits = 6) => {
  return  config.otp.useDefault
  ? String(config.otp.default) : crypto.randomInt(10 ** (digits - 1), 10 ** digits).toString();
};



const verifyUserName = (userName) => {
  const value = userName.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[6-9]\d{9}$/; // Indian 10-digit mobile number
  const usernameRegex = /^[a-zA-Z0-9._]{3,30}$/;

  if (emailRegex.test(value)) {
    return {"email": value};
  }

  if (phoneRegex.test(value)) {
    return {"phone": value};
  }
 
  return {error: true};
};




module.exports = {
  generateOTP,
  verifyUserName,
};