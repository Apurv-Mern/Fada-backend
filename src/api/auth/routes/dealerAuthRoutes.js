const router = require("express").Router();
const dealerAuthController = require("../controllers/dealerAuthController");
router.post("/login", dealerAuthController.dealerLogin);
router.post("/refresh-token", dealerAuthController.refreshToken);
router.post("/logout", dealerAuthController.logout);

module.exports = router;
