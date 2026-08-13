const router = require("express").Router();
const adminAuthController = require("../controllers/adminAuthController");
const adminAuth = require("../../../middlewares/adminAuth");
const upload = require("../../../utils/fileUtil");
router.post("/login", adminAuthController.adminLogin);
router.post("/forgot-password", adminAuthController.forgotPassword);
router.post("/refresh-token", adminAuthController.refreshToken);
router.post("/logout", adminAuthController.logout);
router.post("/change-password", adminAuth, adminAuthController.changePassword);
router.get("/profile", adminAuth, adminAuthController.getProfile);
router.put("/profile", adminAuth, upload.single("profilePicture"), adminAuthController.updateProfile);

module.exports = router;
