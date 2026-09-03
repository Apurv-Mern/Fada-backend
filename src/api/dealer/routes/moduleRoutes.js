const express = require("express");
const router = express.Router();
const moduleController = require("../controllers/moduleController");
const AuthMiddleware = require("../../../middlewares/dealerAuth");
const requireDealerPermission = require("../../../middlewares/requireDealerPermission");

router.get(
  "/",
  AuthMiddleware,
  requireDealerPermission("dealer_settings.manage"),
  moduleController.getModules,
);

module.exports = router;
