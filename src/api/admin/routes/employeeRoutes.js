const router = require("express").Router();
const employeeController = require("../controllers/employeeController");
const requirePermission = require("../../../middlewares/requirePermission");

router.get("/", requirePermission("employees.view"), employeeController.getEmployees);
router.get("/stats", requirePermission("employees.view"), employeeController.getEmployeeStats);
router.post("/import", requirePermission("employees.view"), employeeController.importEmployees);
router.get("/:id", requirePermission("employees.view"), employeeController.getEmployeeById);
router.get("/edit/:id", requirePermission("employees.view"), employeeController.getEmployeeEditById);
router.post("/", requirePermission("employees.view"), employeeController.createEmployee);
router.put(
  "/:id/status/:status",
  requirePermission("employees.verify"),
  employeeController.updateEmployeeStatus,
);
router.put("/:id", requirePermission("employees.view"), employeeController.updateEmployee);
router.delete("/:id", requirePermission("employees.view"), employeeController.deleteEmployee);
router.put(
  "/:id/active-inactive",
  requirePermission("employees.verify"),
  employeeController.activeInactiveEmployee,
);

router.get(
  "/:id/documents",
  requirePermission("employees.view"),
  employeeController.getEmployeeDocuments,
);
router.put(
  "/:id/documents/:documentId/status",
  requirePermission("employees.verify"),
  employeeController.updateEmployeeDocumentStatus,
);
router.delete(
  "/:id/documents/:documentId",
  requirePermission("employees.view"),
  employeeController.deleteEmployeeDocument,
);

module.exports = router;
