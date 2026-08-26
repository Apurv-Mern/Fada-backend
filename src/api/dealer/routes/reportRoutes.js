const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const authenticateDealer = require("../../../middlewares/dealerAuth");

router.use(authenticateDealer);

router.get("/filters", reportController.getReportFilters);

router.get("/:reportKey/export", reportController.exportReport);

router.get("/:reportKey", reportController.getReport);

module.exports = router;
