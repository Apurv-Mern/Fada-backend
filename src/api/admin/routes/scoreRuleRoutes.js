const router = require("express").Router();
const scoreRuleController = require("../controllers/scoreRuleController");

router.get("/", scoreRuleController.getScoreRules);
router.get("/:id", scoreRuleController.getScoreRuleById);
router.post("/", scoreRuleController.createScoreRule);
router.put("/:id", scoreRuleController.updateScoreRule);
router.delete("/:id", scoreRuleController.deleteScoreRule);

module.exports = router;
