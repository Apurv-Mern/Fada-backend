/**
 * @swagger
 * tags:
 *   - name: Admin Score Rules
 *     description: Score engine rule management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ScoreRuleRequest:
 *       type: object
 *       required: [category, points, action, frequency]
 *       properties:
 *         category:
 *           type: string
 *           enum: [Engagement, Growth, Learning, Other, Performance, Recognition]
 *         points:
 *           type: integer
 *           minimum: 1
 *           example: 10
 *         action:
 *           type: string
 *           example: Complete profile 100%
 *         frequency:
 *           type: string
 *           example: One-time
 *         isActive:
 *           type: boolean
 *           default: true
 */

/**
 * @swagger
 * /admin/score-rules:
 *   get:
 *     tags: [Admin Score Rules]
 *     summary: Get all score rules
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Engagement, Growth, Learning, Other, Performance, Recognition]
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
 *         description: Score rules fetched successfully
 *   post:
 *     tags: [Admin Score Rules]
 *     summary: Create score rule
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScoreRuleRequest'
 *     responses:
 *       200:
 *         description: Score rule created successfully
 *       422:
 *         description: Validation error
 */

/**
 * @swagger
 * /admin/score-rules/{id}:
 *   get:
 *     tags: [Admin Score Rules]
 *     summary: Get score rule by id
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
 *         description: Score rule fetched successfully
 *       404:
 *         description: Score rule not found
 *   put:
 *     tags: [Admin Score Rules]
 *     summary: Update score rule
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
 *             $ref: '#/components/schemas/ScoreRuleRequest'
 *     responses:
 *       200:
 *         description: Score rule updated successfully
 *       404:
 *         description: Score rule not found
 *       422:
 *         description: Validation error
 *   delete:
 *     tags: [Admin Score Rules]
 *     summary: Delete score rule
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
 *         description: Score rule deleted successfully
 *       404:
 *         description: Score rule not found
 */
