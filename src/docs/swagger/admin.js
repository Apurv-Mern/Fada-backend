/**
 * @swagger
 * tags:
 *   - name: Admin Dealers
 *     description: Admin dealer management endpoints
 */

/**
 * @swagger
 * /admin/dealers:
 *   get:
 *     tags: [Admin Dealers]
 *     summary: Get all dealers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, dealerCode, dealerId, email, or phone
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [temporary, pending, approved, rejected]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: parentDealerId
 *         schema:
 *           type: integer
 *         description: Filter child dealers by parent group-holding dealer
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
 *         description: Dealers fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Missing dealers.view permission
 *   post:
 *     tags: [Admin Dealers]
 *     summary: Create dealer
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminDealerUpsertRequest'
 *           example:
 *             name: ABC Motors
 *             email: dealer@example.com
 *             phone: "9876543210"
 *             dealerCode: DLR-001
 *             brands: [1, 2]
 *             isGroupHoldingEntity: false
 *             parentCompanyId: null
 *             location:
 *               address: 123 MG Road
 *               city: Mumbai
 *               state: Maharashtra
 *               country: India
 *               pinCode: "400001"
 *               gstNumber: 27AABCU9603R1ZM
 *     responses:
 *       200:
 *         description: Dealer created (includes auto-generated dealerId)
 *       422:
 *         description: Validation error or invalid brand IDs
 *       403:
 *         description: Missing dealers.create permission
 */

/**
 * @swagger
 * /admin/dealers/import:
 *   post:
 *     tags: [Admin Dealers]
 *     summary: Bulk import dealers
 *     description: >
 *       Creates approved, active dealers from a JSON array. Skips rows when email or phone
 *       already exists and returns those rows with a reason. Sends a temporary password email
 *       for each successfully imported dealer.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminDealerImportRequest'
 *           example:
 *             - name: ABC Motors
 *               email: abc@example.com
 *               phone: "9876543210"
 *               code: DLR-ABC-001
 *               isGroupHoldingCompany: false
 *               parentCompanyCode: DLR-PARENT-001
 *     responses:
 *       200:
 *         description: Import completed; data contains skipped rows with reason
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       description: Rows skipped due to duplicate email/phone
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/AdminDealerImportItem'
 *                           - type: object
 *                             properties:
 *                               reason:
 *                                 type: string
 *                                 example: Email already exists
 *       400:
 *         description: Empty import payload
 *       403:
 *         description: Missing dealers.create permission
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/dealers/group-holding:
 *   get:
 *     tags: [Admin Dealers]
 *     summary: Get group holding dealers
 *     description: Returns dealers marked as group holding entities (for parent company dropdowns)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Group holding dealers fetched successfully
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
 *                         $ref: '#/components/schemas/GroupHoldingDealerItem'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/dealers/stats:
 *   get:
 *     tags: [Admin Dealers]
 *     summary: Get dealer statistics
 *     description: Returns counts for all, status-based, and active/inactive dealers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dealer stats fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DealerStatsResponse'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/dealers/{id}:
 *   get:
 *     tags: [Admin Dealers]
 *     summary: Get dealer by id
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
 *         description: Dealer fetched
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AdminDealerDetailResponse'
 *   put:
 *     tags: [Admin Dealers]
 *     summary: Update dealer
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
 *             $ref: '#/components/schemas/AdminDealerUpsertRequest'
 *     responses:
 *       200:
 *         description: Dealer updated
 *       422:
 *         description: Validation error or invalid brand IDs
 *   delete:
 *     tags: [Admin Dealers]
 *     summary: Delete dealer
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
 *         description: Dealer deleted
 */

/**
 * @swagger
 * /admin/dealers/{id}/status:
 *   put:
 *     tags: [Admin Dealers]
 *     summary: Update dealer status
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [temporary, pending, approved, rejected]
 *     responses:
 *       200:
 *         description: Dealer status updated
 *       403:
 *         description: Missing dealers.approve permission
 */

/**
 * @swagger
 * /admin/dealers/{dealerId}/location:
 *   put:
 *     tags: [Admin Dealers]
 *     summary: Create or update dealer location
 *     description: Upserts one location record per dealer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dealerId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pinCode, city, state, country, gstNumber, address]
 *             properties:
 *               pinCode:
 *                 type: string
 *                 example: "560001"
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *                 example: India
 *               gstNumber:
 *                 type: string
 *                 example: "29ABCDE1234F1Z5"
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dealer location saved
 *       404:
 *         description: Dealer not found
 *       409:
 *         description: GST number already exists
 *       422:
 *         description: Validation error
 */

/**
 * @swagger
 * /admin/dealers/{dealerId}/key-contact:
 *   get:
 *     tags: [Admin Dealers]
 *     summary: Get dealer key contacts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dealerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Key contacts fetched
 *       404:
 *         description: Dealer not found
 *   post:
 *     tags: [Admin Dealers]
 *     summary: Add dealer key contact
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dealerId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, designation, phone, email]
 *             properties:
 *               name:
 *                 type: string
 *               designation:
 *                 type: string
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               email:
 *                 type: string
 *                 format: email
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Key contact added
 *       404:
 *         description: Dealer not found
 *       422:
 *         description: Validation error
 */

/**
 * @swagger
 * /admin/dealers/{dealerId}/key-contact/{keyContactId}:
 *   put:
 *     tags: [Admin Dealers]
 *     summary: Update dealer key contact
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dealerId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: keyContactId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, designation, phone, email]
 *             properties:
 *               name:
 *                 type: string
 *               designation:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Key contact updated
 *       404:
 *         description: Key contact not found
 *       422:
 *         description: Validation error
 *   delete:
 *     tags: [Admin Dealers]
 *     summary: Delete dealer key contact
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dealerId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: keyContactId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Key contact deleted
 *       404:
 *         description: Key contact not found
 */

/**
 * @swagger
 * /admin/dealers/{dealerId}/business-documents:
 *   get:
 *     tags: [Admin Dealers]
 *     summary: Get dealer business documents
 *     description: Returns document master list with dealer upload status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dealerId
 *         required: true
 *         schema:
 *           type: integer
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
 */

/**
 * @swagger
 * /admin/dealers/{dealerId}/business-documents/{dealerDocumentId}/verify:
 *   put:
 *     tags: [Admin Dealers]
 *     summary: Verify dealer business document
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dealerId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: dealerDocumentId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: Document status updated successfully
 *       404:
 *         description: Dealer document not found
 *       422:
 *         description: Validation error
 */
