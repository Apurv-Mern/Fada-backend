const express = require("express");
const router = express.Router();
const employerController = require("../controllers/employerController");
const authenticateDealer = require("../../../middlewares/dealerAuth");

router.use(authenticateDealer);
router.post("/", employerController.sendEmployeementTransferRequest);

module.exports = router;
