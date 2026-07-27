/**
 * @swagger
 * tags:
 *   - name: Dealer Profile
 *     description: Dealer profile management (authenticated dealer)
 *   - name: Dealer Contact Persons
 *     description: Dealer key contact person management
 */

/**
 * @swagger
 * /dealers/user/profile:
 *   get:
 *     tags: [Dealer Profile]
 *     summary: Get dealer profile
 *     description: Returns dealer account info, profile details, registered location, and outlet/employee counts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DealerProfileResponse'
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags: [Dealer Profile]
 *     summary: Update dealer profile
 *     description: Updates dealer account fields and upserts dealer profile record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DealerProfileUpdateRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /dealers/contact-persons:
 *   get:
 *     tags: [Dealer Contact Persons]
 *     summary: Get contact persons
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contact persons fetched successfully
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
 *                         $ref: '#/components/schemas/KeyContact'
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags: [Dealer Contact Persons]
 *     summary: Create contact person
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/KeyContactCreateRequest'
 *     responses:
 *       200:
 *         description: Contact person created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /dealers/contact-persons/{id}:
 *   put:
 *     tags: [Dealer Contact Persons]
 *     summary: Update contact person
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
 *             $ref: '#/components/schemas/KeyContactUpdateRequest'
 *     responses:
 *       200:
 *         description: Contact person updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *   delete:
 *     tags: [Dealer Contact Persons]
 *     summary: Delete contact person
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
 *         description: Contact person deleted successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * tags:
 *   - name: Dealer Outlets
 *     description: Dealer outlet management (scoped to authenticated dealer)
 */

/**
 * @swagger
 * /dealers/outlets:
 *   get:
 *     tags: [Dealer Outlets]
 *     summary: Get dealer outlets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Outlets fetched successfully
 *   post:
 *     tags: [Dealer Outlets]
 *     summary: Create outlet
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DealerOutletCreateRequest'
 *     responses:
 *       200:
 *         description: Outlet created successfully
 */

/**
 * @swagger
 * /dealers/outlets/options:
 *   get:
 *     tags: [Dealer Outlets]
 *     summary: Get active outlet options
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Outlet options fetched successfully
 */

/**
 * @swagger
 * /dealers/outlets/{id}:
 *   get:
 *     tags: [Dealer Outlets]
 *     summary: Get outlet by id
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
 *         description: Outlet fetched successfully
 *   put:
 *     tags: [Dealer Outlets]
 *     summary: Update outlet
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
 *             $ref: '#/components/schemas/DealerOutletCreateRequest'
 *     responses:
 *       200:
 *         description: Outlet updated successfully
 *   delete:
 *     tags: [Dealer Outlets]
 *     summary: Delete outlet
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
 *         description: Outlet deleted successfully
 */

/**
 * @swagger
 * tags:
 *   - name: Dealer Employees
 *     description: Dealer employee management (scoped to authenticated dealer)
 */

/**
 * @swagger
 * /dealers/employees:
 *   get:
 *     tags: [Dealer Employees]
 *     summary: Get dealer employees
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: outletId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Employees fetched successfully
 *   post:
 *     tags: [Dealer Employees]
 *     summary: Create employee
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DealerEmployeeCreateRequest'
 *     responses:
 *       200:
 *         description: Employee created successfully
 */

/**
 * @swagger
 * /dealers/employees/{id}:
 *   get:
 *     tags: [Dealer Employees]
 *     summary: Get employee by id
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
 *         description: Employee fetched successfully
 *   put:
 *     tags: [Dealer Employees]
 *     summary: Update employee
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
 *             $ref: '#/components/schemas/DealerEmployeeCreateRequest'
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *   delete:
 *     tags: [Dealer Employees]
 *     summary: Delete employee
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
 *         description: Employee deleted successfully
 */

/**
 * @swagger
 * tags:
 *   - name: Dealer Business Documents
 *     description: Dealer business document uploads
 */

/**
 * @swagger
 * /dealers/business-documents:
 *   get:
 *     tags: [Dealer Business Documents]
 *     summary: Get business documents with upload status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Business documents fetched successfully
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
 *                         $ref: '#/components/schemas/DealerBusinessDocumentItem'
 *   post:
 *     tags: [Dealer Business Documents]
 *     summary: Upload business document
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DealerBusinessDocumentUploadRequest'
 *     responses:
 *       200:
 *         description: Business document uploaded successfully
 *       409:
 *         description: Document already uploaded for this type
 */

/**
 * @swagger
 * /dealers/business-documents/{id}:
 *   delete:
 *     tags: [Dealer Business Documents]
 *     summary: Delete uploaded business document
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: DealerDocument id
 *     responses:
 *       200:
 *         description: Business document deleted successfully
 *       404:
 *         description: Business document not found
 */
