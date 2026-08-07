const router = require("express").Router();
const scoreStageController = require("../controllers/scoreStageController");
const upload = require("../../../utils/fileUtil");
router.get("/", scoreStageController.getScoreStages);
router.put("/", scoreStageController.bulkUpdateScoreStages);
router.get("/:id", scoreStageController.getScoreStageById);
router.put("/:id", scoreStageController.updateScoreStage);
router.delete("/:id", scoreStageController.deleteScoreStage);
router.put("/icon/:id",upload.single("icon"), scoreStageController.updateScoreStageIcon);

module.exports = router;
