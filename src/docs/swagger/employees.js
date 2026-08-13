/**
 * @swagger
 * tags:
 *   - name: Admin Employees
 *     description: Admin employee management, status, and document verification endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     EmployeeDesignationInput:
 *       type: object
 *       deprecated: true
 *       description: Deprecated. Prefer departmentId/designationId on assignment. Still accepted and merged into EmployeeAssignment.
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
 *         departmentId:
 *           type: integer
 *           nullable: true
 *           description: OrganizationStructure id where flag=department
 *         designationId:
 *           type: integer
 *           nullable: true
 *           description: OrganizationStructure id where flag=role (must belong to departmentId)
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
 *           description: >
 *             Dealership assignment. Include departmentId and designationId here.
 *             Response returns them under assignment.department / assignment.designation
 *             (top-level employee.designation is removed).
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
 *         description: Filter by EmployeeAssignment.departmentId
 *       - in: query
 *         name: outletId
 *         schema:
 *           type: integer
 *         description: Filter by EmployeeAssignment.outletId
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
 *     description: >
 *       Creates employee with auto-generated FADA ID and a single EmployeeAssignment
 *       (dealer, outlet, department, designation). Department/role are stored on assignment,
 *       not a separate EmployeeDesignation table.
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
 *             assignment:
 *               dealerId: 1
 *               outletId: 3
 *               departmentId: 5
 *               designationId: 12
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

/**
 * @swagger
 * /admin/employees/{id}/active-inactive:
 *   put:
 *     tags: [Admin Employees]
 *     summary: Toggle employee active status
 *     description: Flips the employee isActive flag (active → inactive or vice versa)
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
 *         description: Employee active status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *       404:
 *         description: Employee not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/employees/{id}/documents:
 *   get:
 *     tags: [Admin Employees]
 *     summary: Get employee documents
 *     description: >
 *       Returns active document types that apply to employees (appliesTo employee or both)
 *       and include this employee's uploaded EmployeeDocument rows.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee id
 *     responses:
 *       200:
 *         description: Employee documents fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/DocumentTypeMasterItem'
 *                           - type: object
 *                             properties:
 *                               employeeDocuments:
 *                                 type: array
 *                                 items:
 *                                   $ref: '#/components/schemas/AdminEmployeeDocumentItem'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/employees/{id}/documents/{documentId}/status:
 *   put:
 *     tags: [Admin Employees]
 *     summary: Approve or reject an employee document upload
 *     description: >
 *       Updates the employee upload for the given master document type (documentId).
 *       Sets isApproved, isVerified, approvedBy, approvedAt, status, and reason.
 *       Reason is required when status is rejected.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee id
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Master Document id (document type), not EmployeeDocument row id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminEmployeeDocumentStatusRequest'
 *           examples:
 *             approved:
 *               summary: Approve document
 *               value:
 *                 status: approved
 *             rejected:
 *               summary: Reject document with reason
 *               value:
 *                 status: rejected
 *                 reason: Document image is unclear
 *     responses:
 *       200:
 *         description: Employee document approved or rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *       422:
 *         description: Validation error (invalid status or missing reason on reject)
 *       404:
 *         description: Employee document not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/employees/{id}/documents/{documentId}:
 *   delete:
 *     tags: [Admin Employees]
 *     summary: Delete an employee document upload
 *     description: Soft-deletes the employee's upload for the given master document type (documentId).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee id
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Master Document id (document type), not EmployeeDocument row id
 *     responses:
 *       200:
 *         description: Employee document deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *       404:
 *         description: Employee document not found
 *       401:
 *         description: Unauthorized
 */
