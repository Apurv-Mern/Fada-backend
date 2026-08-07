const router = require("express").Router();
const profileController = require("../controllers/profileController");
router.get("/profile", profileController.getProfile);
router.get("/profile/privacy", profileController.getProfilePrivacy);
router.put("/profile/privacy", profileController.updateProfilePrivacy);
router.get("/profile/shares", profileController.getProfileShares);
router.post("/profile/shares", profileController.shareProfile);
router.delete("/profile/shares/:shareId", profileController.revokeProfileShare);
router.get("/personal-details", profileController.getPersonalDetails);
router.put("/personal-details", profileController.updatePersonalDetails);
router.get("/documents", profileController.getDocuments);
router.post("/documents", profileController.uploadDocuments);
router.delete("/documents/:documentId", profileController.deleteDocument);
router.post("/employeements", profileController.createEmployeement);
router.get("/employeements", profileController.getEmployeements);

module.exports = router;