const router = require("express").Router();
const scoreStageController = require("../controllers/scoreStageController");

router.get("/", scoreStageController.getScoreStages);
router.put("/", scoreStageController.bulkUpdateScoreStages);
router.get("/:id", scoreStageController.getScoreStageById);
router.put("/:id", scoreStageController.updateScoreStage);
router.delete("/:id", scoreStageController.deleteScoreStage);

module.exports = router;
