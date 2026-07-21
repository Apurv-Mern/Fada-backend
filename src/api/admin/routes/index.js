const router = require("express").Router();
const dealerRoutes = require("./dealerRoutes");
const masterRoutes = require("./masterRoutes");
const auth = require("../../../middlewares/adminAuth");

router.use("/dealers", auth, dealerRoutes);
router.use("/masters", auth, masterRoutes);

module.exports = router;
