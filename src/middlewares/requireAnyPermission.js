const { adminHasAnyPermission } = require("../services/rbacService");

function requireAnyPermission(...permissionKeys) {
  const keys = permissionKeys.flat();

  return async (req, res, next) => {
    try {
      if (!req.auth?.id) {
        return res.authError("Authentication failed: No token provided.", 401);
      }

      const allowed = await adminHasAnyPermission(req.auth.id, keys);
      if (!allowed) {
        return res.apiError("You do not have permission to perform this action", 403);
      }

      return next();
    } catch (error) {
      return res.apiError("Internal server error.", 500, error);
    }
  };
}

module.exports = requireAnyPermission;
