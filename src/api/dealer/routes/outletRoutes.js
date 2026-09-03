const express = require("express");
const router = express.Router();
const outletController = require("../controllers/outletController");
const AuthMiddleware = require("../../../middlewares/dealerAuth");

router.get("/", AuthMiddleware, outletController.getOutlets);
router.get("/options", AuthMiddleware, outletController.getOutletOptions);
router.post("/import", AuthMiddleware, outletController.importOutlets);
router.get("/:id", AuthMiddleware, outletController.getOutletById);
router.post("/", AuthMiddleware, outletController.createOutlet);
router.put("/:id", AuthMiddleware, outletController.updateOutlet);
router.delete("/:id", AuthMiddleware, outletController.deleteOutlet);

module.exports = router;
