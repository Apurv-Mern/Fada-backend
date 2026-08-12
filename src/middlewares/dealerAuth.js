const { Dealer } = require("../database/models");

const { verifyAccessToken, extractBearerToken } = require("../utils/jwtUtil");

module.exports = async function (req, res, next) {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return res.authError("Authentication failed: Invalid token", 401);
    }

    const decodedToken = verifyAccessToken(token);

    // Verify logged-in dealer
    const userData = await Dealer.findOne({
      where: {
        id: decodedToken.id,
      },
    });

    if (!userData) {
      return res.authError("Authentication failed: Token has expired", 401);
    }

    // Verify role
    if (decodedToken.role !== "dealer") {
      return res.authError("Authentication failed: Unauthorized access", 401);
    }

    // Actual authenticated user
    req.auth = userData;

    // Selected dealer from frontend
    const headerDealerId = req.headers["x-dealer-id"];

    const selectedDealerId = headerDealerId
      ? Number(headerDealerId)
      : Number(userData.id);

    if (!Number.isInteger(selectedDealerId)) {
      return res.apiError("Invalid dealer ID", 400);
    }

    // Main dealer selected
    if (selectedDealerId === Number(userData.id)) {
      req.currentDealerId = userData.id;
    } else {
      // Check whether selected dealer belongs
      // to logged-in main dealer
      const subDealer = await Dealer.findOne({
        where: {
          id: selectedDealerId,
          parentDealerId: userData.id,
        },
      });

      if (!subDealer) {
        return res.apiError(
          "You are not authorized to access this dealer",
          403,
        );
      }

      req.currentDealerId = subDealer.id;
    }

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.authError(
        "Authentication failed: Invalid or expired token",
        401,
      );
    }

    return res.apiError("Internal server error.", 500, error);
  }
};
