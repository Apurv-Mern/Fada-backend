const router = require("express").Router();
const scoreStageController = require("../controllers/scoreStageController");
const upload = require("../../../utils/fileUtil");
const requireAnyPermission = require("../../../middlewares/requireAnyPermission");

const scoreConfigView = requireAnyPermission("score_configuration.view", "score.view");
const scoreConfigManage = requireAnyPermission("score_configuration.manage", "score.manage");

router.get("/", scoreConfigView, scoreStageController.getScoreStages);
router.put("/", scoreConfigManage, scoreStageController.bulkUpdateScoreStages);
router.get("/:id", scoreConfigView, scoreStageController.getScoreStageById);
router.put("/:id", scoreConfigManage, scoreStageController.updateScoreStage);
router.delete("/:id", scoreConfigManage, scoreStageController.deleteScoreStage);
router.put(
  "/icon/:id",
  scoreConfigManage,
  upload.single("icon"),
  scoreStageController.updateScoreStageIcon,
);

module.exports = router;
