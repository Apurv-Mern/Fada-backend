const router = require("express").Router();
const dealerAuthController = require("../controllers/dealerAuthController");
const dealerAuth = require("../../../middlewares/dealerAuth");

router.post("/register", dealerAuthController.dealerRegister);
router.post("/verify-otp", dealerAuthController.verifyOtp);
router.post("/login", dealerAuthController.dealerLogin);
router.post("/login-otp", dealerAuthController.loginWithOtp);
router.post("/login-otp/verify", dealerAuthController.verifyLoginOtp);
router.post("/refresh-token", dealerAuthController.refreshToken);
router.post("/logout", dealerAuthController.logout);
router.post("/change-password", dealerAuth, dealerAuthController.changePassword);

module.exports = router;
