const express = require("express");
const router = express.Router();
const employerController = require("../controllers/employerController");
const employeeAuth = require("../../../../middlewares/employeeAuth");

router.use(employeeAuth);

router.post("/", employerController.submitEmployerLeavingRequest);
router.get("/", employerController.getEmployerLeavingRequests);
router.get("/:id", employerController.getEmployerLeavingRequestById);
router.patch(
  "/:id/status/:status",
  employerController.updateEmployerLeavingRequestStatus,
);

module.exports = router;
