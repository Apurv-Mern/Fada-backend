const router = require("express").Router();
const employeeController = require("../controllers/employeeController");

router.get("/", employeeController.getEmployees);
router.get("/stats", employeeController.getEmployeeStats);
router.get("/:id", employeeController.getEmployeeById);
router.post("/", employeeController.createEmployee);
router.put("/:id/status/:status", employeeController.updateEmployeeStatus);
router.put("/:id", employeeController.updateEmployee);
router.delete("/:id", employeeController.deleteEmployee);
router.put("/:id/active-inactive", employeeController.activeInactiveEmployee);

router.get("/:id/documents", employeeController.getEmployeeDocuments);
router.put(
  "/:id/documents/:documentId/status",
  employeeController.updateEmployeeDocumentStatus,
);
router.delete("/:id/documents/:documentId", employeeController.deleteEmployeeDocument);
module.exports = router;
