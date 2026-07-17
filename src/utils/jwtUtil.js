const jwt = require("jsonwebtoken");

const generateAccessToken = (payload, expiresIn = "7d") => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn });
};

const generateRefreshToken = (payload, expiresIn = "30d") => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn });
}

const verifyToken = (token, secretKey) => {
  return jwt.verify(token, secretKey);
};

module.exports = { generateAccessToken, generateRefreshToken, verifyToken };
