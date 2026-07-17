const router = require("express").Router();
const dealerRoutes = require("./dealerRoutes");
const auth = require("../../../middlewares/adminAuth");
router.use("/dealers",auth, dealerRoutes);

module.exports = router;
