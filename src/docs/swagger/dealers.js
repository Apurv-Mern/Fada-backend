/**
 * @swagger
 * tags:
 *   - name: Dealer Profile
 *     description: Dealer profile management (authenticated dealer)
 *   - name: Dealer Contact Persons
 *     description: Dealer key contact person management
 */

/**
 * @swagger
 * /dealers/user/profile:
 *   get:
 *     tags: [Dealer Profile]
 *     summary: Get dealer profile
 *     description: Returns dealer account info, profile details, registered location, and outlet/employee counts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DealerProfileResponse'
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags: [Dealer Profile]
 *     summary: Update dealer profile
 *     description: Updates dealer account fields and upserts dealer profile record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DealerProfileUpdateRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /dealers/user/group-dealers:
 *   get:
 *     tags: [Dealer Profile]
 *     summary: List child dealers in group holding
 *     description: Returns active dealers where parentDealerId is the authenticated dealer (id, name, dealerCode).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Group dealers fetched successfully
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
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           dealerCode:
 *                             type: string
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /dealers/contact-persons:
 *   get:
 *     tags: [Dealer Contact Persons]
 *     summary: Get contact persons
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contact persons fetched successfully
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
 *                         $ref: '#/components/schemas/KeyContact'
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags: [Dealer Contact Persons]
 *     summary: Create contact person
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/KeyContactCreateRequest'
 *     responses:
 *       200:
 *         description: Contact person created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /dealers/contact-persons/{id}:
 *   put:
 *     tags: [Dealer Contact Persons]
 *     summary: Update contact person
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
 *             $ref: '#/components/schemas/KeyContactUpdateRequest'
 *     responses:
 *       200:
 *         description: Contact person updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *   delete:
 *     tags: [Dealer Contact Persons]
 *     summary: Delete contact person
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
 *         description: Contact person deleted successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * tags:
 *   - name: Dealer Outlets
 *     description: Dealer outlet management (scoped to authenticated dealer)
 */

/**
 * @swagger
 * /dealers/outlets:
 *   get:
 *     tags: [Dealer Outlets]
 *     summary: Get dealer outlets
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
 *         description: Outlets fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         outlets:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/DealerOutletItem'
 *                         pagination:
 *                           type: object
 *   post:
 *     tags: [Dealer Outlets]
 *     summary: Create outlet
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DealerOutletCreateRequest'
 *           example:
 *             name: Sanganer
 *             code: OUT-02541
 *             brandId: 1
 *             manager: Shambhu
 *             pinCode: "303908"
 *             city: Jaipur
 *             state: Rajasthan
 *             address: "jaipur, kotkhawada"
 *             functions: ["sales", "service"]
 *             isActive: true
 *     responses:
 *       200:
 *         description: Outlet created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DealerOutletItem'
 */

/**
 * @swagger
 * /dealers/outlets/options:
 *   get:
 *     tags: [Dealer Outlets]
 *     summary: Get active outlet options
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Outlet options fetched successfully
 */

/**
 * @swagger
 * /dealers/outlets/{id}:
 *   get:
 *     tags: [Dealer Outlets]
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
 *   put:
 *     tags: [Dealer Outlets]
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
 *             $ref: '#/components/schemas/DealerOutletCreateRequest'
 *     responses:
 *       200:
 *         description: Outlet updated successfully
 *   delete:
 *     tags: [Dealer Outlets]
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
 */

/**
 * @swagger
 * tags:
 *   - name: Dealer Employees
 *     description: Dealer employee management (scoped to authenticated dealer)
 */

/**
 * @swagger
 * /dealers/employees:
 *   get:
 *     tags: [Dealer Employees]
 *     summary: Get dealer employees
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: outletId
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
 *         description: Employees fetched successfully
 *   post:
 *     tags: [Dealer Employees]
 *     summary: Create employee
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DealerEmployeeCreateRequest'
 *     responses:
 *       200:
 *         description: Employee created successfully
 */

/**
 * @swagger
 * /dealers/employees/{id}:
 *   get:
 *     tags: [Dealer Employees]
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
 *   put:
 *     tags: [Dealer Employees]
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
 *             $ref: '#/components/schemas/DealerEmployeeCreateRequest'
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *   delete:
 *     tags: [Dealer Employees]
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
 */

