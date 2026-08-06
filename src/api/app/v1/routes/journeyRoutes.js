const router = require("express").Router();
const journeyController = require("../controllers/journeyController");

router.get("/", journeyController.getJourneys);
router.get("/:journeyId", journeyController.getJourney);
router.post("/", journeyController.createJourney);
router.put("/:journeyId", journeyController.updateJourney);
router.delete("/:journeyId", journeyController.deleteJourney);

module.exports = router;
