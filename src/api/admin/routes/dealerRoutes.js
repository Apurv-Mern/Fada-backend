const router = require("express").Router();
const dealerController = require("../controllers/dealerController");

router.get("/", dealerController.getDealers);
router.put("/:dealerId/location", dealerController.saveDealerLocation);
router.get("/:dealerId/key-contact", dealerController.getKeyContact);
router.post("/:dealerId/key-contact", dealerController.addKeyContact);
router.put("/:dealerId/key-contact/:keyContactId", dealerController.updateKeyContact);
router.delete("/:dealerId/key-contact/:keyContactId", dealerController.deleteKeyContact);
router.get("/:id", dealerController.getDealerById);
router.post("/", dealerController.createDealer);
router.put("/:id", dealerController.updateDealer);
router.delete("/:id", dealerController.deleteDealer);
router.put("/:id/status", dealerController.updateDealerStatus);
module.exports = router;