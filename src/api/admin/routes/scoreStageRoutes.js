const router = require("express").Router();
const scoreStageController = require("../controllers/scoreStageController");
const upload = require("../../../utils/fileUtil");
const requireAnyPermission = require("../../../middlewares/requireAnyPermission");

const scoreConfigManage = requireAnyPermission("score_configuration.manage", "score.manage");

router.get("/", scoreStageController.getScoreStages);
router.put("/", scoreConfigManage, scoreStageController.bulkUpdateScoreStages);
router.get("/:id", scoreStageController.getScoreStageById);
router.put("/:id", scoreConfigManage, scoreStageController.updateScoreStage);
router.delete("/:id", scoreConfigManage, scoreStageController.deleteScoreStage);
router.put(
  "/icon/:id",
  scoreConfigManage,
  upload.single("icon"),
  scoreStageController.updateScoreStageIcon,
);

module.exports = router;
