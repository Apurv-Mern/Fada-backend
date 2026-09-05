const express = require("express");
const router = express.Router();
const moduleController = require("../controllers/moduleController");
const AuthMiddleware = require("../../../middlewares/dealerAuth");

router.get("/", AuthMiddleware, moduleController.getModules);

module.exports = router;
