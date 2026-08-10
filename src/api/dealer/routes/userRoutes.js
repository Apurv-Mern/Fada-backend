const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const AuthMiddleware = require("../../../middlewares/dealerAuth");



router.get("/profile", AuthMiddleware, userController.getProfile);
router.put("/profile", AuthMiddleware, userController.updateProfile);

router.get("/group-dealers", AuthMiddleware, userController.getGroupDealers);

module.exports = router;