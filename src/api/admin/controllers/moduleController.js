const {
  getAdminPortalModules,
  getAdminPortalPermissions,
} = require("../../../services/rbacService");

/*
@API: GET /admin/modules
@Desc: List modules with nested permissions for RBAC matrix
@Access: Private
*/
exports.getModules = async (req, res) => {
  try {
    const modules = await getAdminPortalModules();
    return res.apiSuccess("Modules fetched successfully", modules);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: GET /admin/permissions
@Desc: Flat permission catalog
@Access: Private
*/
exports.getPermissions = async (req, res) => {
  try {
    const permissions = await getAdminPortalPermissions();
    return res.apiSuccess("Permissions fetched successfully", permissions);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};
