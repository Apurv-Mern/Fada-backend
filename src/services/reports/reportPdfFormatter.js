const dayjs = require("dayjs");
const { REPORT_NAMES } = require("./reportConstants");

const COLUMN_LABELS = {
  dealerId: "Dealer ID",
  dealerCode: "Dealer Code",
  dealerName: "Dealer Name",
  dealerType: "Dealer Type",
  oemBrand: "OEM / Brand",
  state: "State",
  city: "City",
  address: "Address",
  registrationDate: "Registration Date",
  dealerStatus: "Dealer Status",
  isActive: "Active",
  totalEmployees: "Total Employees",
  fadaIdsCreated: "FADA IDs Created",
  verifiedEmployees: "Verified Employees",
  activeEmployees: "Active Employees",
  lastActivityAt: "Last Activity",
  employeeId: "Employee ID",
  fadaId: "FADA ID",
  name: "Name",
  employeeName: "Employee Name",
  employeeCode: "Employee Code",
  phone: "Mobile",
  email: "Email",
  department: "Department",
  designation: "Designation",
  joiningDate: "Joining Date",
  employmentStatus: "Employment Status",
  fadaIdStatus: "FADA ID Status",
  profileCompletion: "Profile Completion",
  verificationStatus: "Verification Status",
  membershipStatus: "Membership Status",
  lastProfileUpdate: "Last Profile Update",
  currentStage: "Current Stage",
  status: "Status",
  registrationDate: "Registration Date",
  pendingSince: "Pending Since",
  ageingDays: "Ageing (Days)",
  ageingBucket: "Ageing Bucket",
  actionRequired: "Action Required",
  entityType: "Entity Type",
  issueType: "Issue Type",
  createdDate: "Created Date",
  resolutionDate: "Resolution Date",
  resolutionStatus: "Resolution Status",
  eventType: "Event Type",
  effectiveDate: "Effective Date",
  statusDetail: "Status Detail",
  period: "Period",
  count: "Count",
};

const REPORT_COLUMNS = {
  "dealer-master": [
    "dealerCode",
    "dealerName",
    "dealerType",
    "oemBrand",
    "state",
    "city",
    "dealerStatus",
    "totalEmployees",
    "fadaIdsCreated",
    "verifiedEmployees",
    "activeEmployees",
    "lastActivityAt",
  ],
  "employee-master": [
    "fadaId",
    "name",
    "employeeCode",
    "phone",
    "email",
    "department",
    "designation",
    "joiningDate",
    "employmentStatus",
    "fadaIdStatus",
    "verificationStatus",
    "membershipStatus",
  ],
  "onboarding-verification": [
    "employeeName",
    "fadaId",
    "department",
    "currentStage",
    "status",
    "pendingSince",
    "ageingBucket",
    "actionRequired",
  ],
  "verification-exceptions": [
    "entityType",
    "issueType",
    "dealer",
    "employee",
    "fadaId",
    "status",
    "pendingSince",
    "ageingBucket",
    "actionRequired",
  ],
  "dealer-onboarding": [
    "dealerCode",
    "dealerName",
    "state",
    "city",
    "currentStage",
    "dealerStatus",
    "registrationDate",
  ],
  "employee-movement": [
    "eventType",
    "employeeName",
    "fadaId",
    "effectiveDate",
    "department",
    "designation",
    "statusDetail",
  ],
  "fada-id-growth": ["period", "count"],
};

function humanizeKey(key) {
  if (COLUMN_LABELS[key]) return COLUMN_LABELS[key];
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function formatCellValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (value instanceof Date) return dayjs(value).format("DD MMM YYYY, HH:mm");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : value.toFixed(2);
  if (typeof value === "object") {
    if (value.name && (value.id || value.code)) {
      return value.code ? `${value.name} (${value.code})` : value.name;
    }
    if (value.completed !== undefined) {
      return value.completed
        ? "Completed (100%)"
        : `In progress (${value.percentage || 0}%)`;
    }
    if (Array.isArray(value)) return `${value.length} item(s)`;
    try {
      return JSON.stringify(value);
    } catch {
      return "—";
    }
  }
  const str = String(value);
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
    return dayjs(str).format("DD MMM YYYY");
  }
  return str;
}

