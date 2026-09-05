const router = require("express").Router();
const roleController = require("../controllers/roleController");
const requirePermission = require("../../../middlewares/requirePermission");

router.get("/", roleController.getRoles);
router.get("/:id", roleController.getRoleById);
router.post("/", requirePermission("roles.manage"), roleController.createRole);
router.put("/:id", requirePermission("roles.manage"), roleController.updateRole);
router.delete("/:id", requirePermission("roles.manage"), roleController.deleteRole);

module.exports = router;
