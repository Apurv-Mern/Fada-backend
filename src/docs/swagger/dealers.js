/**
 * @swagger
 * tags:
 *   - name: Dealer Profile
 *     description: >
 *       Dealer profile management. Business data is scoped to req.currentDealerId —
 *       the authenticated dealer, or a child dealer when X-Dealer-Id is provided.
 *   - name: Dealer Contact Persons
 *     description: Dealer key contact person management (scoped by optional X-Dealer-Id)
 */

/**
 * @swagger
 * /dealers/user/profile:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   get:
 *     tags: [Dealer Profile]
 *     summary: Get dealer profile
 *     description: >
 *       Returns dealer account info, profile details, registered location, and outlet/employee counts
 *       for the active dealer context (Bearer dealer, or child specified by X-Dealer-Id).
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
 *       403:
 *         description: X-Dealer-Id is not a child of the authenticated dealer
 *   put:
 *     tags: [Dealer Profile]
 *     summary: Update dealer profile
 *     description: >
 *       Updates dealer account fields and upserts dealer profile record for the active dealer context.
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
 *         description: Validation error or invalid X-Dealer-Id
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: X-Dealer-Id is not a child of the authenticated dealer
 */

/**
 * @swagger
 * /dealers/user/upload-profile-picture:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   put:
 *     tags: [Dealer Profile]
 *     summary: Update dealer profile picture
 *     description: Sets profilePicture from a pre-uploaded file URL (use POST /file-upload first).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DealerProfilePictureUpdateRequest'
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: X-Dealer-Id is not a child of the authenticated dealer
 */

/**
 * @swagger
 * /dealers/user/group-dealers:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   get:
 *     tags: [Dealer Profile]
 *     summary: List child dealers in group holding
 *     description: >
 *       Returns active dealers where parentDealerId matches the active dealer context
 *       (authenticated dealer, or child from X-Dealer-Id). Use without X-Dealer-Id (or with
 *       the main dealer id) to list direct children for the group switcher.
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
 *       403:
 *         description: X-Dealer-Id is not a child of the authenticated dealer
 */

/**
 * @swagger
 * /dealers/contact-persons:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
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
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
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
 *     description: Dealer outlet management (scoped to active dealer via Bearer + optional X-Dealer-Id)
 */

/**
 * @swagger
 * /dealers/outlets:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
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
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
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
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
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
 *     description: Dealer employee management (scoped to active dealer via Bearer + optional X-Dealer-Id)
 */

/**
 * @swagger
 * /dealers/employees:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
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
 *     description: >
 *       Creates employee under the active dealer with EmployeeAssignment including
 *       outlet, departmentId, and designationId. Top-level designation object is deprecated.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DealerEmployeeCreateRequest'
 *           example:
 *             name: Shambhu Meena
 *             email: shambhu@company.com
 *             phone: "9876543210"
 *             assignment:
 *               outletId: 3
 *               departmentId: 5
 *               designationId: 12
 *     responses:
 *       200:
 *         description: Employee created successfully
 */

/**
 * @swagger
 * /dealers/employees/joining:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   get:
 *     tags: [Dealer Employees]
 *     summary: Search employees for joining / invitation
 *     description: >
 *       Lookup employees by FADA ID for the joining/invitation flow.
 *       Returns basic profile fields (id, fadaId, name, email, phone).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: Partial or full FADA ID to search (e.g. fada-df-12345)
 *         example: fada-df-12345
 *     responses:
 *       200:
 *         description: Employees fetched successfully
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
 *                           fadaId:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phone:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: X-Dealer-Id is not a child of the authenticated dealer
 */

/**
 * @swagger
 * /dealers/employees/profile/{id}:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   get:
 *     tags: [Dealer Employees]
 *     summary: Get full employee profile by id
 *     description: >
 *       Returns the employee with addresses, documents (approval/verification status),
 *       appreciations, certificates, promotions, trainings, skills, and work experiences
 *       (assignments with dealership, branch, department, and designation).
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
 *         description: Employee profile fetched successfully
 *       404:
 *         description: Employee not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /dealers/employees/{id}:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
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
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
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
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
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
 *     description: >
 *       Pending employment invitations between employees and dealers
 *       (scoped to active dealer via Bearer + optional X-Dealer-Id)
 */

/**
 * @swagger
 * /dealers/employer-invitations:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
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
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   post:
 *     tags: [Dealer Employer Invitations]
 *     summary: Send employment invitation to an employee
 *     description: >
 *       Creates a pending EmployeeAssignment for the active dealer with outletId,
 *       departmentId, and designationId. Sets invitationSendBy=dealer and logs
 *       send_invitation in EmployeeEmployerStatus (slug=joining).
 *       Fails if the employee is currently working at any company.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DealerEmployerInvitationSendRequest'
 *           example:
 *             employeeId: 12
 *             outletId: 3
 *             departmentId: 5
 *             designationId: 12
 *     responses:
 *       200:
 *         description: Employer invitation sent successfully
 *       400:
 *         description: Employee already working in any other company
 *       422:
 *         description: Validation error (missing employeeId, outletId, departmentId, or designationId)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: X-Dealer-Id is not a child of the authenticated dealer
 */

