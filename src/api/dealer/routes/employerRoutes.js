const express = require("express");
const router = express.Router();
const employerController = require("../controllers/employerController");

const authenticateDealer = require("../../../middlewares/dealerAuth");
router.use(authenticateDealer);

router.get("/", employerController.getEmployerInvitations);
router.post("/send", employerController.sendNewEmployerInvitation);
router.get("/steps", employerController.getEmployerInvitationSteps);
router.get("/:id", employerController.getEmployerInvitationById);
router.patch(
  "/:id/status/:status",
  employerController.acceptOrRejectEmployerInvitationById,
);
router.put(
  "/:id/status/:status",
  employerController.updateEmployerInvitationStatusById,
);

module.exports = router;
