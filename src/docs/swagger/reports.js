/**
 * @swagger
 * tags:
 *   - name: Admin Reports
 *     description: Admin portal reports (A1–A5) and shared employee reports at ecosystem scope
 */

/**
 * @swagger
 * /admin/reports/filters:
 *   get:
 *     tags: [Admin Reports]
 *     summary: Get report filter metadata
 *     description: >
 *       Returns dropdown options for report filters. Omit reportKey for all filter catalogs,
 *       or pass reportKey to receive only filters applicable to that report.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reportKey
 *         schema:
 *           type: string
 *           enum:
 *             - dealer-master
 *             - dealer-onboarding
 *             - fada-id-growth
 *             - verification-exceptions
 *             - ecosystem-health
 *             - employee-master
 *             - onboarding-verification
 *             - employee-movement
 *             - workforce-analytics
 *             - adoption-compliance
 *     responses:
 *       200:
 *         description: Filter options fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       description: Filter catalogs keyed by type (states, cities, dealers, brands, etc.)
 *       403:
 *         description: Missing reports.view permission
 */

/**
 * @swagger
 * /admin/reports/dealer-master:
 *   get:
 *     tags: [Admin Reports]
 *     summary: "A1 — Company Master & Company Status"
 *     description: Main company register with employee and FADA ID counts. Filter params via /admin/reports/filters?reportKey=dealer-master
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportResponse'
 */

/**
 * @swagger
 * /admin/reports/dealer-master/export:
 *   get:
 *     tags: [Admin Reports]
 *     summary: "Export A1 — Company Master & Company Status"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [xlsx, pdf]
 *           default: xlsx
 *     responses:
 *       200:
 *         description: File download
 */

/**
 * @swagger
 * /admin/reports/dealer-onboarding:
 *   get:
 *     tags: [Admin Reports]
 *     summary: "A2 — Company Onboarding & Activation"
 *     description: Tracks company funnel from invitation through activation.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Report generated successfully
 */

/**
 * @swagger
 * /admin/reports/dealer-onboarding/export:
 *   get:
 *     tags: [Admin Reports]
 *     summary: "Export A2 — Company Onboarding & Activation"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File download
 */

/**
 * @swagger
 * /admin/reports/fada-id-growth:
 *   get:
 *     tags: [Admin Reports]
 *     summary: "A3 — FADA ID Registration & Growth"
 *     description: Ecosystem growth metrics and registration trends.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Report generated successfully
 */

/**
 * @swagger
 * /admin/reports/fada-id-growth/export:
 *   get:
 *     tags: [Admin Reports]
 *     summary: "Export A3 — FADA ID Registration & Growth"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File download
 */

/**
 * @swagger
 * /admin/reports/verification-exceptions:
 *   get:
 *     tags: [Admin Reports]
 *     summary: "A4 — Verification & Exceptions"
 *     description: Records needing admin intervention or follow-up.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Report generated successfully
 */

/**
 * @swagger
 * /admin/reports/verification-exceptions/export:
 *   get:
 *     tags: [Admin Reports]
 *     summary: "Export A4 — Verification & Exceptions"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File download
 */

/**
 * @swagger
 * /admin/reports/ecosystem-health:
 *   get:
 *     tags: [Admin Reports]
 *     summary: "A5 — Company & Workforce Health"
 *     description: Management summary of adoption and ecosystem health.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Report generated successfully
 */

/**
 * @swagger
 * /admin/reports/ecosystem-health/export:
 *   get:
 *     tags: [Admin Reports]
 *     summary: "Export A5 — Company & Workforce Health"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File download
 */

/**
 * @swagger
 * /admin/reports/employee-master:
 *   get:
 *     tags: [Admin Reports]
 *     summary: "D1 — Employee Master & Profile"
 *     description: Employee register with profile and verification status.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Report generated successfully
 */

/**
 * @swagger
 * /admin/reports/employee-master/export:
 *   get:
 *     tags: [Admin Reports]
 *     summary: "Export D1 — Employee Master & Profile"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File download
 */

/**
 * @swagger
 * /admin/reports/onboarding-verification:
 *   get:
 *     tags: [Admin Reports]
 *     summary: "D2 — FADA ID Onboarding & Verification"
 *     description: Identifies who completed onboarding and who still needs action.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Report generated successfully
 */

/**
 * @swagger
 * /admin/reports/onboarding-verification/export:
 *   get:
 *     tags: [Admin Reports]
 *     summary: "Export D2 — FADA ID Onboarding & Verification"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File download
 */

/**
 * @swagger
 * /admin/reports/employee-movement:
 *   get:
 *     tags: [Admin Reports]
 *     summary: "D3 — Employee Movement"
 *     description: Tracks joiners, exits, and employment changes in a period.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Report generated successfully
 */

