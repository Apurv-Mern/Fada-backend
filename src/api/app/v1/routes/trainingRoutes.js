const router = require("express").Router();
const trainingController = require("../controllers/trainingController");

router.get("/", trainingController.getTrainings);
router.get("/:trainingId", trainingController.getTraining);
router.post("/", trainingController.createTraining);
router.put("/:trainingId", trainingController.updateTraining);
router.delete("/:trainingId", trainingController.deleteTraining);

module.exports = router;
