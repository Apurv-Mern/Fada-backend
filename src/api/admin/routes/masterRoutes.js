const router = require("express").Router();
const masterController = require("../controllers/masterController");
const authMiddleware = require("../../../middlewares/adminAuth");



router.get("/documents",authMiddleware, masterController.getDocuments);
router.get("/documents/:id",authMiddleware, masterController.getDocumentById);
router.post("/documents",authMiddleware, masterController.createDocument);
router.put("/documents/:id",authMiddleware, masterController.updateDocument);
router.delete("/documents/:id",authMiddleware, masterController.deleteDocument);

router.get("/brands", authMiddleware, masterController.getBrands);
router.get("/brands/:id", authMiddleware, masterController.getBrandById);
router.get("/brands/flag/:flag", authMiddleware, masterController.getBrandsByFlag);
router.post("/brands", authMiddleware, masterController.createBrand);
router.put("/brands/:id", authMiddleware, masterController.updateBrand);
router.delete("/brands/:id", authMiddleware, masterController.deleteBrand);

router.get(
  "/organization-structures",
  authMiddleware,
  masterController.getOrganizationStructures
);
router.get(
  "/organization-structures/:id",
  authMiddleware,
  masterController.getOrganizationStructureById
);
router.get(
  "/organization-structures/parent/:parentId/flag/:flag",
  authMiddleware,
  masterController.getOrganizationStructureByParentAndFlag
);
router.post(
  "/organization-structures",
  authMiddleware,
  masterController.createOrganizationStructure
);
router.put(
  "/organization-structures/:id",
  authMiddleware,
  masterController.updateOrganizationStructure
);
router.delete(
  "/organization-structures/:id",
  authMiddleware,
  masterController.deleteOrganizationStructure
);

router.get(
  "/organization-structures/flag/:flag",
  authMiddleware,
  masterController.getOrganizationStructureByFlag
);

router.get(
  "/outlet-functions",
  authMiddleware,
  masterController.getOutletFunctions
);
router.get(
  "/outlet-functions/:id",
  authMiddleware,
  masterController.getOutletFunctionById
);
router.post(
  "/outlet-functions",
  authMiddleware,
  masterController.createOutletFunction
);
router.put(
  "/outlet-functions/:id",
  authMiddleware,
  masterController.updateOutletFunction
);
router.delete(
  "/outlet-functions/:id",
  authMiddleware,
  masterController.deleteOutletFunction
);

module.exports = router;
