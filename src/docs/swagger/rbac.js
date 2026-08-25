/**
 * @swagger
 * tags:
 *   - name: Admin Roles
 *     description: Admin portal role and permission management
 *   - name: Admin Modules
 *     description: RBAC module and permission catalog
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminRoleItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         key:
 *           type: string
 *           example: staff
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         assignableTo:
 *           type: string
 *           enum: [staff, all]
 *         isSystem:
 *           type: boolean
 *         isSuperRole:
 *           type: boolean
 *         isActive:
 *           type: boolean
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *           example: [dashboard.view, dealers.view]
 *     AdminRoleCreateRequest:
 *       type: object
 *       required: [key, name, assignableTo, permissions]
 *       properties:
 *         key:
 *           type: string
 *           example: support
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         assignableTo:
 *           type: string
 *           enum: [staff, all]
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *         isActive:
 *           type: boolean
 *           default: true
 *     AdminRoleUpdateRequest:
 *       type: object
 *       required: [name, assignableTo, permissions]
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         assignableTo:
 *           type: string
 *           enum: [staff, all]
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *         isActive:
 *           type: boolean
 *     AdminModuleItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         key:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         sortOrder:
 *           type: integer
 *         permissions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               key:
 *                 type: string
 *               name:
 *                 type: string
 *               action:
 *                 type: string
 */

/**
 * @swagger
 * /admin/modules:
 *   get:
 *     tags: [Admin Modules]
 *     summary: List modules with nested permissions
 *     description: Used by the Roles & Permissions matrix UI.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Modules fetched successfully
 *       403:
 *         description: Missing roles.manage permission
 */

/**
 * @swagger
 * /admin/permissions:
 *   get:
 *     tags: [Admin Modules]
 *     summary: List flat permission catalog
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions fetched successfully
 *       403:
 *         description: Missing roles.manage permission
 */

/**
 * @swagger
 * /admin/roles:
 *   get:
 *     tags: [Admin Roles]
 *     summary: List roles with permission keys
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
 *         description: Roles fetched successfully
 *   post:
 *     tags: [Admin Roles]
 *     summary: Create custom role
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminRoleCreateRequest'
 *     responses:
 *       200:
 *         description: Role created successfully
 *       409:
 *         description: Role key already exists
 */

/**
 * @swagger
 * /admin/roles/{id}:
 *   get:
 *     tags: [Admin Roles]
 *     summary: Get role by id
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
 *         description: Role fetched successfully
 *       404:
 *         description: Role not found
 *   put:
 *     tags: [Admin Roles]
 *     summary: Update role and replace permissions
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
 *             $ref: '#/components/schemas/AdminRoleUpdateRequest'
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: System role key cannot be changed
 *   delete:
 *     tags: [Admin Roles]
 *     summary: Delete custom role
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
 *         description: Role deleted successfully
 *       400:
 *         description: System role or role assigned to staff
 */
