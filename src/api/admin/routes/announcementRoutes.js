const router = require("express").Router();
const announcementController = require("../controllers/announcementController");

router.get("/", announcementController.getAnnouncements);
router.get("/:id", announcementController.getAnnouncementById);
router.post("/", announcementController.createAnnouncement);
router.put("/:id", announcementController.updateAnnouncement);
router.delete("/:id", announcementController.deleteAnnouncement);

module.exports = router;
