const router = require("express").Router();
const promotionController = require("../controllers/promotionController");

router.get("/", promotionController.getPromotions);
router.get("/:promotionId", promotionController.getPromotion);
router.post("/", promotionController.createPromotion);
router.put("/:promotionId", promotionController.updatePromotion);
router.delete("/:promotionId", promotionController.deletePromotion);

module.exports = router;
