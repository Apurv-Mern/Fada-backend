const REPORT_KEYS = {
  DEALER_MASTER: "dealer-master",
  DEALER_ONBOARDING: "dealer-onboarding",
  FADA_ID_GROWTH: "fada-id-growth",
  VERIFICATION_EXCEPTIONS: "verification-exceptions",
  ECOSYSTEM_HEALTH: "ecosystem-health",
  EMPLOYEE_MASTER: "employee-master",
  ONBOARDING_VERIFICATION: "onboarding-verification",
  EMPLOYEE_MOVEMENT: "employee-movement",
  WORKFORCE_ANALYTICS: "workforce-analytics",
  ADOPTION_COMPLIANCE: "adoption-compliance",
};

const REPORT_NAMES = {
  [REPORT_KEYS.DEALER_MASTER]: "Dealer Master & Dealer Status",
  [REPORT_KEYS.DEALER_ONBOARDING]: "Dealer Onboarding & Activation",
  [REPORT_KEYS.FADA_ID_GROWTH]: "FADA ID Registration & Growth",
  [REPORT_KEYS.VERIFICATION_EXCEPTIONS]: "Verification & Exceptions",
  [REPORT_KEYS.ECOSYSTEM_HEALTH]: "Dealer & Workforce Health",
  [REPORT_KEYS.EMPLOYEE_MASTER]: "Employee Master & Profile",
  [REPORT_KEYS.ONBOARDING_VERIFICATION]: "FADA ID Onboarding & Verification",
  [REPORT_KEYS.EMPLOYEE_MOVEMENT]: "Employee Movement",
  [REPORT_KEYS.WORKFORCE_ANALYTICS]: "Workforce & FADA ID Analytics",
  [REPORT_KEYS.ADOPTION_COMPLIANCE]: "FADA ID Adoption & Compliance",
};

const ADMIN_ONLY_REPORTS = new Set([
  REPORT_KEYS.DEALER_MASTER,
  REPORT_KEYS.DEALER_ONBOARDING,
  REPORT_KEYS.FADA_ID_GROWTH,
  REPORT_KEYS.VERIFICATION_EXCEPTIONS,
  REPORT_KEYS.ECOSYSTEM_HEALTH,
]);

const DEALER_REPORTS = new Set([
  REPORT_KEYS.EMPLOYEE_MASTER,
  REPORT_KEYS.ONBOARDING_VERIFICATION,
  REPORT_KEYS.EMPLOYEE_MOVEMENT,
  REPORT_KEYS.WORKFORCE_ANALYTICS,
  REPORT_KEYS.ADOPTION_COMPLIANCE,
]);

const EMPLOYEE_ONBOARDING_STAGES = [
  "registered",
  "profile_completed",
  "documents_submitted",
  "verified",
  "fully_completed",
];

const DEALER_ONBOARDING_STAGES = [
  "invited",
  "registered",
  "profileCompleted",
  "documentsSubmitted",
  "verified",
  "activated",
  "active",
];

const ISSUE_TYPES = [
  "dealer_verification_pending",
  "employee_verification_pending",
  "document_rejected",
  "resubmission_required",
  "duplicate_record",
  "missing_information",
];

const EVENT_TYPES = ["new_joiner", "exit", "status_change"];

const AGEING_BUCKETS = ["0-2", "3-7", "8-15", "15+"];

const LOW_ADOPTION_THRESHOLD = 50;

const EXPORT_ROW_LIMIT = 5000;

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

const REPORT_FILTERS = {
  [REPORT_KEYS.DEALER_MASTER]: [
    "state",
    "city",
    "dealerId",
    "brand",
    "dealerType",
    "dealerStatus",
    "fromDate",
    "toDate",
  ],
  [REPORT_KEYS.DEALER_ONBOARDING]: [
    "state",
    "city",
    "dealerId",
    "brand",
    "dealerType",
    "dealerStatus",
    "fromDate",
    "toDate",
    "stage",
  ],
  [REPORT_KEYS.FADA_ID_GROWTH]: [
    "state",
    "city",
    "dealerId",
    "brand",
    "departmentId",
    "designationId",
    "fromDate",
    "toDate",
    "granularity",
  ],
  [REPORT_KEYS.VERIFICATION_EXCEPTIONS]: [
    "state",
    "city",
    "dealerId",
    "issueType",
    "fromDate",
    "toDate",
  ],
  [REPORT_KEYS.ECOSYSTEM_HEALTH]: [
    "state",
    "city",
    "dealerId",
    "brand",
    "fromDate",
    "toDate",
  ],
  [REPORT_KEYS.EMPLOYEE_MASTER]: [
    "dealerId",
    "departmentId",
    "designationId",
    "employmentStatus",
    "fadaIdStatus",
    "profileStatus",
    "verificationStatus",
    "membershipStatus",
    "fromDate",
    "toDate",
  ],
  [REPORT_KEYS.ONBOARDING_VERIFICATION]: [
    "dealerId",
    "departmentId",
    "designationId",
    "stage",
    "fromDate",
    "toDate",
  ],
  [REPORT_KEYS.EMPLOYEE_MOVEMENT]: [
    "dealerId",
    "departmentId",
    "designationId",
    "eventType",
    "fromDate",
    "toDate",
  ],
  [REPORT_KEYS.WORKFORCE_ANALYTICS]: [
    "dealerId",
    "departmentId",
    "designationId",
  ],
  [REPORT_KEYS.ADOPTION_COMPLIANCE]: [
    "dealerId",
    "departmentId",
    "designationId",
  ],
};

module.exports = {
  REPORT_KEYS,
  REPORT_NAMES,
  ADMIN_ONLY_REPORTS,
  DEALER_REPORTS,
  EMPLOYEE_ONBOARDING_STAGES,
  DEALER_ONBOARDING_STAGES,
  ISSUE_TYPES,
  EVENT_TYPES,
  AGEING_BUCKETS,
  LOW_ADOPTION_THRESHOLD,
  EXPORT_ROW_LIMIT,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  REPORT_FILTERS,
};
