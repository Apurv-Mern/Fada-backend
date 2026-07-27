const { Dealer } = require("../database/models");
const {
  verifyAccessToken,
  extractBearerToken,
} = require("../utils/jwtUtil");

module.exports = async function (req, res, next) {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return res.authError("Authentication failed: Invalid token", 401);
    }

    const decodedToken = verifyAccessToken(token);
    const userData = await Dealer.findOne({ where: { id: decodedToken.id } });

    if (userData === null) {
      return res.authError("Authentication failed: Token has expired", 401);
    }

    if (decodedToken.role !== "dealer") {
      return res.authError("Authentication failed: Unauthorized access", 401);
    }

    req.auth = userData;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.authError("Authentication failed: Invalid or expired token", 401);
    }

    return res.apiError("Internal server error.", 500, error);
  }
};
