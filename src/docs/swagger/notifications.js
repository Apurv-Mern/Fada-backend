/**
 * @swagger
 * tags:
 *   - name: Admin Notifications
 *     description: In-app notifications for admin portal users
 *   - name: Dealer Notifications
 *     description: In-app notifications for dealer portal users
 *   - name: Employee Notifications
 *     description: In-app notifications for employee mobile app users
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         employeeId:
 *           type: integer
 *           nullable: true
 *         dealerId:
 *           type: integer
 *           nullable: true
 *         adminId:
 *           type: integer
 *           nullable: true
 *         title:
 *           type: string
 *           example: New outlet created
 *         body:
 *           type: string
 *           nullable: true
 *         type:
 *           type: string
 *           example: outlet
 *         data:
 *           type: object
 *           nullable: true
 *         sourceType:
 *           type: string
 *           nullable: true
 *           example: Outlet
 *         sourceId:
 *           type: integer
 *           nullable: true
 *         isRead:
 *           type: boolean
 *           example: false
 *         readAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *     NotificationListResponse:
 *       type: object
 *       properties:
 *         notifications:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Notification'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             limit:
 *               type: integer
 *             offset:
 *               type: integer
 *     NotificationUnreadCountResponse:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           example: 3
 */

/**
 * @swagger
 * /admin/notifications:
 *   get:
 *     tags: [Admin Notifications]
 *     summary: List admin notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 */

/**
 * @swagger
 * /admin/notifications/unread-count:
 *   get:
 *     tags: [Admin Notifications]
 *     summary: Get unread admin notification count
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count fetched successfully
 */

/**
 * @swagger
 * /admin/notifications/read-all:
 *   patch:
 *     tags: [Admin Notifications]
 *     summary: Mark all admin notifications as read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */

/**
 * @swagger
 * /admin/notifications/{id}/read:
 *   patch:
 *     tags: [Admin Notifications]
 *     summary: Mark an admin notification as read
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
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */

/**
 * @swagger
 * /dealers/notifications:
 *   get:
 *     tags: [Dealer Notifications]
 *     summary: List dealer notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 */

/**
 * @swagger
 * /dealers/notifications/unread-count:
 *   get:
 *     tags: [Dealer Notifications]
 *     summary: Get unread dealer notification count
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count fetched successfully
 */

/**
 * @swagger
 * /dealers/notifications/read-all:
 *   patch:
 *     tags: [Dealer Notifications]
 *     summary: Mark all dealer notifications as read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */

/**
 * @swagger
 * /dealers/notifications/{id}/read:
 *   patch:
 *     tags: [Dealer Notifications]
 *     summary: Mark a dealer notification as read
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
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */

/**
 * @swagger
 * /api/v1/employee/notifications:
 *   get:
 *     tags: [Employee Notifications]
 *     summary: List employee notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 */

/**
 * @swagger
 * /api/v1/employee/notifications/unread-count:
 *   get:
 *     tags: [Employee Notifications]
 *     summary: Get unread employee notification count
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count fetched successfully
 */

/**
 * @swagger
 * /api/v1/employee/notifications/read-all:
 *   patch:
 *     tags: [Employee Notifications]
 *     summary: Mark all employee notifications as read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */

/**
 * @swagger
 * /api/v1/employee/notifications/{id}/read:
 *   patch:
 *     tags: [Employee Notifications]
 *     summary: Mark an employee notification as read
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
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
