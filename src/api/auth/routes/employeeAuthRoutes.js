const router = require("express").Router();
const employeeAuthController = require("../controllers/employeeAuthController");

const employeeAuthMiddleware = require("../../../middlewares/employeeAuth");

router.post("/register", employeeAuthController.employeeRegister);
router.post("/verify-registration-otp", employeeAuthController.verifyRegistrationOtp);
router.post("/login", employeeAuthController.employeeLogin);
router.post("/send-login-otp", employeeAuthController.sendLoginOtp);
router.post("/verify-login-otp", employeeAuthController.verifyLoginOtp);
router.post("/refresh-token", employeeAuthController.refreshToken);
router.post("/logout", employeeAuthController.logout);
router.post("/forgot-password", employeeAuthController.forgotPassword);
router.post("/verify-forgot-password-otp", employeeAuthController.verifyForgotPasswordOtp);
router.post("/reset-password", employeeAuthMiddleware, employeeAuthController.resetPassword);

module.exports = router;
