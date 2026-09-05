const router = require("express").Router();
const moduleController = require("../controllers/moduleController");

router.get("/", moduleController.getPermissions);

module.exports = router;
