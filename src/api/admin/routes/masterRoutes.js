const router = require("express").Router();
const masterController = require("../controllers/masterController");
const requireAnyPermission = require("../../../middlewares/requireAnyPermission");

const brandManage = requireAnyPermission("brand_masters.manage", "masters.manage");
const orgManage = requireAnyPermission("organization_structure.manage", "masters.manage");
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

router.get("/documents", masterController.getDocuments);
router.get("/documents/:id", masterController.getDocumentById);
router.post("/documents", documentTypeCreate, masterController.createDocument);
router.put("/documents/:id", documentTypeEdit, masterController.updateDocument);
router.delete("/documents/:id", documentTypeDelete, masterController.deleteDocument);

router.get("/brands", masterController.getBrands);
router.get("/brands/:id", masterController.getBrandById);
router.get("/brands/flag/:flag", masterController.getBrandsByFlag);
router.post("/brands", brandManage, masterController.createBrand);
router.put("/brands/:id", brandManage, masterController.updateBrand);
router.delete("/brands/:id", brandManage, masterController.deleteBrand);

router.get("/organization-structures", masterController.getOrganizationStructures);
router.get("/organization-structures/:id", masterController.getOrganizationStructureById);
router.get(
  "/organization-structures/parent/:parentId/flag/:flag",
  masterController.getOrganizationStructureByParentAndFlag,
);
router.post("/organization-structures", orgManage, masterController.createOrganizationStructure);
router.put("/organization-structures/:id", orgManage, masterController.updateOrganizationStructure);
router.delete("/organization-structures/:id", orgManage, masterController.deleteOrganizationStructure);
router.get("/organization-structures/flag/:flag", masterController.getOrganizationStructureByFlag);

router.get("/outlet-functions", masterController.getOutletFunctions);
router.get("/outlet-functions/:id", masterController.getOutletFunctionById);
router.post("/outlet-functions", outletFunctionCreate, masterController.createOutletFunction);
router.put("/outlet-functions/:id", outletFunctionEdit, masterController.updateOutletFunction);
router.delete("/outlet-functions/:id", outletFunctionDelete, masterController.deleteOutletFunction);

router.get("/dealers", masterController.getDealers);

module.exports = router;
