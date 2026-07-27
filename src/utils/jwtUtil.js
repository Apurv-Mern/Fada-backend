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

const verifyRefreshToken = (token) =>
  verifyToken(token, process.env.JWT_REFRESH_SECRET);

const verifyAccessToken = (token) =>
  verifyToken(token, process.env.JWT_ACCESS_SECRET);

const extractBearerToken = (authHeader) => {
  if (!authHeader || typeof authHeader !== "string") {
    return null;
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return null;
  }

  const token = match[1].trim();
  if (!token || token === "undefined" || token === "null") {
    return null;
  }

  return token;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  verifyAccessToken,
  extractBearerToken,
};
