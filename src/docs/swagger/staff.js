/**
 * @swagger
 * tags:
 *   - name: Admin Staff
 *     description: FADA admin portal staff account management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminStaffRole:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *           example: Administrator
 *     AdminStaffMember:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *           example: Priya Sharma
 *         email:
 *           type: string
 *           format: email
 *           example: staff@fada.org
 *         phone:
 *           type: string
 *           nullable: true
 *           example: "9876543210"
 *         roleId:
 *           type: integer
 *         role:
 *           $ref: '#/components/schemas/AdminStaffRole'
 *         isActive:
 *           type: boolean
 *           description: Inactive staff cannot sign in to the admin portal
 *         isEditable:
 *           type: boolean
 *           description: False for protected bootstrap accounts
 *         isDeletable:
 *           type: boolean
 *           description: False for protected bootstrap accounts
 *         mustChangePassword:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     AdminStaffCreateRequest:
 *       type: object
 *       required: [name, email, roleId, password, confirmPassword]
 *       properties:
 *         name:
 *           type: string
 *           example: Priya Sharma
 *         email:
 *           type: string
 *           format: email
 *           example: staff@fada.org
 *         phone:
 *           type: string
 *           example: "9876543210"
 *         roleId:
 *           type: integer
 *           description: Role id from GET /admin/staff/roles
 *         password:
 *           type: string
 *           minLength: 8
 *         confirmPassword:
 *           type: string
 *           minLength: 8
 *         isActive:
 *           type: boolean
 *           default: true
 *     AdminStaffUpdateRequest:
 *       type: object
 *       required: [name, email, roleId]
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         roleId:
 *           type: integer
 *         password:
 *           type: string
 *           minLength: 8
 *           description: Optional; omit to keep existing password
 *         confirmPassword:
 *           type: string
 *           minLength: 8
 *         isActive:
 *           type: boolean
 */

/**
 * @swagger
 * /admin/staff/roles:
 *   get:
 *     tags: [Admin Staff]
 *     summary: List staff roles
 *     description: Returns roles for the staff member role dropdown.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff roles fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AdminStaffRole'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/staff:
 *   get:
 *     tags: [Admin Staff]
 *     summary: List staff members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or phone
 *       - in: query
 *         name: roleId
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
 *         description: Staff members fetched successfully
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags: [Admin Staff]
 *     summary: Create staff member
 *     description: Creates a FADA admin portal staff account with login credentials and role assignment.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminStaffCreateRequest'
 *     responses:
 *       200:
 *         description: Staff member created successfully
 *       409:
 *         description: Email already exists
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/staff/{id}:
 *   get:
 *     tags: [Admin Staff]
 *     summary: Get staff member by id
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
 *         description: Staff member fetched successfully
 *       404:
 *         description: Staff member not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags: [Admin Staff]
 *     summary: Update staff member
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
 *             $ref: '#/components/schemas/AdminStaffUpdateRequest'
 *     responses:
 *       200:
 *         description: Staff member updated successfully
 *       404:
 *         description: Staff member not found
 *       409:
 *         description: Email already exists
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *   delete:
 *     tags: [Admin Staff]
 *     summary: Delete staff member
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
 *         description: Staff member deleted successfully
 *       400:
 *         description: Cannot delete your own account
 *       404:
 *         description: Staff member not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/staff/{id}/active-inactive:
 *   put:
 *     tags: [Admin Staff]
 *     summary: Toggle staff active status
 *     description: Flips the staff isActive flag (active → inactive or vice versa). Inactive staff cannot sign in to the admin portal.
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
 *         description: Staff active status toggled successfully
 *       400:
 *         description: Cannot change your own active status
 *       404:
 *         description: Staff member not found
 *       401:
 *         description: Unauthorized
 */
