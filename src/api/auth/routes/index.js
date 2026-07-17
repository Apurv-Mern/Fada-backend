const router = require("express").Router();
const appAuthRoutes = require("./appAuthRoutes");
const adminAuthRoutes = require("./adminAuthRoutes");
const dealerAuthRoutes = require("./dealerAuthRoutes");
router.use("/admin/auth", adminAuthRoutes);

router.use("/app/auth", appAuthRoutes);

router.use("/dealer/auth", dealerAuthRoutes);

module.exports = router;
