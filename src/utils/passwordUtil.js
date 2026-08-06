const bcrypt = require("bcrypt");
const config = require("../config/config");



const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (plain, hashed) => {
  return await bcrypt.compare(plain, hashed);
};

const generateTempPassword = (length = 8) => {
  
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%^&*()_+-=[]{}|;:,.<>?";
  let password = "";

  for (let index = 0; index < length; index += 1) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return config.password.useDefault ? config.password.default : password;
};

module.exports = { hashPassword, comparePassword, generateTempPassword };
