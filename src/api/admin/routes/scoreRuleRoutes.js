const router = require("express").Router();
const scoreRuleController = require("../controllers/scoreRuleController");
const requireAnyPermission = require("../../../middlewares/requireAnyPermission");

const scoreRulesView = requireAnyPermission("score_rules.view", "score.view");
const scoreRulesCreate = requireAnyPermission("score_rules.create", "score_rules.manage", "score.manage");
const scoreRulesEdit = requireAnyPermission("score_rules.edit", "score_rules.manage", "score.manage");
const scoreRulesDelete = requireAnyPermission("score_rules.delete", "score_rules.manage", "score.manage");

router.get("/", scoreRulesView, scoreRuleController.getScoreRules);
router.get("/:id", scoreRulesView, scoreRuleController.getScoreRuleById);
router.post("/", scoreRulesCreate, scoreRuleController.createScoreRule);
router.put("/:id", scoreRulesEdit, scoreRuleController.updateScoreRule);
router.delete("/:id", scoreRulesDelete, scoreRuleController.deleteScoreRule);

module.exports = router;
