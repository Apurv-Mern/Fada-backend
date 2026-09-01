const router = require("express").Router();
const dealerController = require("../controllers/dealerController");
const requirePermission = require("../../../middlewares/requirePermission");

router.get("/", requirePermission("dealers.view"), dealerController.getDealers);
router.get("/stats", requirePermission("dealers.view"), dealerController.getDealerStats);
router.get(
  "/group-holding",
  requirePermission("dealers.view"),
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
  requirePermission("dealers.approve"),
  dealerController.verifyDealerBusinessDocument,
);
router.get("/:id", requirePermission("dealers.view"), dealerController.getDealerById);
router.put("/:id", requirePermission("dealers.edit"), dealerController.updateDealer);
router.delete("/:id", requirePermission("dealers.delete"), dealerController.deleteDealer);
router.put("/:id/status", requirePermission("dealers.approve"), dealerController.updateDealerStatus);
router.post("/import", requirePermission("dealers.create"), dealerController.importDealers);

module.exports = router;
