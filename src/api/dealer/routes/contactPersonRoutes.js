const express = require("express");
const router = express.Router();
const contactPersonController = require("../controllers/contactPersonController");
const AuthMiddleware = require("../../../middlewares/dealerAuth");

router.get("/", AuthMiddleware, contactPersonController.getContactPersons);
router.post("/", AuthMiddleware, contactPersonController.createContactPerson);
router.put("/:id", AuthMiddleware, contactPersonController.updateContactPerson);
router.delete("/:id", AuthMiddleware, contactPersonController.deleteContactPerson);

module.exports = router;