function flattenRow(row) {
  const flat = {};
  for (const [key, value] of Object.entries(row || {})) {
    flat[key] = formatCellValue(value);
  }
  return flat;
}

function flattenSummary(summary, prefix = "") {
  const items = [];
  if (!summary || typeof summary !== "object") return items;

  for (const [key, value] of Object.entries(summary)) {
    const label = prefix ? `${prefix}${humanizeKey(key)}` : humanizeKey(key);

    if (Array.isArray(value)) {
      if (value.length && typeof value[0] === "object") {
        items.push({
          label,
          value: `${value.length} group(s)`,
          isGroup: true,
          groupRows: value.slice(0, 12).map((item) =>
            Object.fromEntries(
              Object.entries(item).map(([k, v]) => [humanizeKey(k), formatCellValue(v)]),
            ),
          ),
        });
      } else {
        items.push({ label, value: value.join(", ") || "—" });
      }
    } else if (value && typeof value === "object") {
      items.push(...flattenSummary(value, `${label} · `));
    } else {
      items.push({ label, value: formatCellValue(value) });
    }
  }

  return items;
}

function buildTableColumns(reportKey, rows) {
  const preferred = REPORT_COLUMNS[reportKey];
  if (preferred?.length) {
    return preferred.map((key) => ({ key, label: humanizeKey(key) }));
  }
  if (!rows?.length) return [];
  const keys = Object.keys(rows[0]).filter(
    (k) => !["employeeId", "dealerId", "entityId"].includes(k),
  );
  return keys.map((key) => ({ key, label: humanizeKey(key) }));
}

function buildFilterChips(filtersApplied = {}) {
  return Object.entries(filtersApplied)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => ({
      label: humanizeKey(key),
      value: formatCellValue(value),
    }));
}

function prepareReportPdfViewModel(reportData) {
  const { meta, summary, rows = [], breakdowns, pagination } = reportData;
  const flatRows = rows.map(flattenRow);
  const columns = buildTableColumns(meta.reportKey, rows);
  const summaryItems = flattenSummary(summary);
  const filterChips = buildFilterChips(meta.filtersApplied);

  const periodLabel =
    meta.period?.from || meta.period?.to
      ? `${meta.period.from ? dayjs(meta.period.from).format("DD MMM YYYY") : "—"} → ${meta.period.to ? dayjs(meta.period.to).format("DD MMM YYYY") : "—"}`
      : "All time";

  return {
    appName: "FADA ID",
    reportTitle: meta.reportName || REPORT_NAMES[meta.reportKey] || meta.reportKey,
    reportKey: meta.reportKey,
    portal: meta.portal === "dealer" ? "Dealer Portal" : "Admin Portal",
    generatedAt: dayjs(meta.generatedAt).format("DD MMM YYYY, HH:mm"),
    generatedBy: meta.generatedBy?.name || "System",
    periodLabel,
    filterChips,
    summaryItems,
    columns,
    rows: flatRows,
    breakdowns: breakdowns
      ? Object.entries(breakdowns).map(([key, value]) => ({
          title: humanizeKey(key),
          items: Array.isArray(value)
            ? value.slice(0, 15).map((item) =>
                Object.fromEntries(
                  Object.entries(item).map(([k, v]) => [humanizeKey(k), formatCellValue(v)]),
                ),
              )
            : [],
        }))
      : [],
    pagination,
    hasDetailTable: flatRows.length > 0 && columns.length > 0,
    isSummaryOnly: flatRows.length === 0 && summaryItems.length > 0,
  };
}

module.exports = {
  prepareReportPdfViewModel,
  humanizeKey,
  formatCellValue,
};
