const router = require("express").Router();
const scoreStageController = require("../controllers/scoreStageController");
const upload = require("../../../utils/fileUtil");
const requirePermission = require("../../../middlewares/requirePermission");

router.get("/", requirePermission("score.view"), scoreStageController.getScoreStages);
router.put("/", requirePermission("score.manage"), scoreStageController.bulkUpdateScoreStages);
router.get("/:id", requirePermission("score.view"), scoreStageController.getScoreStageById);
router.put("/:id", requirePermission("score.manage"), scoreStageController.updateScoreStage);
router.delete("/:id", requirePermission("score.manage"), scoreStageController.deleteScoreStage);
router.put(
  "/icon/:id",
  requirePermission("score.manage"),
  upload.single("icon"),
  scoreStageController.updateScoreStageIcon,
);

module.exports = router;
