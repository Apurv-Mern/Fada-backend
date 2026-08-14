const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const AuthMiddleware = require("../../../middlewares/dealerAuth");

router.get("/", AuthMiddleware, employeeController.getEmployees);
router.get("/joining", AuthMiddleware, employeeController.getEmployeesForJoining);
router.get("/:id/documents", AuthMiddleware, employeeController.getEmployeeDocuments);
router.put(
  "/:id/approve-documents/:documentId",
  AuthMiddleware,
  employeeController.approveEmployeeDocuments,
);
router.get("/profile/:id", AuthMiddleware, employeeController.getEmployeeProfile);
router.get("/:id", AuthMiddleware, employeeController.getEmployeeById);
router.post("/", AuthMiddleware, employeeController.createEmployee);
router.put("/:id", AuthMiddleware, employeeController.updateEmployee);
router.delete("/:id", AuthMiddleware, employeeController.deleteEmployee);


module.exports = router;
