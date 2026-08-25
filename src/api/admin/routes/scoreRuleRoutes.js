const router = require("express").Router();
const scoreRuleController = require("../controllers/scoreRuleController");
const requirePermission = require("../../../middlewares/requirePermission");

router.get("/", requirePermission("score.view"), scoreRuleController.getScoreRules);
router.get("/:id", requirePermission("score.view"), scoreRuleController.getScoreRuleById);
router.post("/", requirePermission("score.manage"), scoreRuleController.createScoreRule);
router.put("/:id", requirePermission("score.manage"), scoreRuleController.updateScoreRule);
router.delete("/:id", requirePermission("score.manage"), scoreRuleController.deleteScoreRule);

module.exports = router;
