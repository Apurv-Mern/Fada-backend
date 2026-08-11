const express = require("express");
const router = express.Router();
const employerController = require("../controllers/employerController");

router.get("/", employerController.getEmployerInvitations);
router.get("/:id", employerController.getEmployerInvitationById);
router.patch(
  "/:id/status/:status",
  employerController.acceptOrRejectEmployerInvitationById,
);
router.post("/send", employerController.sendNewEmployerInvitation);
module.exports = router;
