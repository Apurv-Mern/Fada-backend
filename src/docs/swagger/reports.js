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
 *     description: Returns dropdown options for report filters. Pass reportKey query param for report-specific filters.
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
 *       403:
 *         description: Missing reports.view permission
 */

/**
 * @swagger
 * /admin/reports/{reportKey}:
 *   get:
 *     tags: [Admin Reports]
 *     summary: Generate admin report
 *     description: Returns summary, detail rows, and pagination for the requested report key.
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
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: designationId
 *         schema:
 *           type: integer
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
 *       - in: query
 *         name: granularity
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
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
 *     summary: Export admin report
 *     description: >
 *       Exports report as Excel or professionally formatted PDF (EJS template rendered via headless Chrome).
 *       Same filters as screen data. Max 5000 rows synchronously.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportKey
 *         required: true
 *         schema:
 *           type: string
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
 *         name: dealerId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: File download
 *       413:
 *         description: Export row limit exceeded
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
 */

/**
 * @swagger
 * /dealers/reports/{reportKey}:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   get:
 *     tags: [Dealer Reports]
 *     summary: Generate dealer report
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
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
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
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportKey
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [xlsx, pdf]
 *     responses:
 *       200:
 *         description: File download
 *       413:
 *         description: Export row limit exceeded
 */