/**
 * @swagger
 * /admin/reports/employee-movement/export:
 *   get:
 *     tags: [Admin Reports]
 *     summary: "Export D3 — Employee Movement"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File download
 */

/**
 * @swagger
 * /admin/reports/workforce-analytics:
 *   get:
 *     tags: [Admin Reports]
 *     summary: "D4 — Workforce & FADA ID Analytics"
 *     description: Shows workforce composition and coverage by department.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Report generated successfully
 */

/**
 * @swagger
 * /admin/reports/workforce-analytics/export:
 *   get:
 *     tags: [Admin Reports]
 *     summary: "Export D4 — Workforce & FADA ID Analytics"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File download
 */

/**
 * @swagger
 * /admin/reports/adoption-compliance:
 *   get:
 *     tags: [Admin Reports]
 *     summary: "D5 — FADA ID Adoption & Compliance"
 *     description: Adoption percentages and department-wise gaps.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Report generated successfully
 */

/**
 * @swagger
 * /admin/reports/adoption-compliance/export:
 *   get:
 *     tags: [Admin Reports]
 *     summary: "Export D5 — FADA ID Adoption & Compliance"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File download
 */

/**
 * @swagger
 * /admin/reports/{reportKey}:
 *   get:
 *     tags: [Admin Reports]
 *     summary: Generate admin report (legacy)
 *     deprecated: true
 *     description: >
 *       Deprecated — use dedicated endpoints such as GET /admin/reports/dealer-master.
 *       Returns summary, detail rows, optional breakdowns, and pagination for the requested report key.
 *       For dealer-master, pass dealerId and drillDown=true to return employee-master rows scoped to that dealer.
 *       Available filters vary by reportKey; see /admin/reports/filters?reportKey=...
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportKey
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - dealer-master
 *             - dealer-onboarding
 *             - fada-id-growth
 *             - verification-exceptions
 *             - ecosystem-health
 *             - employee-master
 *             - onboarding-verification
 *             - employee-movement
 *             - workforce-analytics
 *             - adoption-compliance
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by employee name, FADA ID, email, or phone
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: dealerId
 *         schema:
 *           type: integer
 *         description: Filter by dealer. With drillDown=true on dealer-master, scopes employee drill-down.
 *       - in: query
 *         name: drillDown
 *         schema:
 *           type: boolean
 *           default: false
 *         description: dealer-master only — when true with dealerId, returns employee-master rows for that dealer.
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: dealerType
 *         schema:
 *           type: string
 *       - in: query
 *         name: dealerStatus
 *         schema:
 *           type: string
 *           enum: [temporary, pending, approved, rejected]
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: designationId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: employmentStatus
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending, completed]
 *       - in: query
 *         name: fadaIdStatus
 *         schema:
 *           type: string
 *           enum: [none, created, active]
 *       - in: query
 *         name: profileStatus
 *         schema:
 *           type: string
 *           enum: [completed, incomplete]
 *       - in: query
 *         name: verificationStatus
 *         schema:
 *           type: string
 *           enum: [pending, verified, rejected]
 *       - in: query
 *         name: membershipStatus
 *         schema:
 *           type: string
 *           enum: [active, pending]
 *       - in: query
 *         name: stage
 *         schema:
 *           type: string
 *         description: Onboarding stage (dealer or employee depending on reportKey)
 *       - in: query
 *         name: issueType
 *         schema:
 *           type: string
 *           enum:
 *             - dealer_verification_pending
 *             - employee_verification_pending
 *             - document_rejected
 *             - resubmission_required
 *             - duplicate_record
 *             - missing_information
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *           enum: [new_joiner, exit, status_change]
 *       - in: query
 *         name: granularity
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: monthly
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 200
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportResponse'
 *       404:
 *         description: Report not found
 *       403:
 *         description: Missing reports.view permission
 */

