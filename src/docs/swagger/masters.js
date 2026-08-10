/**
 * @swagger
 * tags:
 *   - name: Master Documents
 *     description: Document master endpoints
 *   - name: Master Brands
 *     description: Brand master endpoints
 *   - name: Master Organization
 *     description: Organization structure master endpoints
 *   - name: Master Outlet Functions
 *     description: Outlet function master endpoints
 *   - name: Master Dealers
 *     description: Lightweight dealer list for admin master dropdowns
 */

/**
 * @swagger
 * /admin/masters/documents:
 *   get:
 *     tags: [Master Documents]
 *     summary: Get all documents
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Documents fetched
 *   post:
 *     tags: [Master Documents]
 *     summary: Create document
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, category, appliesTo]
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               category:
 *                 type: string
 *               appliesTo:
 *                 type: string
 *                 enum: [employee, dealer, both]
 *               isActive:
 *                 type: boolean
 *               sortOrder:
 *                 type: integer
 *               isMandatory:
 *                 type: boolean
 *               isVerificationRequired:
 *                 type: boolean
 *               isExpiryApplicable:
 *                 type: boolean
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document created
 */

/**
 * @swagger
 * /admin/masters/documents/{id}:
 *   get:
 *     tags: [Master Documents]
 *     summary: Get document by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Document fetched
 *   put:
 *     tags: [Master Documents]
 *     summary: Update document
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Document updated
 *   delete:
 *     tags: [Master Documents]
 *     summary: Delete document
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Document deleted
 */

/**
 * @swagger
 * /admin/masters/brands:
 *   get:
 *     tags: [Master Brands]
 *     summary: Get all brands
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Brands fetched
 *   post:
 *     tags: [Master Brands]
 *     summary: Create brand
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               flag:
 *                 type: string
 *               country:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Brand created
 */

/**
 * @swagger
 * /admin/masters/brands/{id}:
 *   get:
 *     tags: [Master Brands]
 *     summary: Get brand by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Brand fetched
 *   put:
 *     tags: [Master Brands]
 *     summary: Update brand
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Brand updated
 *   delete:
 *     tags: [Master Brands]
 *     summary: Delete brand
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Brand deleted
 */

/**
 * @swagger
 * /admin/masters/brands/flag/{flag}:
 *   get:
 *     tags: [Master Brands]
 *     summary: Get brands by flag
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: flag
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by brand name
 *     responses:
 *       200:
 *         description: Brands fetched by flag
 */

/**
 * @swagger
 * /admin/masters/organization-structures:
 *   get:
 *     tags: [Master Organization]
 *     summary: Get all organization structures
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organization structures fetched
 *   post:
 *     tags: [Master Organization]
 *     summary: Create organization structure
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, flag]
 *             properties:
 *               parentId:
 *                 type: integer
 *                 nullable: true
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               level:
 *                 type: integer
 *               flag:
 *                 type: string
 *                 enum: [business_function, department, role]
 *     responses:
 *       200:
 *         description: Organization structure created
 */

/**
 * @swagger
 * /admin/masters/organization-structures/{id}:
 *   get:
 *     tags: [Master Organization]
 *     summary: Get organization structure by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Organization structure fetched
 *   put:
 *     tags: [Master Organization]
 *     summary: Update organization structure
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Organization structure updated
 *   delete:
 *     tags: [Master Organization]
 *     summary: Delete organization structure
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Organization structure deleted
 */

/**
 * @swagger
 * /admin/masters/organization-structures/flag/{flag}:
 *   get:
 *     tags: [Master Organization]
 *     summary: Get organization structures by flag
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: flag
 *         required: true
 *         schema:
 *           type: string
 *           enum: [business_function, department, role]
 *     responses:
 *       200:
 *         description: Organization structures fetched by flag
 */

/**
 * @swagger
 * /admin/masters/organization-structures/parent/{parentId}/flag/{flag}:
 *   get:
 *     tags: [Master Organization]
 *     summary: Get organization structures by parent and flag
 *     description: Used for cascading dropdowns (e.g. roles under a department)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: flag
 *         required: true
 *         schema:
 *           type: string
 *           enum: [business_function, department, role]
 *     responses:
 *       200:
 *         description: Organization structures fetched
 */

/**
 * @swagger
 * /admin/masters/outlet-functions:
 *   get:
 *     tags: [Master Outlet Functions]
 *     summary: Get all outlet functions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Outlet functions fetched
 *   post:
 *     tags: [Master Outlet Functions]
 *     summary: Create outlet function
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sales
 *               slug:
 *                 type: string
 *                 example: sales
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Outlet function created
 *       409:
 *         description: Duplicate slug
 *       422:
 *         description: Validation error
 */

/**
 * @swagger
 * /admin/masters/outlet-functions/{id}:
 *   get:
 *     tags: [Master Outlet Functions]
 *     summary: Get outlet function by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Outlet function fetched
 *       404:
 *         description: Not found
 *   put:
 *     tags: [Master Outlet Functions]
 *     summary: Update outlet function
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Outlet function updated
 *       404:
 *         description: Not found
 *       409:
 *         description: Duplicate slug
 *   delete:
 *     tags: [Master Outlet Functions]
 *     summary: Delete outlet function
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Outlet function deleted
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /admin/masters/dealers:
 *   get:
 *     tags: [Master Dealers]
 *     summary: List approved active dealers (master dropdown)
 *     description: Returns id, name, and dealerCode for dealers with status approved and isActive true. Used for admin forms and filters.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dealers fetched successfully
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
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           dealerCode:
 *                             type: string
 *       401:
 *         description: Unauthorized
 */
