/**
 * @swagger
 * tags:
 *   - name: Admin Employees
 *     description: Admin employee management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     EmployeeDesignationInput:
 *       type: object
 *       required: [departmentId, designationId]
 *       properties:
 *         departmentId:
 *           type: integer
 *         designationId:
 *           type: integer
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *           nullable: true
 *         isActive:
 *           type: boolean
 *     EmployeeAssignmentInput:
 *       type: object
 *       required: [dealerId]
 *       properties:
 *         dealerId:
 *           type: integer
 *         outletId:
 *           type: integer
 *           nullable: true
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *           nullable: true
 *         isActive:
 *           type: boolean
 *     EmployeeCreateRequest:
 *       type: object
 *       required: [name]
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         score:
 *           type: integer
 *           default: 0
 *         isActive:
 *           type: boolean
 *           default: true
 *         joinedDate:
 *           type: string
 *           format: date
 *         designation:
 *           $ref: '#/components/schemas/EmployeeDesignationInput'
 *         assignment:
 *           $ref: '#/components/schemas/EmployeeAssignmentInput'
 *     EmployeeUpdateRequest:
 *       allOf:
 *         - $ref: '#/components/schemas/EmployeeCreateRequest'
 */

/**
 * @swagger
 * /admin/employees:
 *   get:
 *     tags: [Admin Employees]
 *     summary: Get all employees
 *     description: List employees with search, filters, and pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, phone, or FADA ID
 *       - in: query
 *         name: dealerId
 *         schema:
 *           type: integer
 *         description: Filter by dealership assignment
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: integer
 *         description: Filter by department designation
 *       - in: query
 *         name: outletId
 *         schema:
 *           type: integer
 *         description: Filter by branch assignment
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [temporary, pending, approved, rejected]
 *         description: Filter by employee status
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
 *         description: Employees fetched successfully
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags: [Admin Employees]
 *     summary: Create employee
 *     description: Creates employee with auto-generated FADA ID, designation, and assignment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeCreateRequest'
 *           example:
 *             name: Shambhu Meena
 *             email: shambhu@company.com
 *             phone: "9876543210"
 *             score: 0
 *             isActive: true
 *             joinedDate: "2026-07-22"
 *             designation:
 *               departmentId: 5
 *               designationId: 12
 *             assignment:
 *               dealerId: 1
 *               outletId: 3
 *     responses:
 *       200:
 *         description: Employee created successfully
 *       409:
 *         description: Duplicate email or unique constraint violation
 *       422:
 *         description: Validation error
 */

/**
 * @swagger
 * /admin/employees/stats:
 *   get:
 *     tags: [Admin Employees]
 *     summary: Get employee statistics
 *     description: Returns counts for all, status-based, and active/inactive employees
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee stats fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/EmployeeStatsResponse'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/employees/{id}/status/{status}:
 *   put:
 *     tags: [Admin Employees]
 *     summary: Update employee status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [temporary, pending, approved, rejected]
 *     responses:
 *       200:
 *         description: Employee status updated successfully
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Employee not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/employees/{id}:
 *   get:
 *     tags: [Admin Employees]
 *     summary: Get employee by id
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
 *         description: Employee fetched successfully
 *       404:
 *         description: Employee not found
 *   put:
 *     tags: [Admin Employees]
 *     summary: Update employee
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
 *             $ref: '#/components/schemas/EmployeeUpdateRequest'
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *       404:
 *         description: Employee not found
 *       409:
 *         description: Duplicate email or unique constraint violation
 *       422:
 *         description: Validation error
 *   delete:
 *     tags: [Admin Employees]
 *     summary: Delete employee
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
 *         description: Employee deleted successfully
 *       404:
 *         description: Employee not found
 */
