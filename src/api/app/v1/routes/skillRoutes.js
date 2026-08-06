const router = require("express").Router();
const skillController = require("../controllers/skillController");

router.get("/", skillController.getSkills);
router.get("/:skillId", skillController.getSkill);
router.post("/", skillController.createSkill);
router.put("/:skillId", skillController.updateSkill);
router.delete("/:skillId", skillController.deleteSkill);

module.exports = router;
