const express = require("express");
const router = express.Router();
const userRoutes = require("./userRoutes");
const contactPersonRoutes = require("./contactPersonRoutes");
const outletRoutes = require("./outletRoutes");
const employeeRoutes = require("./employeeRoutes");
const businessDocumentRoutes = require("./businessDocumentRoutes");

router.use("/user", userRoutes);
router.use("/contact-persons", contactPersonRoutes);
router.use("/outlets", outletRoutes);
router.use("/employees", employeeRoutes);
router.use("/business-documents", businessDocumentRoutes);

module.exports = router;