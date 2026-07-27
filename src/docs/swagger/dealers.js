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