/**
 * @swagger
 * /admin/reports/{reportKey}/export:
 *   get:
 *     tags: [Admin Reports]
 *     summary: Export admin report (legacy)
 *     deprecated: true
 *     description: >
 *       Deprecated — use dedicated export endpoints such as GET /admin/reports/dealer-master/export.
 *       Exports report as Excel (.xlsx) or professionally formatted PDF (EJS template rendered via headless Chrome).
 *       Accepts the same filter query params as the screen report endpoint. Max 5000 rows synchronously.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportKey
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - dealer-master
 *             - dealer-onboarding
 *             - fada-id-growth
 *             - verification-exceptions
 *             - ecosystem-health
 *             - employee-master
 *             - onboarding-verification
 *             - employee-movement
 *             - workforce-analytics
 *             - adoption-compliance
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [xlsx, pdf]
 *           default: xlsx
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: dealerId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: drillDown
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: dealerType
 *         schema:
 *           type: string
 *       - in: query
 *         name: dealerStatus
 *         schema:
 *           type: string
 *           enum: [temporary, pending, approved, rejected]
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: designationId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: employmentStatus
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending, completed]
 *       - in: query
 *         name: fadaIdStatus
 *         schema:
 *           type: string
 *           enum: [none, created, active]
 *       - in: query
 *         name: profileStatus
 *         schema:
 *           type: string
 *           enum: [completed, incomplete]
 *       - in: query
 *         name: verificationStatus
 *         schema:
 *           type: string
 *           enum: [pending, verified, rejected]
 *       - in: query
 *         name: membershipStatus
 *         schema:
 *           type: string
 *           enum: [active, pending]
 *       - in: query
 *         name: stage
 *         schema:
 *           type: string
 *       - in: query
 *         name: issueType
 *         schema:
 *           type: string
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *           enum: [new_joiner, exit, status_change]
 *       - in: query
 *         name: granularity
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *     responses:
 *       200:
 *         description: File download (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet or application/pdf)
 *       413:
 *         description: Export row limit exceeded (5000 rows)
 *       503:
 *         description: PDF generation unavailable (headless Chrome not configured)
 *       403:
 *         description: Missing reports.export permission
 */

/**
 * @swagger
 * tags:
 *   - name: Dealer Reports
 *     description: Dealer-scoped reports (D1–D5). Data is always limited to the authenticated dealer.
 */

/**
 * @swagger
 * /dealers/reports/filters:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   get:
 *     tags: [Dealer Reports]
 *     summary: Get dealer report filter metadata
 *     description: >
 *       Returns filter metadata for dealer-portal reports including a search text field.
 *       Pass reportKey to get filters for a specific report (D1–D5).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reportKey
 *         schema:
 *           type: string
 *           enum:
 *             - employee-master
 *             - onboarding-verification
 *             - employee-movement
 *             - workforce-analytics
 *             - adoption-compliance
 *     responses:
 *       200:
 *         description: Filter options fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         search:
 *                           $ref: '#/components/schemas/ReportSearchFilterField'
 *                         departments:
 *                           type: array
 *                           items:
 *                             type: object
 *                         designations:
 *                           type: array
 *                           items:
 *                             type: object
 */

/**
 * @swagger
 * /dealers/reports/{reportKey}:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   get:
 *     tags: [Dealer Reports]
 *     summary: Generate dealer report
 *     description: >
 *       Returns summary, rows, and pagination for dealer-scoped reports.
 *       Data is always limited to the authenticated dealer (or X-Dealer-Id child context).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportKey
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - employee-master
 *             - onboarding-verification
 *             - employee-movement
 *             - workforce-analytics
 *             - adoption-compliance
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by employee name, FADA ID, email, or phone
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: designationId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: employmentStatus
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending, completed]
 *       - in: query
 *         name: fadaIdStatus
 *         schema:
 *           type: string
 *           enum: [none, created, active]
 *       - in: query
 *         name: profileStatus
 *         schema:
 *           type: string
 *           enum: [completed, incomplete]
 *       - in: query
 *         name: verificationStatus
 *         schema:
 *           type: string
 *           enum: [pending, verified, rejected]
 *       - in: query
 *         name: membershipStatus
 *         schema:
 *           type: string
 *           enum: [active, pending]
 *       - in: query
 *         name: stage
 *         schema:
 *           type: string
 *         description: Employee onboarding stage (onboarding-verification report)
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *           enum: [new_joiner, exit, status_change]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 200
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportResponse'
 *       404:
 *         description: Report not available for dealer portal
 */

/**
 * @swagger
 * /dealers/reports/{reportKey}/export:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   get:
 *     tags: [Dealer Reports]
 *     summary: Export dealer report
 *     description: Same filters as the dealer screen report. Max 5000 rows synchronously.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportKey
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - employee-master
 *             - onboarding-verification
 *             - employee-movement
 *             - workforce-analytics
 *             - adoption-compliance
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [xlsx, pdf]
 *           default: xlsx
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: designationId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: employmentStatus
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending, completed]
 *       - in: query
 *         name: fadaIdStatus
 *         schema:
 *           type: string
 *           enum: [none, created, active]
 *       - in: query
 *         name: profileStatus
 *         schema:
 *           type: string
 *           enum: [completed, incomplete]
 *       - in: query
 *         name: verificationStatus
 *         schema:
 *           type: string
 *           enum: [pending, verified, rejected]
 *       - in: query
 *         name: membershipStatus
 *         schema:
 *           type: string
 *           enum: [active, pending]
 *       - in: query
 *         name: stage
 *         schema:
 *           type: string
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *           enum: [new_joiner, exit, status_change]
 *     responses:
 *       200:
 *         description: File download
 *       413:
 *         description: Export row limit exceeded
 *       503:
 *         description: PDF generation unavailable
 */
