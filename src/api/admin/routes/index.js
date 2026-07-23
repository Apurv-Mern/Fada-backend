const router = require("express").Router();
const dealerRoutes = require("./dealerRoutes");
const masterRoutes = require("./masterRoutes");
const outletRoutes = require("./outletRoutes");
const employeeRoutes = require("./employeeRoutes");
const auth = require("../../../middlewares/adminAuth");

router.use("/dealers", auth, dealerRoutes);
router.use("/masters", auth, masterRoutes);
router.use("/outlets", auth, outletRoutes);
router.use("/employees", auth, employeeRoutes);

module.exports = router;
