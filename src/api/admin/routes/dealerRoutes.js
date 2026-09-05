const router = require("express").Router();
const dealerController = require("../controllers/dealerController");
const requirePermission = require("../../../middlewares/requirePermission");
const requireAnyPermission = require("../../../middlewares/requireAnyPermission");

const DEALER_ACCESS_PERMISSIONS = [
  "dealers.view",
  "dealers.create",
  "dealers.edit",
  "dealers.delete",
  "dealers.approve",
  "dealers.approve_documents",
  "dealers.import",
];

const dealerDocumentApprove = requireAnyPermission(
  "dealers.approve_documents",
  "dealers.approve",
);

router.get("/", requireAnyPermission(...DEALER_ACCESS_PERMISSIONS), dealerController.getDealers);
router.get("/stats", requireAnyPermission(...DEALER_ACCESS_PERMISSIONS), dealerController.getDealerStats);
router.get(
  "/group-holding",
  requireAnyPermission(...DEALER_ACCESS_PERMISSIONS),
  dealerController.getDealersGroupByHolding,
);
router.post("/", requirePermission("dealers.create"), dealerController.createDealer);
router.put(
  "/:dealerId/location",
  requirePermission("dealers.edit"),
  dealerController.saveDealerLocation,
);
router.get(
  "/:dealerId/key-contact",
  requirePermission("dealers.view"),
  dealerController.getKeyContact,
);
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
router.get(
  "/:dealerId/business-documents",
  requirePermission("dealers.view"),
  dealerController.getDealerBusinessDocuments,
);
router.put(
  "/:dealerId/business-documents/:dealerDocumentId/verify",
  dealerDocumentApprove,
  dealerController.verifyDealerBusinessDocument,
);
router.get("/:id", requirePermission("dealers.view"), dealerController.getDealerById);
router.put("/:id", requirePermission("dealers.edit"), dealerController.updateDealer);
router.delete("/:id", requirePermission("dealers.delete"), dealerController.deleteDealer);
router.put("/:id/status", requirePermission("dealers.approve"), dealerController.updateDealerStatus);
router.post("/import", requirePermission("dealers.import"), dealerController.importDealers);

module.exports = router;
