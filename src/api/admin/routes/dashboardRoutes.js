const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const requirePermission = require("../../../middlewares/requirePermission");

router.get(
  "/stats",
  requirePermission("dashboard.view"),
  dashboardController.getDashboardStats,
);

module.exports = router;
