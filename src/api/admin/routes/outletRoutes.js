const router = require("express").Router();
const outletController = require("../controllers/outletController");
const adminAuth = require("../../../middlewares/adminAuth");
 

router.get("/",adminAuth, outletController.getOutlets);
router.get("/parent/:parentId",adminAuth, outletController.getOutletsByParent);
router.get("/:id",adminAuth, outletController.getOutletById);
router.post("/",adminAuth, outletController.createOutlet);
router.put("/:id",adminAuth, outletController.updateOutlet);
router.delete("/:id",adminAuth, outletController.deleteOutlet);

module.exports = router;
