const router = require("express").Router();
const masterController = require("../controllers/masterController");
const requirePermission = require("../../../middlewares/requirePermission");

router.get(
  "/documents",
  requirePermission("masters.view"),
  masterController.getDocuments,
);
router.get(
  "/documents/:id",
  requirePermission("masters.view"),
  masterController.getDocumentById,
);
router.post(
  "/documents",
  requirePermission("masters.manage"),
  masterController.createDocument,
);
router.put(
  "/documents/:id",
  requirePermission("masters.manage"),
  masterController.updateDocument,
);
router.delete(
  "/documents/:id",
  requirePermission("masters.manage"),
  masterController.deleteDocument,
);

router.get("/brands", requirePermission("masters.view"), masterController.getBrands);
router.get("/brands/:id", requirePermission("masters.view"), masterController.getBrandById);
router.get(
  "/brands/flag/:flag",
  requirePermission("masters.view"),
  masterController.getBrandsByFlag,
);
router.post("/brands", requirePermission("masters.manage"), masterController.createBrand);
router.put("/brands/:id", requirePermission("masters.manage"), masterController.updateBrand);
router.delete("/brands/:id", requirePermission("masters.manage"), masterController.deleteBrand);

router.get(
  "/organization-structures",
  requirePermission("masters.view"),
  masterController.getOrganizationStructures,
);
router.get(
  "/organization-structures/:id",
  requirePermission("masters.view"),
  masterController.getOrganizationStructureById,
);
router.get(
  "/organization-structures/parent/:parentId/flag/:flag",
  requirePermission("masters.view"),
  masterController.getOrganizationStructureByParentAndFlag,
);
router.post(
  "/organization-structures",
  requirePermission("masters.manage"),
  masterController.createOrganizationStructure,
);
router.put(
  "/organization-structures/:id",
  requirePermission("masters.manage"),
  masterController.updateOrganizationStructure,
);
router.delete(
  "/organization-structures/:id",
  requirePermission("masters.manage"),
  masterController.deleteOrganizationStructure,
);

router.get(
  "/organization-structures/flag/:flag",
  requirePermission("masters.view"),
  masterController.getOrganizationStructureByFlag,
);

router.get(
  "/outlet-functions",
  requirePermission("masters.view"),
  masterController.getOutletFunctions,
);
router.get(
  "/outlet-functions/:id",
  requirePermission("masters.view"),
  masterController.getOutletFunctionById,
);
router.post(
  "/outlet-functions",
  requirePermission("masters.manage"),
  masterController.createOutletFunction,
);
router.put(
  "/outlet-functions/:id",
  requirePermission("masters.manage"),
  masterController.updateOutletFunction,
);
router.delete(
  "/outlet-functions/:id",
  requirePermission("masters.manage"),
  masterController.deleteOutletFunction,
);

router.get("/dealers", requirePermission("masters.view"), masterController.getDealers);

module.exports = router;
