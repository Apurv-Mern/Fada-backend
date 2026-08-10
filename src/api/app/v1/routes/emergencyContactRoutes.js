const router = require("express").Router();
const emergencyContactController = require("../controllers/emergencyContactController");

router.get("/", emergencyContactController.getEmergencyContacts);
router.get("/:emergencyContactId", emergencyContactController.getEmergencyContact);
router.post("/", emergencyContactController.createEmergencyContact);
router.put("/:emergencyContactId", emergencyContactController.updateEmergencyContact);
router.delete(
  "/:emergencyContactId",
  emergencyContactController.deleteEmergencyContact,
);

module.exports = router;
