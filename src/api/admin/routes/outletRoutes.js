const router = require("express").Router();
const outletController = require("../controllers/outletController");
const requirePermission = require("../../../middlewares/requirePermission");

router.get("/", requirePermission("dealers.view"), outletController.getOutlets);
router.get(
  "/parent/:parentId",
  requirePermission("dealers.view"),
  outletController.getOutletsByParent,
);
router.get("/:id", requirePermission("dealers.view"), outletController.getOutletById);
router.post("/", requirePermission("dealers.create"), outletController.createOutlet);
router.put("/:id", requirePermission("dealers.edit"), outletController.updateOutlet);
router.delete("/:id", requirePermission("dealers.delete"), outletController.deleteOutlet);
router.put(
  "/:id/active-inactive",
  requirePermission("dealers.edit"),
  outletController.activeInactiveOutlets,
);

module.exports = router;
