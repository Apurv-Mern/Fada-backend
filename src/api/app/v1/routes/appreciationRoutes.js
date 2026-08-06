const router = require("express").Router();
const appreciationController = require("../controllers/appreciationController");

router.get("/", appreciationController.getAppreciations);
router.get("/:appreciationId", appreciationController.getAppreciation);
router.post("/", appreciationController.createAppreciation);
router.put("/:appreciationId", appreciationController.updateAppreciation);
router.delete("/:appreciationId", appreciationController.deleteAppreciation);

module.exports = router;
