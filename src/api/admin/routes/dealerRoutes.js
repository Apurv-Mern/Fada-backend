const router = require("express").Router();
const dealerController = require("../controllers/dealerController");
const requirePermission = require("../../../middlewares/requirePermission");
const requireAnyPermission = require("../../../middlewares/requireAnyPermission");

const dealerDocumentApprove = requireAnyPermission(
  "dealers.approve_documents",
  "dealers.approve",
);

router.get("/", dealerController.getDealers);
router.get("/stats", dealerController.getDealerStats);
router.get("/group-holding", dealerController.getDealersGroupByHolding);
router.post("/", requirePermission("dealers.create"), dealerController.createDealer);
router.put(
  "/:dealerId/location",
  requirePermission("dealers.edit"),
  dealerController.saveDealerLocation,
);
router.get("/:dealerId/key-contact", dealerController.getKeyContact);
router.post(
  "/:dealerId/key-contact",
  requirePermission("dealers.edit"),
  dealerController.addKeyContact,
);
router.put(
  "/:dealerId/key-contact/:keyContactId",
  requirePermission("dealers.edit"),
  dealerController.updateKeyContact,
);
router.delete(
  "/:dealerId/key-contact/:keyContactId",
  requirePermission("dealers.edit"),
  dealerController.deleteKeyContact,
);
router.get("/:dealerId/business-documents", dealerController.getDealerBusinessDocuments);
router.put(
  "/:dealerId/business-documents/:dealerDocumentId/verify",
  dealerDocumentApprove,
  dealerController.verifyDealerBusinessDocument,
);
router.get("/:id", dealerController.getDealerById);
router.put("/:id", requirePermission("dealers.edit"), dealerController.updateDealer);
router.delete("/:id", requirePermission("dealers.delete"), dealerController.deleteDealer);
router.put("/:id/status", requirePermission("dealers.approve"), dealerController.updateDealerStatus);
router.post("/import", requirePermission("dealers.import"), dealerController.importDealers);

module.exports = router;
