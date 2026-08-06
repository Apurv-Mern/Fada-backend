const router = require("express").Router();
const certificateController = require("../controllers/certificateController");

router.get("/", certificateController.getCertificates);
router.get("/:certificateId", certificateController.getCertificate);
router.post("/", certificateController.createCertificate);
router.put("/:certificateId", certificateController.updateCertificate);
router.delete("/:certificateId", certificateController.deleteCertificate);

module.exports = router;