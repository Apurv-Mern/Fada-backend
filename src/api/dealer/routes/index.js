const express = require("express");
const router = express.Router();
const userRoutes = require("./userRoutes");
const contactPersonRoutes = require("./contactPersonRoutes");
router.use("/user", userRoutes);
router.use("/contact-persons", contactPersonRoutes);
module.exports = router;