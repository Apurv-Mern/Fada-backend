/**
 * @swagger
 * tags:
 *   - name: Master Documents
 *     description: Document master endpoints
 *   - name: Master Brands
 *     description: Brand master endpoints
 *   - name: Master Organization
 *     description: Organization structure master endpoints
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
 *                 enum: [employee, dealer]
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
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Server is healthy
 */

/**
 * @swagger
 * /api:
 *   get:
 *     tags: [System]
 *     summary: API status
 *     responses:
 *       200:
 *         description: Server running
 */
