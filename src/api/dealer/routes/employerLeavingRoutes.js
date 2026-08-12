const express = require("express");
const router = express.Router();
const employerController = require("../controllers/employerController");
const authenticateDealer = require("../../../middlewares/dealerAuth");

router.use(authenticateDealer);

router.get("/", employerController.getEmployerLeavingRequests);
router.get("/steps", employerController.getEmployerLeavingSteps);
router.get("/:id", employerController.getEmployerLeavingRequestById);
router.patch(
  "/:id/status/:status",
  employerController.acceptOrRejectEmployerLeavingRequestById,
);
router.put(
  "/:id/status/:status",
  employerController.updateEmployerLeavingRequestStatusById,
);

module.exports = router;
