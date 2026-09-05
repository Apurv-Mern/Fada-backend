const router = require("express").Router();
const masterController = require("../controllers/masterController");
const requireAnyPermission = require("../../../middlewares/requireAnyPermission");

const brandView = requireAnyPermission("brand_masters.view", "masters.view");
const brandManage = requireAnyPermission("brand_masters.manage", "masters.manage");
const orgView = requireAnyPermission("organization_structure.view", "masters.view");
const orgManage = requireAnyPermission("organization_structure.manage", "masters.manage");
const outletFunctionView = requireAnyPermission("outlet_functions.view", "masters.view");
const outletFunctionCreate = requireAnyPermission(
  "outlet_functions.create",
  "outlet_functions.manage",
  "masters.manage",
);
const outletFunctionEdit = requireAnyPermission(
  "outlet_functions.edit",
  "outlet_functions.manage",
  "masters.manage",
);
const outletFunctionDelete = requireAnyPermission(
  "outlet_functions.delete",
  "outlet_functions.manage",
  "masters.manage",
);
const documentTypeView = requireAnyPermission("document_types.view", "masters.view");
const documentTypeCreate = requireAnyPermission(
  "document_types.create",
  "document_types.manage",
  "masters.manage",
);
const documentTypeEdit = requireAnyPermission(
  "document_types.edit",
  "document_types.manage",
  "masters.manage",
);
const documentTypeDelete = requireAnyPermission(
  "document_types.delete",
  "document_types.manage",
  "masters.manage",
);

router.get("/documents", documentTypeView, masterController.getDocuments);
router.get("/documents/:id", documentTypeView, masterController.getDocumentById);
router.post("/documents", documentTypeCreate, masterController.createDocument);
router.put("/documents/:id", documentTypeEdit, masterController.updateDocument);
router.delete("/documents/:id", documentTypeDelete, masterController.deleteDocument);

router.get("/brands", brandView, masterController.getBrands);
router.get("/brands/:id", brandView, masterController.getBrandById);
router.get("/brands/flag/:flag", brandView, masterController.getBrandsByFlag);
router.post("/brands", brandManage, masterController.createBrand);
router.put("/brands/:id", brandManage, masterController.updateBrand);
router.delete("/brands/:id", brandManage, masterController.deleteBrand);

router.get(
  "/organization-structures",
  orgView,
  masterController.getOrganizationStructures,
);
router.get(
  "/organization-structures/:id",
  orgView,
  masterController.getOrganizationStructureById,
);
router.get(
  "/organization-structures/parent/:parentId/flag/:flag",
  orgView,
  masterController.getOrganizationStructureByParentAndFlag,
);
router.post(
  "/organization-structures",
  orgManage,
  masterController.createOrganizationStructure,
);
router.put(
  "/organization-structures/:id",
  orgManage,
  masterController.updateOrganizationStructure,
);
router.delete(
  "/organization-structures/:id",
  orgManage,
  masterController.deleteOrganizationStructure,
);
router.get(
  "/organization-structures/flag/:flag",
  orgView,
  masterController.getOrganizationStructureByFlag,
);

router.get("/outlet-functions", outletFunctionView, masterController.getOutletFunctions);
router.get("/outlet-functions/:id", outletFunctionView, masterController.getOutletFunctionById);
router.post("/outlet-functions", outletFunctionCreate, masterController.createOutletFunction);
router.put("/outlet-functions/:id", outletFunctionEdit, masterController.updateOutletFunction);
router.delete("/outlet-functions/:id", outletFunctionDelete, masterController.deleteOutletFunction);

router.get("/dealers", orgView, masterController.getDealers);

module.exports = router;
