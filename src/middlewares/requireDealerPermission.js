const { dealerHasPermission } = require("../services/rbacService");

function requireDealerPermission(permissionKey) {
  return async (req, res, next) => {
    try {
      if (!req.auth?.id) {
        return res.authError("Authentication failed: No token provided.", 401);
      }

      if (req.auth.userType !== "staff") {
        return next();
      }

      const allowed = await dealerHasPermission(req.auth.id, permissionKey);
      if (!allowed) {
        return res.apiError("You do not have permission to perform this action", 403);
      }

      return next();
    } catch (error) {
      return res.apiError("Internal server error.", 500, error);
    }
  };
}

module.exports = requireDealerPermission;
