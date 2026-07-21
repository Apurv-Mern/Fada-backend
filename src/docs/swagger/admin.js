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
 *     responses:
 *       200:
 *         description: Dealers fetched successfully
 *       401:
 *         description: Unauthorized
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
 *             type: object
 *             required: [name, email, phone, address]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dealer created
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
 *             type: object
 *             required: [name, email, phone, address]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dealer updated
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
 */
