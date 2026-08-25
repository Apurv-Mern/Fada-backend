const { Module, Permission } = require("../../../database/models");

/*
@API: GET /admin/modules
@Desc: List modules with nested permissions for RBAC matrix
@Access: Private
*/
exports.getModules = async (req, res) => {
  try {
    const modules = await Module.findAll({
      where: { isActive: true },
      attributes: ["id", "key", "name", "description", "sortOrder"],
      include: [
        {
          model: Permission,
          as: "permissions",
          attributes: ["id", "key", "name", "action"],
          where: { isActive: true },
          required: false,
        },
      ],
      order: [
        ["sortOrder", "ASC"],
        [{ model: Permission, as: "permissions" }, "key", "ASC"],
      ],
    });

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
    const permissions = await Permission.findAll({
      where: { isActive: true },
      attributes: ["id", "key", "name", "action", "moduleId"],
      order: [["key", "ASC"]],
    });

    return res.apiSuccess("Permissions fetched successfully", permissions);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};
