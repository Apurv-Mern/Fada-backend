const express = require("express");
const router = express.Router();
const businessDocumentController = require("../controllers/businessDocumentController");
const AuthMiddleware = require("../../../middlewares/dealerAuth");

router.get("/", AuthMiddleware, businessDocumentController.getBusinessDocuments);
router.post("/", AuthMiddleware, businessDocumentController.uploadBusinessDocument);
router.delete("/:id", AuthMiddleware, businessDocumentController.deleteBusinessDocument);

module.exports = router;
