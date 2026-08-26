const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const requirePermission = require("../../../middlewares/requirePermission");

router.get(
  "/filters",
  requirePermission("reports.view"),
  reportController.getReportFilters,
);

router.get(
  "/:reportKey/export",
  requirePermission("reports.export"),
  reportController.exportReport,
);

router.get(
  "/:reportKey",
  requirePermission("reports.view"),
  reportController.getReport,
);

module.exports = router;
