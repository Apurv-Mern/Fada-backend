const express = require("express");
const router = express.Router();
const employerController = require("../controllers/employerController");

const authenticateDealer = require("../../../middlewares/dealerAuth");
router.use(authenticateDealer);
router.get("/", employerController.getEmployerInvitations);
router.get("/:id", employerController.getEmployerInvitationById);
router.patch(
  "/:id/status/:status",
  employerController.acceptOrRejectEmployerInvitationById,
);
router.post("/send", employerController.sendNewEmployerInvitation);
router.put("/:id/status/:status", employerController.updateEmployerInvitationStatusById);
router.get("/steps", employerController.getEmployerInvitationSteps);
module.exports = router;
