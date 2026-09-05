const router = require("express").Router();
const outletController = require("../controllers/outletController");
const requireAnyPermission = require("../../../middlewares/requireAnyPermission");

const OUTLET_CREATE_PERMISSIONS = ["outlets.create", "dealers.create"];
const OUTLET_EDIT_PERMISSIONS = ["outlets.edit", "dealers.edit"];
const OUTLET_DELETE_PERMISSIONS = ["outlets.delete", "dealers.delete"];
const OUTLET_IMPORT_PERMISSIONS = ["outlets.import", "dealers.import"];

router.get("/", outletController.getOutlets);
router.get("/parent/:parentId", outletController.getOutletsByParent);
router.post(
  "/import",
  requireAnyPermission(...OUTLET_IMPORT_PERMISSIONS),
  outletController.importOutlets,
);
router.get("/:id", outletController.getOutletById);
router.post(
  "/",
  requireAnyPermission(...OUTLET_CREATE_PERMISSIONS),
  outletController.createOutlet,
);
router.put(
  "/:id",
  requireAnyPermission(...OUTLET_EDIT_PERMISSIONS),
  outletController.updateOutlet,
);
router.delete(
  "/:id",
  requireAnyPermission(...OUTLET_DELETE_PERMISSIONS),
  outletController.deleteOutlet,
);
router.put(
  "/:id/active-inactive",
  requireAnyPermission(...OUTLET_EDIT_PERMISSIONS),
  outletController.activeInactiveOutlets,
);

module.exports = router;
