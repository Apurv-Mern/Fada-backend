const router = require("express").Router();
const adminAuthController = require("../controllers/adminAuthController");
router.post("/login", adminAuthController.adminLogin);
router.post("/refresh-token", adminAuthController.refreshToken);
router.post("/logout", adminAuthController.logout);

module.exports = router;
