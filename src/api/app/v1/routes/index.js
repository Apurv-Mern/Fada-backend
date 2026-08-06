const router = require("express").Router();
const employeeAuthMiddleware = require("../../../../middlewares/employeeAuth");

router.use(employeeAuthMiddleware);
router.use("/", require("./profileRoutes"));
router.use("/certificates", require("./certificateRoutes"));
router.use("/skills", require("./skillRoutes"));
router.use("/trainings", require("./trainingRoutes"));
router.use("/appreciations", require("./appreciationRoutes"));
router.use("/promotions", require("./promotionRoutes"));
router.use("/journeys", require("./journeyRoutes"));
module.exports = router;
