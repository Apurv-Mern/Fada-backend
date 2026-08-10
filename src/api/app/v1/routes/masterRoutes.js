const express = require("express");
const router = express.Router();
const masterController = require("../controllers/masterController");

router.get("/dealers", masterController.getDealers);
router.get("/designations", masterController.getDesignations);
router.get("/departments", masterController.getDepartments);

module.exports = router;