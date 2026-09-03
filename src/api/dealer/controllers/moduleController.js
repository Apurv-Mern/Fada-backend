const {
  getDealerPortalModules,
  getDealerPortalPermissions,
} = require("../../../services/rbacService");

/*
@API: GET /dealers/modules
@Desc: List dealer portal modules with nested permissions for RBAC matrix
@Access: Private
*/
exports.getModules = async (_req, res) => {
  try {
    const modules = await getDealerPortalModules();
    return res.apiSuccess("Modules fetched successfully", modules);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: GET /dealers/permissions
@Desc: Flat dealer portal permission catalog
@Access: Private
*/
exports.getPermissions = async (_req, res) => {
  try {
    const permissions = await getDealerPortalPermissions();
    return res.apiSuccess("Permissions fetched successfully", permissions);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};
