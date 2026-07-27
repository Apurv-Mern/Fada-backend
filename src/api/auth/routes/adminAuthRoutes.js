const router = require("express").Router();
const adminAuthController = require("../controllers/adminAuthController");
const adminAuth = require("../../../middlewares/adminAuth");

router.post("/login", adminAuthController.adminLogin);
router.post("/forgot-password", adminAuthController.forgotPassword);
router.post("/refresh-token", adminAuthController.refreshToken);
router.post("/logout", adminAuthController.logout);
router.post("/change-password", adminAuth, adminAuthController.changePassword);

module.exports = router;
