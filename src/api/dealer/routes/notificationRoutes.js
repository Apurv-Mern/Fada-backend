const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const AuthMiddleware = require("../../../middlewares/dealerAuth");

router.get("/unread-count", AuthMiddleware, notificationController.getUnreadCount);
router.get("/latest", AuthMiddleware, notificationController.getLatestNotifications);
router.patch("/read-all", AuthMiddleware, notificationController.markAllAsRead);
router.get("/", AuthMiddleware, notificationController.getNotifications);
router.patch("/:id/read", AuthMiddleware, notificationController.markAsRead);

module.exports = router;
