const router = require("express").Router();
const moduleController = require("../controllers/moduleController");

router.get("/", moduleController.getModules);

module.exports = router;
