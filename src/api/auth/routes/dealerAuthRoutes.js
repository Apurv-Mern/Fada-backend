const router = require("express").Router();
const dealerAuthController = require("../controllers/dealerAuthController");
router.post("/register", dealerAuthController.dealerRegister);
router.post("/verify-otp", dealerAuthController.verifyOtp);
router.post("/login", dealerAuthController.dealerLogin);
router.post("/refresh-token", dealerAuthController.refreshToken);
router.post("/logout", dealerAuthController.logout);

module.exports = router;
