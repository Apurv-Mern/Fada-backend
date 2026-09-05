const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");
const AuthMiddleware = require("../../../middlewares/dealerAuth");
const requireDealerPermission = require("../../../middlewares/requireDealerPermission");

router.get("/", AuthMiddleware, roleController.getRoles);
router.get("/:id", AuthMiddleware, roleController.getRoleById);
router.post(
  "/",
  AuthMiddleware,
  requireDealerPermission("dealer_settings.manage"),
  roleController.createRole,
);
router.put(
  "/:id",
  AuthMiddleware,
  requireDealerPermission("dealer_settings.manage"),
  roleController.updateRole,
);
router.delete(
  "/:id",
  AuthMiddleware,
  requireDealerPermission("dealer_settings.manage"),
  roleController.deleteRole,
);

module.exports = router;
