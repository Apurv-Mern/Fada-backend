const router = require("express").Router();
const notificationController = require("../controllers/notificationController");

router.get("/unread-count", notificationController.getUnreadCount);
router.get("/latest", notificationController.getLatestNotifications);
router.patch("/read-all", notificationController.markAllAsRead);
router.get("/", notificationController.getNotifications);
router.patch("/:id/read", notificationController.markAsRead);

module.exports = router;
