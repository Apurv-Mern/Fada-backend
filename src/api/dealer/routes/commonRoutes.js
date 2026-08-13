const express = require("express");
const router = express.Router();
const commonController = require("../controllers/commonController");
const AuthMiddleware = require("../../../middlewares/dealerAuth");
router.get("/announcements", AuthMiddleware, commonController.getAnnouncements);

module.exports = router;