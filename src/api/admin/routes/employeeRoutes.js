const router = require("express").Router();
const employeeController = require("../controllers/employeeController");
const requirePermission = require("../../../middlewares/requirePermission");
const requireAnyPermission = require("../../../middlewares/requireAnyPermission");

const EMPLOYEE_ACCESS_PERMISSIONS = [
  "employees.view",
  "employees.create",
  "employees.edit",
  "employees.delete",
  "employees.verify",
  "employees.approve_documents",
  "employees.import",
];

const employeeCreate = requireAnyPermission("employees.create", "employees.view");
const employeeEdit = requireAnyPermission("employees.edit", "employees.view");
const employeeDelete = requireAnyPermission("employees.delete", "employees.view");

const employeeDocumentApprove = requireAnyPermission(
  "employees.approve_documents",
  "employees.verify",
);

router.get("/", requireAnyPermission(...EMPLOYEE_ACCESS_PERMISSIONS), employeeController.getEmployees);
router.get(
  "/stats",
  requireAnyPermission(...EMPLOYEE_ACCESS_PERMISSIONS),
  employeeController.getEmployeeStats,
);
router.post("/import", requirePermission("employees.import"), employeeController.importEmployees);
router.get(
  "/edit/:id",
  requirePermission("employees.view"),
  employeeController.getEmployeeForEdit,
);
router.get("/:id", requirePermission("employees.view"), employeeController.getEmployeeById);
router.get("/edit/:id", requirePermission("employees.view"), employeeController.getEmployeeEditById);
router.post("/", employeeCreate, employeeController.createEmployee);
router.put(
  "/:id/status/:status",
  requirePermission("employees.verify"),
  employeeController.updateEmployeeStatus,
);
router.put("/:id", employeeEdit, employeeController.updateEmployee);
router.delete("/:id", employeeDelete, employeeController.deleteEmployee);
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
  employeeDocumentApprove,
  employeeController.updateEmployeeDocumentStatus,
);
router.delete(
  "/:id/documents/:documentId",
  employeeEdit,
  employeeController.deleteEmployeeDocument,
);

module.exports = router;
