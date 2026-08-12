/**
 * @swagger
 * tags:
 *   - name: Dealer Masters
 *     description: >
 *       Read-only master data for authenticated dealers (dropdowns and forms).
 *       Requires dealer Bearer token; accepts optional X-Dealer-Id (validated, does not change master data).
 */

/**
 * @swagger
 * /dealers/masters/brands:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   get:
 *     tags: [Dealer Masters]
 *     summary: Get active brands
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Brands fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MasterIdNameItem'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /dealers/masters/segments:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   get:
 *     tags: [Dealer Masters]
 *     summary: Get active segments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Segments fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MasterIdNameItem'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /dealers/masters/vehicle-class:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   get:
 *     tags: [Dealer Masters]
 *     summary: Get active vehicle classes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vehicle classes fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MasterIdNameItem'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /dealers/masters/business-functions:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   get:
 *     tags: [Dealer Masters]
 *     summary: Get business functions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Business functions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MasterIdNameItem'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /dealers/masters/departments:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   get:
 *     tags: [Dealer Masters]
 *     summary: Get departments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: integer
 *         description: Filter departments by parent business function id
 *     responses:
 *       200:
 *         description: Departments fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MasterIdNameItem'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /dealers/masters/designations:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   get:
 *     tags: [Dealer Masters]
 *     summary: Get designations (roles)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: integer
 *         description: Filter designations by parent department id
 *     responses:
 *       200:
 *         description: Designations fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MasterIdNameItem'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /dealers/masters/outlet-functions:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   get:
 *     tags: [Dealer Masters]
 *     summary: Get active outlet functions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Outlet functions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MasterIdNameItem'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /dealers/masters/document-types:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   get:
 *     tags: [Dealer Masters]
 *     summary: Get document types
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: appliesTo
 *         schema:
 *           type: string
 *           enum: [dealer, employee, both]
 *         description: Filter document types by applicability
 *     responses:
 *       200:
 *         description: Document types fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DocumentTypeMasterItem'
 *       401:
 *         description: Unauthorized
 */
