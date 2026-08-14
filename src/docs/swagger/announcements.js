/**
 * @swagger
 * tags:
 *   - name: Admin Announcements
 *     description: Announcements and circulars for employees and dealers
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AnnouncementRequest:
 *       type: object
 *       required:
 *         - title
 *         - targetAudience
 *       properties:
 *         postType:
 *           type: string
 *           enum: [announcement_circular]
 *           default: announcement_circular
 *         title:
 *           type: string
 *           example: Important update from FADA Secretariat
 *         messageBody:
 *           type: string
 *           example: Dear Members and Dealer Friends...
 *         targetAudience:
 *           type: string
 *           enum: [employees, dealers, members_and_dealers, all]
 *         deliveryChannels:
 *           type: array
 *           items:
 *             type: string
 *             enum: [in_app, email, push]
 *           example: [in_app, email, push]
 *         status:
 *           type: string
 *           enum: [draft, published, scheduled]
 *           default: draft
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *           description: Required when status is scheduled
 *     Announcement:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         createdByAdminId:
 *           type: integer
 *           nullable: true
 *         postType:
 *           type: string
 *           enum: [announcement_circular]
 *         title:
 *           type: string
 *         messageBody:
 *           type: string
 *         targetAudience:
 *           type: string
 *           description: Admin API accepts employees, dealers, members_and_dealers, all; stored values may include both for legacy rows
 *           enum: [employees, dealers, members_and_dealers, all, both]
 *         deliveryChannels:
 *           type: array
 *           items:
 *             type: string
 *             enum: [in_app, email, push]
 *         status:
 *           type: string
 *           enum: [draft, published, scheduled]
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /admin/announcements:
 *   get:
 *     tags: [Admin Announcements]
 *     summary: List announcements
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, scheduled]
 *       - in: query
 *         name: targetAudience
 *         schema:
 *           type: string
 *           enum: [employees, dealers, members_and_dealers, all]
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
 *         description: Announcements fetched successfully
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags: [Admin Announcements]
 *     summary: Create announcement
 *     description: Use status draft to save draft, published to send now, or scheduled with scheduledAt.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnnouncementRequest'
 *     responses:
 *       200:
 *         description: Announcement created successfully
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/announcements/{id}:
 *   get:
 *     tags: [Admin Announcements]
 *     summary: Get announcement by id
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
 *         description: Announcement fetched successfully
 *       404:
 *         description: Announcement not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags: [Admin Announcements]
 *     summary: Update announcement
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
 *             $ref: '#/components/schemas/AnnouncementRequest'
 *     responses:
 *       200:
 *         description: Announcement updated successfully
 *       404:
 *         description: Announcement not found
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *   delete:
 *     tags: [Admin Announcements]
 *     summary: Delete announcement
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
 *         description: Announcement deleted successfully
 *       404:
 *         description: Announcement not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * tags:
 *   - name: Dealer Announcements
 *     description: In-app announcements visible to authenticated dealers
 */

/**
 * @swagger
 * /dealers/announcements:
 *   get:
 *     tags: [Dealer Announcements]
 *     summary: List announcements for dealer portal
 *     description: >
 *       Returns announcements targeted at dealers (`dealers`, `members_and_dealers`, `both`, or `all`)
 *       that include the `in_app` delivery channel and are either published, or scheduled with
 *       `scheduledAt` in the past. Ordered by publishedAt then createdAt (newest first).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Announcements fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Announcement'
 *       401:
 *         description: Unauthorized
 */
