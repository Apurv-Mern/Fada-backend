const router = require("express").Router();
const announcementController = require("../controllers/announcementController");
const requireAnyPermission = require("../../../middlewares/requireAnyPermission");

const newsroomView = requireAnyPermission("newsroom.view", "communications.view");
const newsroomCreate = requireAnyPermission(
  "newsroom.create",
  "newsroom.manage",
  "communications.manage",
);
const newsroomEdit = requireAnyPermission(
  "newsroom.edit",
  "newsroom.manage",
  "communications.manage",
);
const newsroomDelete = requireAnyPermission(
  "newsroom.delete",
  "newsroom.manage",
  "communications.manage",
);

router.get("/", newsroomView, announcementController.getAnnouncements);
router.get("/:id", newsroomView, announcementController.getAnnouncementById);
router.post("/", newsroomCreate, announcementController.createAnnouncement);
router.put("/:id", newsroomEdit, announcementController.updateAnnouncement);
router.post("/:id/send-now", newsroomEdit, announcementController.sendNow);
router.delete("/:id", newsroomDelete, announcementController.deleteAnnouncement);

module.exports = router;
