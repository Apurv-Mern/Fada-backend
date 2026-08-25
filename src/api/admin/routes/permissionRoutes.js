const router = require("express").Router();
const moduleController = require("../controllers/moduleController");
const requirePermission = require("../../../middlewares/requirePermission");

router.get(
  "/",
  requirePermission("roles.manage"),
  moduleController.getPermissions,
);

module.exports = router;
