const router = require("express").Router();
const announcementController = require("../controllers/announcementController");
const requirePermission = require("../../../middlewares/requirePermission");

router.get(
  "/",
  requirePermission("communications.view"),
  announcementController.getAnnouncements,
);
router.get(
  "/:id",
  requirePermission("communications.view"),
  announcementController.getAnnouncementById,
);
router.post(
  "/",
  requirePermission("communications.manage"),
  announcementController.createAnnouncement,
);
router.put(
  "/:id",
  requirePermission("communications.manage"),
  announcementController.updateAnnouncement,
);
router.delete(
  "/:id",
  requirePermission("communications.manage"),
  announcementController.deleteAnnouncement,
);

module.exports = router;
