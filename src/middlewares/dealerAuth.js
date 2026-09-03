const { Dealer } = require("../database/models");

const { verifyAccessToken, extractBearerToken } = require("../utils/jwtUtil");

module.exports = async function (req, res, next) {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return res.authError("Authentication failed: Invalid token", 401);
    }

    const decodedToken = verifyAccessToken(token);

    const userData = await Dealer.findOne({
      where: {
        id: decodedToken.id,
      },
    });

    if (!userData) {
      return res.authError("Authentication failed: Token has expired", 401);
    }

    if (decodedToken.role !== "dealer") {
      return res.authError("Authentication failed: Unauthorized access", 401);
    }

    req.auth = userData;

    const headerDealerId = req.headers["x-dealer-id"];
    const isStaffAccount = userData.userType === "staff";
    const ownerDealerId = isStaffAccount
      ? Number(userData.parentDealerId)
      : Number(userData.id);

    if (isStaffAccount && !ownerDealerId) {
      return res.apiError("Staff account is not linked to a company", 403);
    }

    const selectedDealerId = headerDealerId
      ? Number(headerDealerId)
      : ownerDealerId;

    if (!Number.isInteger(selectedDealerId)) {
      return res.apiError("Invalid dealer ID", 400);
    }

    if (selectedDealerId === ownerDealerId) {
      req.currentDealerId = ownerDealerId;
    } else if (!isStaffAccount && selectedDealerId === Number(userData.id)) {
      req.currentDealerId = userData.id;
    } else {
      const subDealer = await Dealer.findOne({
        where: {
          id: selectedDealerId,
          parentDealerId: ownerDealerId,
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
