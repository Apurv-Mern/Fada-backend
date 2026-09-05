const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

const ADMIN_REPORT_ROUTES = [
  {
    path: "dealer-master",
    code: "A1",
    get: reportController.getDealerMasterReport,
    export: reportController.exportDealerMasterReport,
  },
  {
    path: "dealer-onboarding",
    code: "A2",
    get: reportController.getDealerOnboardingReport,
    export: reportController.exportDealerOnboardingReport,
  },
  {
    path: "fada-id-growth",
    code: "A3",
    get: reportController.getFadaIdGrowthReport,
    export: reportController.exportFadaIdGrowthReport,
  },
  {
    path: "verification-exceptions",
    code: "A4",
    get: reportController.getVerificationExceptionsReport,
    export: reportController.exportVerificationExceptionsReport,
  },
  {
    path: "ecosystem-health",
    code: "A5",
    get: reportController.getEcosystemHealthReport,
    export: reportController.exportEcosystemHealthReport,
  },
  {
    path: "employee-master",
    code: "D1",
    get: reportController.getEmployeeMasterReport,
    export: reportController.exportEmployeeMasterReport,
  },
  {
    path: "onboarding-verification",
    code: "D2",
    get: reportController.getOnboardingVerificationReport,
    export: reportController.exportOnboardingVerificationReport,
  },
  {
    path: "employee-movement",
    code: "D3",
    get: reportController.getEmployeeMovementReport,
    export: reportController.exportEmployeeMovementReport,
  },
  {
    path: "workforce-analytics",
    code: "D4",
    get: reportController.getWorkforceAnalyticsReport,
    export: reportController.exportWorkforceAnalyticsReport,
  },
  {
    path: "adoption-compliance",
    code: "D5",
    get: reportController.getAdoptionComplianceReport,
    export: reportController.exportAdoptionComplianceReport,
  },
];

router.get("/filters", reportController.getReportFilters);

for (const route of ADMIN_REPORT_ROUTES) {
  router.get(`/${route.path}/export`, route.export);
  router.get(`/${route.path}`, route.get);
}

/** @deprecated Use dedicated report paths above */
router.get("/:reportKey/export", reportController.exportReport);

/** @deprecated Use dedicated report paths above */
router.get("/:reportKey", reportController.getReport);

module.exports = router;
