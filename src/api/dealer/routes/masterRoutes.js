const express = require("express");
const router = express.Router();
const masterController = require("../controllers/masterController");
const authenticateDealer = require("../../../middlewares/dealerAuth");



router.get("/designations", masterController.getDesignations);
router.get("/departments", masterController.getDepartments);
router.get("/business-functions", masterController.getBusinessFunctions);
router.get("/outlet-functions", masterController.getOutletFunctions);
router.get("/brands", authenticateDealer, masterController.getBrands);
router.get("/segments", masterController.getSegments);
router.get("/vehicle-class", masterController.getVehicleClass);
router.get("/document-types", masterController.getDocumentTypes);

module.exports = router;