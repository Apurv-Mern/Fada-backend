const router = require("express").Router();
const appAuthController = require("../controllers/appAuthController");
router.post("/login", appAuthController.login);

module.exports = router;
