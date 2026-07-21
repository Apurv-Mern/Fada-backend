const router = require("express").Router();
const employeeAuthController = require("../controllers/employeeAuthController");

router.post("/register", employeeAuthController.employeeRegister);
router.post("/verify-otp", employeeAuthController.verifyOtp);
router.post("/login", employeeAuthController.employeeLogin);
router.post("/login-otp", employeeAuthController.loginWithOtp);
router.post("/login-otp/verify", employeeAuthController.verifyLoginOtp);
router.post("/refresh-token", employeeAuthController.refreshToken);
router.post("/logout", employeeAuthController.logout);

module.exports = router;
