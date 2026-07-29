/**
 * @swagger
 * tags:
 *   - name: Admin Score Stages
 *     description: Score progression tier management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ScoreStageRequest:
 *       type: object
 *       required: [name, minScore, maxScore, colorHex]
 *       properties:
 *         name:
 *           type: string
 *           example: Bronze
 *         minScore:
 *           type: integer
 *           minimum: 0
 *           example: 0
 *         maxScore:
 *           type: integer
 *           minimum: 0
 *           example: 299
 *         colorHex:
 *           type: string
 *           example: "#B87333"
 *         isActive:
 *           type: boolean
 *           default: true
 *     ScoreStageBulkUpdateRequest:
 *       type: array
 *       items:
 *         allOf:
 *           - $ref: '#/components/schemas/ScoreStageRequest'
 *           - type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Optional existing stage id
 */

/**
 * @swagger
 * /admin/score-stages:
 *   get:
 *     tags: [Admin Score Stages]
 *     summary: Get all score stages
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
 *     responses:
 *       200:
 *         description: Score stages fetched successfully
 *   put:
 *     tags: [Admin Score Stages]
 *     summary: Bulk update score stages
 *     description: Updates existing score stages when id is provided and creates new stages when id is omitted. Existing stages not included in the payload are kept unchanged.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScoreStageBulkUpdateRequest'
 *           example:
 *             - name: Bronze
 *               minScore: 0
 *               maxScore: 299
 *               colorHex: "#B87333"
 *               isActive: true
 *             - name: Silver
 *               minScore: 300
 *               maxScore: 599
 *               colorHex: "#9CA3AF"
 *               isActive: true
 *     responses:
 *       200:
 *         description: Score stages updated successfully
 *       409:
 *         description: Duplicate stage name
 *       422:
 *         description: Validation error
 */

/**
 * @swagger
 * /admin/score-stages/{id}:
 *   get:
 *     tags: [Admin Score Stages]
 *     summary: Get score stage by id
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
 *         description: Score stage fetched successfully
 *       404:
 *         description: Score stage not found
 *   put:
 *     tags: [Admin Score Stages]
 *     summary: Update score stage or bulk update score stages
 *     description: Pass a single object to update one stage, or an array to bulk update the full configuration (path id is ignored for array payloads).
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
 *             oneOf:
 *               - $ref: '#/components/schemas/ScoreStageRequest'
 *               - $ref: '#/components/schemas/ScoreStageBulkUpdateRequest'
 *     responses:
 *       200:
 *         description: Score stage updated successfully
 *       404:
 *         description: Score stage not found
 *       409:
 *         description: Duplicate stage name
 *       422:
 *         description: Validation error
 *   delete:
 *     tags: [Admin Score Stages]
 *     summary: Delete score stage
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
 *         description: Score stage deleted successfully
 *       404:
 *         description: Score stage not found
 */
