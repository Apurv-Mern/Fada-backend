/**
 * @swagger
 * tags:
 *   - name: Admin Outlets
 *     description: Admin outlet management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OutletBrandCategoryInput:
 *       type: object
 *       required: [brandId]
 *       properties:
 *         brandId:
 *           type: integer
 *         vehicleClassId:
 *           type: integer
 *           nullable: true
 *     OutletCreateRequest:
 *       type: object
 *       required: [dealerId, name]
 *       properties:
 *         dealerId:
 *           type: integer
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         manager:
 *           type: string
 *         pinCode:
 *           type: string
 *           example: "560001"
 *         city:
 *           type: string
 *         state:
 *           type: string
 *         address:
 *           type: string
 *         functions:
 *           type: array
 *           description: Outlet function slugs or IDs from master
 *           items:
 *             oneOf:
 *               - type: string
 *               - type: integer
 *         brandCategories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OutletBrandCategoryInput'
 *         isActive:
 *           type: boolean
 *           default: true
 *     OutletUpdateRequest:
 *       allOf:
 *         - $ref: '#/components/schemas/OutletCreateRequest'
 */

/**
 * @swagger
 * /admin/outlets:
 *   get:
 *     tags: [Admin Outlets]
 *     summary: Get all outlets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, code, city, or manager
 *       - in: query
 *         name: dealerId
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
 *         description: Outlets fetched successfully
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags: [Admin Outlets]
 *     summary: Create outlet
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OutletCreateRequest'
 *           example:
 *             dealerId: 1
 *             name: Sanganer
 *             code: OUT-02541
 *             manager: Shambhu
 *             pinCode: "303908"
 *             city: Jaipur
 *             state: Rajasthan
 *             address: "jaipur, kotkhawada"
 *             functions: ["sales", "service"]
 *             brandCategories:
 *               - brandId: 1
 *                 vehicleClassId: null
 *             isActive: true
 *     responses:
 *       200:
 *         description: Outlet created successfully
 *       409:
 *         description: Duplicate outlet code for company
 *       422:
 *         description: Validation error
 */

/**
 * @swagger
 * /admin/outlets/parent/{parentId}:
 *   get:
 *     tags: [Admin Outlets]
 *     summary: Get active outlets by dealership
 *     description: Returns id and name for dropdowns filtered by dealerId
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Dealer (company) ID
 *     responses:
 *       200:
 *         description: Outlets fetched successfully
 */

/**
 * @swagger
 * /admin/outlets/{id}:
 *   get:
 *     tags: [Admin Outlets]
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
 *       404:
 *         description: Outlet not found
 *   put:
 *     tags: [Admin Outlets]
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
 *             $ref: '#/components/schemas/OutletUpdateRequest'
 *     responses:
 *       200:
 *         description: Outlet updated successfully
 *       404:
 *         description: Outlet not found
 *       409:
 *         description: Duplicate outlet code for company
 *       422:
 *         description: Validation error
 *   delete:
 *     tags: [Admin Outlets]
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
 *       404:
 *         description: Outlet not found
 */

/**
 * @swagger
 * /admin/outlets/{id}/active-inactive:
 *   put:
 *     tags: [Admin Outlets]
 *     summary: Toggle outlet active status
 *     description: Flips the outlet isActive flag (active → inactive or vice versa)
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
 *         description: Outlet active status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *       404:
 *         description: Outlet not found
 *       401:
 *         description: Unauthorized
 */
