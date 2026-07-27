const router = require("express").Router();
const dealerController = require("../controllers/dealerController");
const adminAuth = require("../../../middlewares/adminAuth");

router.get("/", adminAuth, dealerController.getDealers);
router.get("/stats", adminAuth, dealerController.getDealerStats);
router.post("/", adminAuth, dealerController.createDealer);
router.put("/:dealerId/location", adminAuth, dealerController.saveDealerLocation);
router.get("/:dealerId/key-contact", adminAuth, dealerController.getKeyContact);
router.post("/:dealerId/key-contact", adminAuth, dealerController.addKeyContact);
router.put("/:dealerId/key-contact/:keyContactId", adminAuth, dealerController.updateKeyContact);
router.delete("/:dealerId/key-contact/:keyContactId", adminAuth, dealerController.deleteKeyContact);
router.get("/:dealerId/business-documents", adminAuth, dealerController.getDealerBusinessDocuments);
router.put(
  "/:dealerId/business-documents/:dealerDocumentId/verify",
  adminAuth,
  dealerController.verifyDealerBusinessDocument,
);
router.get("/:id", adminAuth, dealerController.getDealerById);
router.put("/:id", adminAuth, dealerController.updateDealer);
router.delete("/:id", adminAuth, dealerController.deleteDealer);
router.put("/:id/status", adminAuth, dealerController.updateDealerStatus);

module.exports = router;