/**
 * @swagger
 * /dealers/employer-invitations/{id}:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
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
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
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
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
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
 *     description: >
 *       Appends a new EmployeeEmployerStatus record (slug=joining) for the given workflow step.
 *       Fails if that status was already recorded for the assignment. Optionally accepts
 *       joiningDate in the body to set Employee.joinedDate and EmployeeAssignment.startDate.
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
 *           enum:
 *             - send_invitation
 *             - accept_invitation
 *             - reject_invitation
 *             - share_details
 *             - employer_verification
 *             - joining_confirmed
 *             - transfered
 *         description: Joining workflow status key
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DealerEmployerInvitationStatusUpdateRequest'
 *     responses:
 *       200:
 *         description: Employer invitation status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       description: Updated EmployeeAssignment record
 *       400:
 *         description: Invalid status or status already updated
 *       404:
 *         description: Invitation not found
 *       422:
 *         description: Validation error (e.g. invalid joiningDate format)
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * tags:
 *   - name: Dealer Business Documents
 *     description: Dealer business document uploads (scoped to active dealer via Bearer + optional X-Dealer-Id)
 */

/**
 * @swagger
 * /dealers/business-documents:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
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
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
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

/**
 * @swagger
 * tags:
 *   - name: Dealer Employer Leaving
 *     description: >
 *       Employee exit / resignation requests for the active dealer context
 *       (Bearer + optional X-Dealer-Id)
 */

/**
 * @swagger
 * /dealers/employer-leaving:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   get:
 *     tags: [Dealer Employer Leaving]
 *     summary: List employer leaving requests
 *     description: Returns EmployeeLeaveEmployeement rows for the active dealer, including employee and branch summary.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employer leaving requests fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: X-Dealer-Id is not a child of the authenticated dealer
 */

/**
 * @swagger
 * /dealers/employer-leaving/steps:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   get:
 *     tags: [Dealer Employer Leaving]
 *     summary: Get employer leaving workflow steps
 *     description: Returns the ordered exit workflow steps shown during the leaving process.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employer leaving steps fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /dealers/employer-leaving/{id}:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   get:
 *     tags: [Dealer Employer Leaving]
 *     summary: Get employer leaving request by id
 *     description: Returns leaving request with employee, dealership, branch, and leaving status history.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: EmployeeLeaveEmployeement id
 *     responses:
 *       200:
 *         description: Employer leaving request fetched successfully
 *       404:
 *         description: Leaving request not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /dealers/employer-leaving/{id}/status/{status}:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   patch:
 *     tags: [Dealer Employer Leaving]
 *     summary: Accept or reject resignation / leaving request
 *     description: >
 *       Sets leave request status to accepted or rejected and appends accept_resignation or
 *       reject_resignation in EmployeeEmployerStatus (slug=leaving).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: EmployeeLeaveEmployeement id
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [accept, reject]
 *     responses:
 *       200:
 *         description: Leaving request accepted or rejected successfully
 *       400:
 *         description: Invalid status or request already processed
 *       404:
 *         description: Leaving request not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags: [Dealer Employer Leaving]
 *     summary: Advance employer leaving workflow status
 *     description: >
 *       Appends a workflow status after resignation is accepted.
 *       On exit_completed, sets leave request and EmployeeAssignment status to completed
 *       and marks the assignment as no longer working.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: EmployeeLeaveEmployeement id
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [handover_completed, clearance_completed, exit_completed]
 *         description: Exit workflow step
 *     responses:
 *       200:
 *         description: Employer leaving request status updated successfully
 *       400:
 *         description: Invalid status, not accepted yet, or status already updated
 *       404:
 *         description: Leaving request not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * tags:
 *   - name: Dealer Employeement Transfer
 *     description: >
 *       Transfer an employee to another outlet under the active dealer
 *       (Bearer + optional X-Dealer-Id). Department and designation are stored on EmployeeAssignment.
 */

/**
 * @swagger
 * /dealers/employeement-transfer:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   post:
 *     tags: [Dealer Employeement Transfer]
 *     summary: Transfer employee to another outlet
 *     description: >
 *       Ends the current assignment (isCurrentlyWorking=false) and creates a new pending
 *       EmployeeAssignment for the target outlet with departmentId and designationId.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DealerEmployeementTransferRequest'
 *           example:
 *             employeeId: 1
 *             outletId: 3
 *             departmentId: 5
 *             designationId: 12
 *     responses:
 *       200:
 *         description: Employeement transfer request sent successfully
 *       404:
 *         description: Employee or outlet not found
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: X-Dealer-Id is not a child of the authenticated dealer
 */
