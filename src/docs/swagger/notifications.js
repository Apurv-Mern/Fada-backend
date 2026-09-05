/**
 * @swagger
 * tags:
 *   - name: Admin Notifications
 *     description: In-app notifications for admin portal users (auth only, no RBAC permission required)
 *   - name: Dealer Notifications
 *     description: In-app notifications for dealer portal users (auth only)
 *   - name: Employee Notifications
 *     description: In-app notifications for employee mobile app users (auth only)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     NotificationType:
 *       type: string
 *       enum: [general, announcement, dealer, outlet, employee, employment, invitation, system]
 *       example: outlet
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
 *           example: Outlet ABC was created under Company XYZ
 *         type:
 *           $ref: '#/components/schemas/NotificationType'
 *         data:
 *           type: object
 *           nullable: true
 *           additionalProperties: true
 *           example:
 *             outletId: 5
 *             screen: outlet-detail
 *         sourceType:
 *           type: string
 *           nullable: true
 *           example: Outlet
 *         sourceId:
 *           type: integer
 *           nullable: true
 *           example: 5
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
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     NotificationListData:
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
 *               example: 42
 *             limit:
 *               type: integer
 *               example: 20
 *             offset:
 *               type: integer
 *               example: 0
 *     NotificationLatestData:
 *       type: object
 *       properties:
 *         notifications:
 *           type: array
 *           maxItems: 5
 *           description: Up to 5 most recent notifications ordered by createdAt descending
 *           items:
 *             $ref: '#/components/schemas/Notification'
 *     NotificationUnreadCountData:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           example: 3
 *     NotificationMarkAllReadData:
 *       type: object
 *       properties:
 *         updatedCount:
 *           type: integer
 *           example: 5
 *     NotificationListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiSuccessResponse'
 *         - type: object
 *           properties:
 *             message:
 *               example: Notifications fetched successfully
 *             data:
 *               $ref: '#/components/schemas/NotificationListData'
 *     NotificationLatestResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiSuccessResponse'
 *         - type: object
 *           properties:
 *             message:
 *               example: Latest notifications fetched successfully
 *             data:
 *               $ref: '#/components/schemas/NotificationLatestData'
 *     NotificationUnreadCountResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiSuccessResponse'
 *         - type: object
 *           properties:
 *             message:
 *               example: Unread notification count fetched successfully
 *             data:
 *               $ref: '#/components/schemas/NotificationUnreadCountData'
 *     NotificationReadResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiSuccessResponse'
 *         - type: object
 *           properties:
 *             message:
 *               example: Notification marked as read
 *             data:
 *               $ref: '#/components/schemas/Notification'
 *     NotificationMarkAllReadResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiSuccessResponse'
 *         - type: object
 *           properties:
 *             message:
 *               example: All notifications marked as read
 *             data:
 *               $ref: '#/components/schemas/NotificationMarkAllReadData'
 *   parameters:
 *     NotificationLimit:
 *       in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 100
 *         default: 20
 *       description: Page size (max 100)
 *     NotificationOffset:
 *       in: query
 *       name: offset
 *       schema:
 *         type: integer
 *         minimum: 0
 *         default: 0
 *       description: Pagination offset
 *     NotificationIsRead:
 *       in: query
 *       name: isRead
 *       schema:
 *         type: boolean
 *       description: Filter by read status
 *     NotificationTypeFilter:
 *       in: query
 *       name: type
 *       schema:
 *         $ref: '#/components/schemas/NotificationType'
 *       description: Filter by notification type
 *     NotificationSearch:
 *       in: query
 *       name: search
 *       schema:
 *         type: string
 *       description: Search in title and body
 *     NotificationId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *       description: Notification id
 */

/**
 * @swagger
 * /admin/notifications:
 *   get:
 *     tags: [Admin Notifications]
 *     summary: List admin notifications
 *     description: Returns paginated in-app notifications for the authenticated admin user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NotificationLimit'
 *       - $ref: '#/components/parameters/NotificationOffset'
 *       - $ref: '#/components/parameters/NotificationIsRead'
 *       - $ref: '#/components/parameters/NotificationTypeFilter'
 *       - $ref: '#/components/parameters/NotificationSearch'
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationListResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /admin/notifications/latest:
 *   get:
 *     tags: [Admin Notifications]
 *     summary: Get latest 5 admin notifications
 *     description: Returns the 5 most recent notifications for the notification bell/dropdown UI.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Latest notifications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationLatestResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /admin/notifications/unread-count:
 *   get:
 *     tags: [Admin Notifications]
 *     summary: Get unread admin notification count
 *     description: Returns the count of unread notifications for the authenticated admin user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationUnreadCountResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /admin/notifications/read-all:
 *   patch:
 *     tags: [Admin Notifications]
 *     summary: Mark all admin notifications as read
 *     description: Marks every unread notification as read for the authenticated admin user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationMarkAllReadResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /admin/notifications/{id}/read:
 *   patch:
 *     tags: [Admin Notifications]
 *     summary: Mark an admin notification as read
 *     description: Marks a single notification as read. Only notifications belonging to the authenticated admin can be updated.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NotificationId'
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationReadResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /dealers/notifications:
 *   get:
 *     tags: [Dealer Notifications]
 *     summary: List dealer notifications
 *     description: Returns paginated in-app notifications for the authenticated dealer (or active X-Dealer-Id context).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/XDealerId'
 *       - $ref: '#/components/parameters/NotificationLimit'
 *       - $ref: '#/components/parameters/NotificationOffset'
 *       - $ref: '#/components/parameters/NotificationIsRead'
 *       - $ref: '#/components/parameters/NotificationTypeFilter'
 *       - $ref: '#/components/parameters/NotificationSearch'
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationListResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /dealers/notifications/latest:
 *   get:
 *     tags: [Dealer Notifications]
 *     summary: Get latest 5 dealer notifications
 *     description: Returns the 5 most recent notifications for the notification bell/dropdown UI.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/XDealerId'
 *     responses:
 *       200:
 *         description: Latest notifications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationLatestResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /dealers/notifications/unread-count:
 *   get:
 *     tags: [Dealer Notifications]
 *     summary: Get unread dealer notification count
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/XDealerId'
 *     responses:
 *       200:
 *         description: Unread count fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationUnreadCountResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /dealers/notifications/read-all:
 *   patch:
 *     tags: [Dealer Notifications]
 *     summary: Mark all dealer notifications as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/XDealerId'
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationMarkAllReadResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
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
 *       - $ref: '#/components/parameters/XDealerId'
 *       - $ref: '#/components/parameters/NotificationId'
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationReadResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/employee/notifications:
 *   get:
 *     tags: [Employee Notifications]
 *     summary: List employee notifications
 *     description: Returns paginated in-app notifications for the authenticated employee.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NotificationLimit'
 *       - $ref: '#/components/parameters/NotificationOffset'
 *       - $ref: '#/components/parameters/NotificationIsRead'
 *       - $ref: '#/components/parameters/NotificationTypeFilter'
 *       - $ref: '#/components/parameters/NotificationSearch'
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationListResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/employee/notifications/latest:
 *   get:
 *     tags: [Employee Notifications]
 *     summary: Get latest 5 employee notifications
 *     description: Returns the 5 most recent notifications for the notification bell/dropdown UI.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Latest notifications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationLatestResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationUnreadCountResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationMarkAllReadResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
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
 *       - $ref: '#/components/parameters/NotificationId'
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationReadResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
