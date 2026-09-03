const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const AuthMiddleware = require("../../../middlewares/dealerAuth");

router.get("/roles", AuthMiddleware, staffController.getStaffRoles);
router.get("/", AuthMiddleware, staffController.getStaffMembers);
router.get("/:id", AuthMiddleware, staffController.getStaffMemberById);
router.post("/", AuthMiddleware, staffController.createStaffMember);
router.put(
  "/:id/active-inactive",
  AuthMiddleware,
  staffController.toggleStaffActiveStatus,
);
router.put("/:id", AuthMiddleware, staffController.updateStaffMember);
router.delete("/:id", AuthMiddleware, staffController.deleteStaffMember);

module.exports = router;
