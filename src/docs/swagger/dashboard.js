/**
 * @swagger
 * tags:
 *   - name: Admin Dashboard
 *     description: Admin dashboard statistics and summaries
 */

/**
 * @swagger
 * /admin/dashboard/stats:
 *   get:
 *     tags: [Admin Dashboard]
 *     summary: Get dashboard statistics
 *     description: Returns aggregate counts for dealers, outlets, and employees plus recently registered dealers (last 30 days).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DashboardStatsResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
