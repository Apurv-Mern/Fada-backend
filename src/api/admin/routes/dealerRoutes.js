const router = require("express").Router();
const dealerController = require("../controllers/dealerController");

router.get("/", dealerController.getDealers);
router.get("/:id", dealerController.getDealerById);
router.post("/", dealerController.createDealer);
router.put("/:id", dealerController.updateDealer);
router.delete("/:id", dealerController.deleteDealer);
router.put("/:id/status", dealerController.updateDealerStatus);
module.exports = router;