/**
 * @swagger
 * /dealers/employees/{id}/documents:
 *   get:
 *     tags: [Dealer Employees]
 *     summary: Get employee document checklist with uploads
 *     description: Lists active document types for employees with this employee's upload rows (if any). Employee must be assigned to the authenticated dealer.
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
 *       404:
 *         description: Employee not found for this dealer
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /dealers/employees/{id}/approve-documents/{documentId}:
 *   put:
 *     tags: [Dealer Employees]
 *     summary: Approve an employee document upload
 *     description: Approves the employee's upload for the given master document type (documentId). Recomputes employee isKycCompleted when all required document types are approved.
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
 *         description: Employee document approved successfully
 *       404:
 *         description: Employee or document upload not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * tags:
 *   - name: Dealer Employer Invitations
 *     description: Pending employment invitations between employees and dealers
 */

/**
 * @swagger
 * /dealers/employer-invitations:
 *   get:
 *     tags: [Dealer Employer Invitations]
 *     summary: List pending employer invitations for dealer
 *     description: Returns pending EmployeeAssignment rows for the authenticated dealer, including employee summary. Includes invitations sent by the dealer or initiated by employees.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employer invitations fetched successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /dealers/employer-invitations/send:
 *   post:
 *     tags: [Dealer Employer Invitations]
 *     summary: Send employment invitation to an employee
 *     description: Creates a pending EmployeeAssignment with invitationSendBy dealer and logs send_invitation in EmployeeEmployerStatus. Fails if employee is already working at the dealer or already has a pending invite.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DealerEmployerInvitationSendRequest'
 *     responses:
 *       200:
 *         description: Employer invitation sent successfully
 *       400:
 *         description: Employee already working or already invited
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /dealers/employer-invitations/{id}:
 *   get:
 *     tags: [Dealer Employer Invitations]
 *     summary: Get employer invitation by assignment id
 *     description: Returns invitation with employee details and EmployeeEmployerStatus history.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: EmployeeAssignment id
 *     responses:
 *       200:
 *         description: Employer invitation fetched successfully
 *       404:
 *         description: Invitation not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /dealers/employer-invitations/steps:
 *   get:
 *     tags: [Dealer Employer Invitations]
 *     summary: Get employer invitation joining workflow steps
 *     description: Returns the ordered list of joining workflow steps shown during the employer invitation process.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employer invitation steps fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EmployerInvitationStepItem'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /dealers/employer-invitations/{id}/status/{status}:
 *   patch:
 *     tags: [Dealer Employer Invitations]
 *     summary: Accept or reject employer invitation
 *     description: Updates assignment status to verified (accept) or rejected (reject) and appends EmployeeEmployerStatus history with status accepted or rejected.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: EmployeeAssignment id
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [accept, reject]
 *     responses:
 *       200:
 *         description: Invitation accepted or rejected successfully
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags: [Dealer Employer Invitations]
 *     summary: Advance employer invitation joining workflow status
 *     description: Appends a new EmployeeEmployerStatus record for the given joining workflow step. Fails if that status was already recorded for the assignment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: EmployeeAssignment id
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [send_invitation, accept_invitation, share_details, employer_verification, joining_confirmed]
 *         description: Joining workflow step slug
 *     responses:
 *       200:
 *         description: Employer invitation status updated successfully
 *       400:
 *         description: Invalid status or status already updated
 *       404:
 *         description: Invitation not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * tags:
 *   - name: Dealer Business Documents
 *     description: Dealer business document uploads
 */

/**
 * @swagger
 * /dealers/business-documents:
 *   get:
 *     tags: [Dealer Business Documents]
 *     summary: Get business documents with upload status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Business documents fetched successfully
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
 *                         $ref: '#/components/schemas/DealerBusinessDocumentItem'
 *   post:
 *     tags: [Dealer Business Documents]
 *     summary: Upload business document
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DealerBusinessDocumentUploadRequest'
 *     responses:
 *       200:
 *         description: Business document uploaded successfully
 *       409:
 *         description: Document already uploaded for this type
 */

/**
 * @swagger
 * /dealers/business-documents/{id}:
 *   delete:
 *     tags: [Dealer Business Documents]
 *     summary: Delete uploaded business document
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: DealerDocument id
 *     responses:
 *       200:
 *         description: Business document deleted successfully
 *       404:
 *         description: Business document not found
 */
