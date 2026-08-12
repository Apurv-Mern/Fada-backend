const express = require("express");
const router = express.Router();
const employerController = require("../controllers/employerController");
const employeeAuth = require("../../../../middlewares/employeeAuth");
router.use(employeeAuth);
router.post("/", employerController.sendNewEmployerInvitation);
router.get("/", employerController.getEmployerInvitations);
router.get("/:id", employerController.getEmployerInvitationById);
router.patch(
  "/:id/status/:status",
  employerController.acceptOrRejectEmployerInvitationById,
);

router.post("/employer-leaving", employerController.submitEmployerLeavingRequest);
router.get("/employer-leaving", employerController.getEmployerLeavingRequests);
router.get("/employer-leaving/:id", employerController.getEmployerLeavingRequestById);
router.patch(
  "/employer-leaving/:id/status/:status",
  employerController.updateEmployerLeavingRequestStepStatus,
);
router.patch(
  "/employer-leaving/:id/status/:status",
  employerController.rejectEmployerLeavingRequestById,
);

module.exports = router;
