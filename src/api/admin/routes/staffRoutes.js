const router = require("express").Router();
const staffController = require("../controllers/staffController");
const requirePermission = require("../../../middlewares/requirePermission");

router.get("/roles", requirePermission("staff.view"), staffController.getStaffRoles);
router.get("/", requirePermission("staff.view"), staffController.getStaffMembers);
router.get("/:id", requirePermission("staff.view"), staffController.getStaffMemberById);
router.post("/", requirePermission("staff.create"), staffController.createStaffMember);
router.put(
  "/:id/active-inactive",
  requirePermission("staff.edit"),
  staffController.toggleStaffActiveStatus,
);
router.put("/:id", requirePermission("staff.edit"), staffController.updateStaffMember);
router.delete("/:id", requirePermission("staff.delete"), staffController.deleteStaffMember);

module.exports = router;
