const express = require("express");
const router = express.Router();
const employerController = require("../controllers/employerController");
const employeeAuth = require("../../../../middlewares/employeeAuth");

router.use(employeeAuth);

router.post("/", employerController.sendNewEmployerInvitation);
router.get("/", employerController.getEmployerInvitations);
router.get("/:id", employerController.getEmployerInvitationById);
router.put("/:id/mark-as-shared-details", employerController.markAsSharedDetails);
router.patch(
  "/:id/status/:status",
  employerController.acceptOrRejectEmployerInvitationById,
);


module.exports = router;
