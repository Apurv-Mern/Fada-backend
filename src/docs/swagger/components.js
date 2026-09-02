/**
 * @swagger
 * components:
 *   parameters:
 *     XDealerId:
 *       in: header
 *       name: X-Dealer-Id
 *       required: false
 *       schema:
 *         type: integer
 *       description: >
 *         Optional active dealer context for group-holding accounts.
 *         Omit or send the logged-in dealer id to act as self.
 *         Send a child dealer id (parentDealerId must equal the authenticated dealer)
 *         to scope business data to that sub-dealer. Invalid or unauthorized ids return 400/403.
 *     EmployeeDealerIdQuery:
 *       in: query
 *       name: dealerId
 *       required: false
 *       schema:
 *         type: integer
 *       description: >
 *         Optional dealer scope for profile records. When omitted, uses the employee's current
 *         employment dealer if available; otherwise returns records across all employments.
 *   schemas:
 *     ApiSuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           nullable: true
 *     ReportResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiSuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 meta:
 *                   type: object
 *                   properties:
 *                     reportKey:
 *                       type: string
 *                     reportName:
 *                       type: string
 *                     portal:
 *                       type: string
 *                       enum: [admin, dealer]
 *                     period:
 *                       type: object
 *                       nullable: true
 *                     filtersApplied:
 *                       type: object
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *                     generatedBy:
 *                       type: object
 *                       nullable: true
 *                 summary:
 *                   type: object
 *                 rows:
 *                   type: array
 *                   items:
 *                     type: object
 *                 breakdowns:
 *                   type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *     ReportDealerMasterRow:
 *       type: object
 *       properties:
 *         dealerId:
 *           type: integer
 *         dealerCode:
 *           type: string
 *         dealerName:
 *           type: string
 *         dealerType:
 *           type: string
 *           nullable: true
 *         oemBrand:
 *           type: string
 *           description: Comma-separated brand names resolved from dealer brand IDs
 *         state:
 *           type: string
 *           nullable: true
 *         city:
 *           type: string
 *           nullable: true
 *         address:
 *           type: string
 *           nullable: true
 *         registrationDate:
 *           type: string
 *           format: date-time
 *         dealerStatus:
 *           type: string
 *           enum: [temporary, pending, approved, rejected]
 *         isActive:
 *           type: boolean
 *         totalEmployees:
 *           type: integer
 *         fadaIdsCreated:
 *           type: integer
 *         verifiedEmployees:
 *           type: integer
 *         activeEmployees:
 *           type: integer
 *         lastActivityAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     ReportEmployeeMasterRow:
 *       type: object
 *       properties:
 *         employeeId:
 *           type: integer
 *         dealerId:
 *           type: integer
 *         fadaId:
 *           type: string
 *           nullable: true
 *         name:
 *           type: string
 *         employeeCode:
 *           type: string
 *           nullable: true
 *         phone:
 *           type: string
 *           nullable: true
 *         email:
 *           type: string
 *           nullable: true
 *         department:
 *           type: string
 *           nullable: true
 *         designation:
 *           type: string
 *           nullable: true
 *         joiningDate:
 *           type: string
 *           format: date
 *           nullable: true
 *         employmentStatus:
 *           type: string
 *         fadaIdStatus:
 *           type: string
 *         profileCompletion:
 *           type: object
 *         verificationStatus:
 *           type: string
 *         membershipStatus:
 *           type: string
 *         lastProfileUpdate:
 *           type: string
 *           format: date-time
 *     ApiErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *         error:
 *           type: string
 *           nullable: true
 *     AuthTokenResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         accessToken:
 *           type: string
 *     AdminUser:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *           nullable: true
 *         profilePicture:
 *           type: string
 *           nullable: true
 *         roleId:
 *           type: integer
 *         role:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             key:
 *               type: string
 *             name:
 *               type: string
 *             isSuperRole:
 *               type: boolean
 *         isActive:
 *           type: boolean
 *         isEditable:
 *           type: boolean
 *         isDeletable:
 *           type: boolean
 *         mustChangePassword:
 *           type: boolean
 *           description: True when admin must change password after forgot-password flow
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     AdminProfileUpdateRequest:
 *       type: object
 *       required: [name, email, phone]
 *       properties:
 *         name:
 *           type: string
 *           example: Super Admin
 *         email:
 *           type: string
 *           format: email
 *           example: superadmin@gmail.com
 *         phone:
 *           type: string
 *           example: "9876543210"
 *         profilePicture:
 *           type: string
 *           format: binary
 *           description: Optional profile picture file upload
 *     AdminLoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Login successful
 *         accessToken:
 *           type: string
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *         admin:
 *           $ref: '#/components/schemas/AdminUser'
 *     AdminChangePasswordRequest:
 *       type: object
 *       required: [currentPassword, newPassword, confirmPassword]
 *       properties:
 *         currentPassword:
 *           type: string
 *         newPassword:
 *           type: string
 *           minLength: 6
 *         confirmPassword:
 *           type: string
 *     ChangePasswordRequest:
 *       allOf:
 *         - $ref: '#/components/schemas/AdminChangePasswordRequest'
 *     AdminForgotPasswordRequest:
 *       type: object
 *       required: [email]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *     EmployeeStatsResponse:
 *       type: object
 *       properties:
 *         allEmployees:
 *           type: integer
 *         approvedEmployees:
 *           type: integer
 *         pendingEmployees:
 *           type: integer
 *         rejectedEmployees:
 *           type: integer
 *         temporaryEmployees:
 *           type: integer
 *         activeEmployees:
 *           type: integer
 *         inactiveEmployees:
 *           type: integer
 *     DealerStatsResponse:
 *       type: object
 *       properties:
 *         totalDealers:
 *           type: integer
 *         totalTemporaryDealers:
 *           type: integer
 *         totalApprovedDealers:
 *           type: integer
 *         totalRejectedDealers:
 *           type: integer
 *         totalPendingDealers:
 *           type: integer
 *         totalActiveDealers:
 *           type: integer
 *         totalInactiveDealers:
 *           type: integer
 *     DashboardStatsResponse:
 *       type: object
 *       properties:
 *         dealer:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             active:
 *               type: integer
 *             inactive:
 *               type: integer
 *             pending:
 *               type: integer
 *         outlet:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             active:
 *               type: integer
 *             inactive:
 *               type: integer
 *         employee:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             active:
 *               type: integer
 *             inactive:
 *               type: integer
 *             pending:
 *               type: integer
 *         recentDealers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RecentDealerSummary'
 *     DealerDashboardStatItem:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *         changeThisWeek:
 *           type: integer
 *           description: Net change during the current calendar week
 *     DealerDashboardEmployeesByOutletItem:
 *       type: object
 *       properties:
 *         outletId:
 *           type: integer
 *         outletName:
 *           type: string
 *         outletCode:
 *           type: string
 *         employeeCount:
 *           type: integer
 *     DealerDashboardRecentRequestItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         type:
 *           type: string
 *           enum: [join, exit, transfer]
 *         employeeId:
 *           type: integer
 *           nullable: true
 *         employeeName:
 *           type: string
 *           nullable: true
 *         fadaId:
 *           type: string
 *           nullable: true
 *         status:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     DealerDashboardResponse:
 *       type: object
 *       properties:
 *         dateRange:
 *           type: object
 *           properties:
 *             startDate:
 *               type: string
 *               format: date
 *             endDate:
 *               type: string
 *               format: date
 *         employeeStats:
 *           type: object
 *           properties:
 *             total:
 *               $ref: '#/components/schemas/DealerDashboardStatItem'
 *             active:
 *               $ref: '#/components/schemas/DealerDashboardStatItem'
 *             newJoins:
 *               $ref: '#/components/schemas/DealerDashboardStatItem'
 *             exits:
 *               $ref: '#/components/schemas/DealerDashboardStatItem'
 *         employeesByOutlet:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DealerDashboardEmployeesByOutletItem'
 *         pendingRequests:
 *           type: object
 *           properties:
 *             join:
 *               type: integer
 *             exit:
 *               type: integer
 *             transfer:
 *               type: integer
 *         fadaScoreSummary:
 *           type: object
 *           properties:
 *             statusLabel:
 *               type: string
 *               example: Needs Work
 *             statusColor:
 *               type: string
 *               example: "#EF4444"
 *             top25Percent:
 *               type: integer
 *               description: Percentage of dealer employees in the global top 25% by score
 *             averageScore:
 *               type: integer
 *               nullable: true
 *             employeeCount:
 *               type: integer
 *         recentEmploymentRequests:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DealerDashboardRecentRequestItem'
 *     RecentDealerSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         dealerCode:
 *           type: string
 *           nullable: true
 *           description: Optional legacy manual code
 *         dealerId:
 *           type: string
 *           example: DL58372
 *           description: System-generated public FADA dealer code (DL + 5 digits)
 *         status:
 *           type: string
 *           enum: [temporary, pending, approved, rejected]
 *         isActive:
 *           type: boolean
 *     DealerPublicCode:
 *       type: string
 *       pattern: '^DL[1-9][0-9]{4}$'
 *       example: DL58372
 *       description: System-generated public dealer code
 *     OutletPublicCode:
 *       type: string
 *       pattern: '^OT[1-9][0-9]{5}$'
 *       example: OT583721
 *       description: System-generated public outlet code
 *     AdminDealerUpsertRequest:
 *       type: object
 *       required: [name, email, phone, brands, location]
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         dealerCode:
 *           type: string
 *           nullable: true
 *           description: Optional legacy/manual dealer code. Public FADA code is auto-assigned to dealerId on create.
 *         brands:
 *           type: array
 *           description: Array of brand master IDs (multiselect)
 *           items:
 *             type: integer
 *           example: [1, 2]
 *         isGroupHoldingEntity:
 *           type: boolean
 *           default: false
 *         parentCompanyId:
 *           type: integer
 *           nullable: true
 *           description: Parent group-holding dealer ID
 *         location:
 *           type: object
 *           required: [address, city, state, country, pinCode, gstNumber]
 *           properties:
 *             address:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             country:
 *               type: string
 *             pinCode:
 *               type: string
 *             gstNumber:
 *               type: string
 *               minLength: 15
 *               maxLength: 15
 *     GroupHoldingDealerItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         dealerCode:
 *           type: string
 *         brands:
 *           type: array
 *           items:
 *             type: integer
 *     EmployeeUser:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         fadaId:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *           example: "9876543210"
 *         bloodGroup:
 *           type: string
 *           enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *         dob:
 *           type: string
 *           format: date
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *         role:
 *           type: string
 *           example: employee
 *         status:
 *           type: string
 *           enum: [temporary, pending, approved, rejected]
 *     EmployeeRegisterRequest:
 *       type: object
 *       required: [name, email, phone]
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *           minLength: 10
 *           maxLength: 10
 *           pattern: "^[0-9]+$"
 *           example: "9876543210"
 *     EmployeeVerifyRegistrationOtpRequest:
 *       type: object
 *       required: [email, emailOTP, phone, otp]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         emailOTP:
 *           type: string
 *           minLength: 6
 *           maxLength: 6
 *           description: OTP sent to email
 *         phone:
 *           type: string
 *           minLength: 10
 *           maxLength: 10
 *           example: "9876543210"
 *         otp:
 *           type: string
 *           minLength: 6
 *           maxLength: 6
 *           description: OTP sent via SMS to phone
 *     EmployeeLoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *     EmployeeSendLoginOtpRequest:
 *       type: object
 *       required: [username]
 *       properties:
 *         username:
 *           type: string
 *           description: Employee email or 10-digit phone number
 *           example: employee@example.com
 *     EmployeeVerifyLoginOtpRequest:
 *       type: object
 *       required: [username, otp]
 *       properties:
 *         username:
 *           type: string
 *           description: Same email or phone used in send-login-otp
 *         otp:
 *           type: string
 *           minLength: 6
 *           maxLength: 6
 *     EmployeeForgotPasswordRequest:
 *       type: object
 *       required: [username]
 *       properties:
 *         username:
 *           type: string
 *           description: Employee email or 10-digit phone number
 *     EmployeeVerifyForgotPasswordOtpRequest:
 *       type: object
 *       required: [username, otp]
 *       properties:
 *         username:
 *           type: string
 *         otp:
 *           type: string
 *           minLength: 6
 *           maxLength: 6
 *     EmployeeResetPasswordRequest:
 *       type: object
 *       required: [password, confirmPassword]
 *       properties:
 *         password:
 *           type: string
 *           minLength: 6
 *         confirmPassword:
 *           type: string
 *           minLength: 6
 *     EmployeeAddressInput:
 *       type: object
 *       required: [addressLine1, city, state, pincode]
 *       properties:
 *         addressLine1:
 *           type: string
 *         addressLine2:
 *           type: string
 *         city:
 *           type: string
 *         state:
 *           type: string
 *         country:
 *           type: string
 *         pincode:
 *           type: string
 *     EmployeeAddress:
 *       allOf:
 *         - $ref: '#/components/schemas/EmployeeAddressInput'
 *         - type: object
 *           properties:
 *             id:
 *               type: integer
 *             employeeId:
 *               type: integer
 *             isActive:
 *               type: boolean
 *     EmployeePersonalDetailsUpdateRequest:
 *       type: object
 *       required: [name, bloodGroup, dob, gender, address, qualification]
 *       properties:
 *         name:
 *           type: string
 *         bloodGroup:
 *           type: string
 *           enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *         dob:
 *           type: string
 *           format: date
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *         qualification:
 *           type: string
 *           example: B.Tech
 *         address:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EmployeeAddressInput'
 *     EmployeeProfilePrivacyUpdateRequest:
 *       type: object
 *       required:
 *         - isProfilePrivate
 *       properties:
 *         isProfilePrivate:
 *           type: boolean
 *           description: "true = private (limit visibility); false = public"
 *     EmployeeProfileShareRequest:
 *       type: object
 *       required:
 *         - dealerId
 *       properties:
 *         dealerId:
 *           type: integer
 *           description: Organisation (dealer) id from dropdown e.g. Sundaram Motors
 *     EmployeeEmployerInvitationCreateRequest:
 *       type: object
 *       required:
 *         - dealerId
 *         - outletId
 *       properties:
 *         dealerId:
 *           type: integer
 *         outletId:
 *           type: integer
 *     EmployeeEmployerLeavingCreateRequest:
 *       type: object
 *       required:
 *         - reason
 *       properties:
 *         reason:
 *           type: string
 *           description: Reason for leaving the current employment
 *     EmployeeEmployerStatusItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         status:
 *           type: string
 *         slug:
 *           type: string
 *         actionUserBy:
 *           type: string
 *           enum: [admin, dealer, employee]
 *         actionUserId:
 *           type: integer
 *     DealerEmployerInvitationSendRequest:
 *       type: object
 *       required:
 *         - employeeId
 *         - outletId
 *         - departmentId
 *         - designationId
 *       properties:
 *         employeeId:
 *           type: integer
 *           description: Employee id to invite
 *           example: 12
 *         outletId:
 *           type: integer
 *           description: Target outlet under the active dealer
 *           example: 3
 *         departmentId:
 *           type: integer
 *           description: OrganizationStructure id where flag=department
 *           example: 5
 *         designationId:
 *           type: integer
 *           description: OrganizationStructure id where flag=role (must belong to departmentId)
 *           example: 12
 *     DealerEmployerInvitationStatusUpdateRequest:
 *       type: object
 *       properties:
 *         joiningDate:
 *           type: string
 *           format: date
 *           description: >
 *             Optional employee joining date. When provided, updates Employee.joinedDate
 *             and EmployeeAssignment.startDate for the invitation.
 *           example: "2026-08-25"
 *     EmployerInvitationStepItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         status:
 *           type: string
 *           enum: [send_invitation, accept_invitation, share_details, employer_verification, joining_confirmed]
 *         title:
 *           type: string
 *           example: Invitation Received
 *         description:
 *           type: string
 *           example: You have an invitation from
 *     EmployeeEmergencyContactUpsertRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: Priya Kumar
 *         phone:
 *           type: string
 *           example: "+91 9000000000"
 *         relation:
 *           type: string
 *           example: Spouse
 *         isActive:
 *           type: boolean
 *           default: true
 *     EmployeeEmergencyContact:
 *       allOf:
 *         - $ref: '#/components/schemas/EmployeeEmergencyContactUpsertRequest'
 *         - type: object
 *           properties:
 *             id:
 *               type: integer
 *             employeeId:
 *               type: integer
 *     EmployeeDocumentUploadRequest:
 *       type: object
 *       required: [documentId, frontImage, backImage]
 *       properties:
 *         documentId:
 *           type: integer
 *         frontImage:
 *           type: string
 *           description: URL of front side image
 *         backImage:
 *           type: string
 *           description: URL of back side image
 *     EmployeeEmployeementCreateRequest:
 *       type: object
 *       required:
 *         - dealerId
 *         - outletId
 *         - designationId
 *         - city
 *         - employeementType
 *         - isCurrentlyWorking
 *         - startDate
 *         - highlights
 *       properties:
 *         dealerId:
 *           type: integer
 *         outletId:
 *           type: integer
 *         designationId:
 *           type: integer
 *         city:
 *           type: string
 *         employeementType:
 *           type: string
 *           example: full-time
 *         isCurrentlyWorking:
 *           type: boolean
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *           nullable: true
 *         highlights:
 *           type: string
 *     EmployeeCertificateUpsertRequest:
 *       type: object
 *       required:
 *         - certificateName
 *         - issuingAuthority
 *         - issueDate
 *         - certificateNumber
 *         - attachment
 *       properties:
 *         certificateName:
 *           type: string
 *           example: BYD EV Level 2 Certification
 *         issuingAuthority:
 *           type: string
 *           example: BYD India
 *         issueDate:
 *           type: string
 *           format: date
 *         certificateNumber:
 *           type: string
 *         description:
 *           type: string
 *         attachment:
 *           type: string
 *           description: URL or path to certificate PDF or image
 *     EmployeeSkillUpsertRequest:
 *       type: object
 *       required:
 *         - skillName
 *         - skillCategory
 *         - proficiencyLevel
 *       properties:
 *         skillName:
 *           type: string
 *           example: ADAS Calibration
 *         skillCategory:
 *           type: string
 *           example: Electronics
 *         proficiencyLevel:
 *           type: string
 *           example: Intermediate
 *         learningSource:
 *           type: string
 *           description: How the employee learned this skill
 *         skillDate:
 *           type: string
 *           format: date
 *         description:
 *           type: string
 *     EmployeeTrainingUpsertRequest:
 *       type: object
 *       required:
 *         - trainingTitle
 *       properties:
 *         trainingTitle:
 *           type: string
 *           example: EV Battery Safety Workshop
 *         trainingProvider:
 *           type: string
 *           example: FADA Academy
 *         completionDate:
 *           type: string
 *           format: date
 *         keyLearnings:
 *           type: string
 *         attachment:
 *           type: string
 *           description: URL or path to certificate or notes
 *     EmployeeAppreciationUpsertRequest:
 *       type: object
 *       required:
 *         - appreciationTitle
 *       properties:
 *         appreciationTitle:
 *           type: string
 *           example: Employee of the Month
 *         issuedBy:
 *           type: string
 *           example: BYD India
 *         appreciationDate:
 *           type: string
 *           format: date
 *         description:
 *           type: string
 *         quote:
 *           type: string
 *           description: Optional quote or citation
 *         attachment:
 *           type: string
 *           description: URL or path to photo or document
 *     EmployeePromotionUpsertRequest:
 *       type: object
 *       required:
 *         - roleTitle
 *       properties:
 *         roleTitle:
 *           type: string
 *           example: Senior Service Advisor
 *         issuedBy:
 *           type: string
 *           example: BYD India
 *         promotionDate:
 *           type: string
 *           format: date
 *         description:
 *           type: string
 *         attachment:
 *           type: string
 *           description: URL or path to photo or document
 *     EmployeeJourneyUpsertRequest:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *         subtitle:
 *           type: string
 *         journeyDate:
 *           type: string
 *           format: date
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *           description: URLs or paths for photos/documents
 *     EmployeeAssignmentStatus:
 *       type: string
 *       enum: [pending, rejected, verified, completed]
 *       description: EmployeeAssignment.status — completed is set when exit workflow finishes
 *     EmployeeLeaveEmployeementStatus:
 *       type: string
 *       enum: [pending, rejected, accepted, completed]
 *       description: EmployeeLeaveEmployeement.status — completed is set on exit_completed
 *     EmployeeJourneyItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         employeeId:
 *           type: integer
 *         dealerId:
 *           type: integer
 *           nullable: true
 *           description: Dealer scope from current employment when the journey entry was created
 *         title:
 *           type: string
 *         subtitle:
 *           type: string
 *           nullable: true
 *         journeyDate:
 *           type: string
 *           format: date
 *           nullable: true
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     AdminDealerImportItem:
 *       type: object
 *       required: [name, email, phone]
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         code:
 *           type: string
 *           nullable: true
 *           description: Optional legacy dealerCode. Public dealerId (DL#####) is auto-generated.
 *         isGroupHoldingCompany:
 *           type: boolean
 *           default: false
 *         parentCompanyCode:
 *           type: string
 *           nullable: true
 *           description: Parent dealer code when not a group holding entity
 *     AdminDealerImportRequest:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/AdminDealerImportItem'
 *     EmployeeLoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Login successful
 *         accessToken:
 *           type: string
 *         employee:
 *           $ref: '#/components/schemas/EmployeeUser'
 *     EmployeeOtpLoginResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiSuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 fadaId:
 *                   type: string
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 status:
 *                   type: string
 *                 role:
 *                   type: string
 *                   example: employee
 *     DealerUser:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         dealerCode:
 *           type: string
 *         dealerId:
 *           type: string
 *           example: DLR-AB-12345
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         role:
 *           type: string
 *           example: dealer
 *         status:
 *           type: string
 *           enum: [temporary, pending, approved, rejected]
 *         isEmailVerified:
 *           type: boolean
 *         isActive:
 *           type: boolean
 *         isGroupHoldingEntity:
 *           type: boolean
 *           description: True when this dealer is a group-holding parent that can switch into child dealers via X-Dealer-Id
 *         userType:
 *           type: string
 *           enum: [dealer, staff]
 *           default: dealer
 *         parentDealerId:
 *           type: integer
 *           nullable: true
 *           description: Parent group-holding dealer id when this dealer is a sub-dealer
 *         mustChangePassword:
 *           type: boolean
 *           description: True when dealer must change password (legacy temp-password flow)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     DealerLoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Login successful
 *         accessToken:
 *           type: string
 *         dealer:
 *           $ref: '#/components/schemas/DealerUser'
 *     DealerEmailVerificationPendingResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiSuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                 isEmailVerified:
 *                   type: boolean
 *                   example: false
 *                 isActive:
 *                   type: boolean
 *                   example: false
 *     DealerForgotPasswordRequest:
 *       type: object
 *       required: [email]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: dealer@example.com
 *     DealerVerifyForgotPasswordOtpRequest:
 *       type: object
 *       required: [email, otp]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: dealer@example.com
 *         otp:
 *           type: string
 *           minLength: 6
 *           maxLength: 6
 *           example: "123456"
 *     DealerVerifyForgotPasswordOtpResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: OTP verified successfully
 *         resetToken:
 *           type: string
 *           description: Short-lived JWT (15 min) with purpose password-reset
 *         data:
 *           type: object
 *           nullable: true
 *           example: null
 *     DealerResetPasswordRequest:
 *       type: object
 *       required: [resetToken, newPassword, confirmPassword]
 *       properties:
 *         resetToken:
 *           type: string
 *           description: Token returned from forgot-password/verify-otp
 *         newPassword:
 *           type: string
 *           minLength: 6
 *           example: newSecurePassword123
 *         confirmPassword:
 *           type: string
 *           minLength: 6
 *           example: newSecurePassword123
 *     DealerProfileDetails:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         typeOfDealership:
 *           type: string
 *           example: Authorised Dealer
 *         yearOfEstablishment:
 *           type: integer
 *           example: 2010
 *         panNumber:
 *           type: string
 *           example: AAKCS1234K
 *         fadaMembershipId:
 *           type: string
 *           example: FADA-MH-001245
 *         fadaMemberSince:
 *           type: string
 *           format: date
 *           example: "2012-01-15"
 *     DealerLocation:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         address:
 *           type: string
 *         city:
 *           type: string
 *         state:
 *           type: string
 *         pinCode:
 *           type: string
 *           example: "400058"
 *         country:
 *           type: string
 *           example: India
 *         gstNumber:
 *           type: string
 *           example: "29ABCDE1234F1Z5"
 *     DealerProfileResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         dealerCode:
 *           type: string
 *         dealerId:
 *           type: string
 *           example: DLR-AB-12345
 *           description: Auto-generated FADA dealer identifier
 *         profilePicture:
 *           type: string
 *           nullable: true
 *         brands:
 *           type: array
 *           items:
 *             type: integer
 *         status:
 *           type: string
 *           enum: [temporary, pending, approved, rejected]
 *         isActive:
 *           type: boolean
 *         totalOutlets:
 *           type: integer
 *         allEmployees:
 *           type: integer
 *         profile:
 *           $ref: '#/components/schemas/DealerProfileDetails'
 *         dealerLocations:
 *           $ref: '#/components/schemas/DealerLocation'
 *     DealerProfilePictureUpdateRequest:
 *       type: object
 *       required: [fileUrl]
 *       properties:
 *         fileUrl:
 *           type: string
 *           description: Public URL from POST /file-upload
 *     DealerProfileUpdateRequest:
 *       type: object
 *       required:
 *         - typeOfDealership
 *         - yearOfEstablishment
 *         - panNumber
 *         - fadaMembershipId
 *         - fadaMemberSince
 *         - name
 *         - phone
 *       properties:
 *         typeOfDealership:
 *           type: string
 *           example: Authorised Dealer
 *         yearOfEstablishment:
 *           type: string
 *           example: "2010"
 *         panNumber:
 *           type: string
 *           example: AAKCS1234K
 *         fadaMembershipId:
 *           type: string
 *           example: FADA-MH-001245
 *         fadaMemberSince:
 *           type: string
 *           format: date
 *           example: "2012-01-15"
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *     KeyContact:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         designation:
 *           type: string
 *         isActive:
 *           type: boolean
 *     KeyContactCreateRequest:
 *       type: object
 *       required: [name, email, phone, designation]
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         designation:
 *           type: string
 *     KeyContactUpdateRequest:
 *       type: object
 *       required: [name, email, phone, designation, isActive]
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         designation:
 *           type: string
 *         isActive:
 *           type: boolean
 *     AdminDealerDetailResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         dealerCode:
 *           type: string
 *         dealerId:
 *           type: string
 *           example: DLR-AB-12345
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         profilePicture:
 *           type: string
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [temporary, pending, approved, rejected]
 *         isActive:
 *           type: boolean
 *         isEmailVerified:
 *           type: boolean
 *         userType:
 *           type: string
 *           enum: [dealer, staff]
 *         registeredAt:
 *           type: string
 *           format: date-time
 *         lastUpdatedAt:
 *           type: string
 *           format: date-time
 *         businessProfile:
 *           $ref: '#/components/schemas/DealerProfileDetails'
 *         registeredAddress:
 *           type: object
 *           nullable: true
 *           properties:
 *             address:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             pinCode:
 *               type: string
 *             country:
 *               type: string
 *             gstNumber:
 *               type: string
 *             fullAddress:
 *               type: string
 *         primaryContact:
 *           type: object
 *           nullable: true
 *           properties:
 *             name:
 *               type: string
 *             designation:
 *               type: string
 *             phone:
 *               type: string
 *             email:
 *               type: string
 *         contacts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/KeyContact'
 *         documents:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DealerBusinessDocumentItem'
 *         summary:
 *           type: object
 *           properties:
 *             contactsCount:
 *               type: integer
 *             totalOutlets:
 *               type: integer
 *             allEmployees:
 *               type: integer
 *             documents:
 *               type: object
 *               properties:
 *                 totalRequired:
 *                   type: integer
 *                 totalUploaded:
 *                   type: integer
 *                 approved:
 *                   type: integer
 *                 pending:
 *                   type: integer
 *                 rejected:
 *                   type: integer
 *     DealerDocumentUpload:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         documentUrl:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         isVerified:
 *           type: boolean
 *         uploadedAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     DealerBusinessDocumentItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         category:
 *           type: string
 *         notes:
 *           type: string
 *         isMandatory:
 *           type: boolean
 *         isVerificationRequired:
 *           type: boolean
 *         isUploaded:
 *           type: boolean
 *         upload:
 *           $ref: '#/components/schemas/DealerDocumentUpload'
 *     DealerBusinessDocumentUploadRequest:
 *       type: object
 *       required: [documentId, documentUrl]
 *       properties:
 *         documentId:
 *           type: integer
 *         documentUrl:
 *           type: string
 *           example: http://localhost:3005/uploads/file.png
 *     MasterIdNameItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *     DocumentTypeMasterItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         category:
 *           type: string
 *         notes:
 *           type: string
 *         isMandatory:
 *           type: boolean
 *         isVerificationRequired:
 *           type: boolean
 *         appliesTo:
 *           type: string
 *           enum: [dealer, employee, both]
 *     AdminEmployeeDocumentItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         employeeId:
 *           type: integer
 *         documentId:
 *           type: integer
 *         frontImage:
 *           type: string
 *           nullable: true
 *         backImage:
 *           type: string
 *           nullable: true
 *         isApproved:
 *           type: boolean
 *         isVerified:
 *           type: boolean
 *         approvedBy:
 *           type: integer
 *           nullable: true
 *         approvedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         reason:
 *           type: string
 *           nullable: true
 *           description: Rejection or review reason
 *     AdminEmployeeDocumentStatusRequest:
 *       type: object
 *       required: [status]
 *       properties:
 *         status:
 *           type: string
 *           enum: [approved, rejected]
 *           description: Document review decision
 *         reason:
 *           type: string
 *           description: Required when status is rejected
 *           example: Document image is unclear
 *     OutletBrandSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *     AdminOutletImportItem:
 *       type: object
 *       required: [name, companyCode]
 *       properties:
 *         name:
 *           type: string
 *         companyCode:
 *           type: string
 *           description: Dealer dealerCode or public dealerId (DL#####)
 *         brandId:
 *           type: integer
 *           description: Preferred when known; otherwise brandName is resolved
 *         brandName:
 *           type: string
 *         manager:
 *           type: string
 *         pinCode:
 *           type: string
 *         city:
 *           type: string
 *         state:
 *           type: string
 *         address:
 *           type: string
 *         functions:
 *           type: array
 *           description: Outlet function slugs, names, or IDs (comma-separated string also accepted)
 *           items:
 *             oneOf:
 *               - type: string
 *               - type: integer
 *         isActive:
 *           type: boolean
 *           default: true
 *     AdminOutletImportRequest:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/AdminOutletImportItem'
 *     DealerOutletImportItem:
 *       type: object
 *       required: [name, brandName, outletFunctions]
 *       properties:
 *         name:
 *           type: string
 *         manager:
 *           type: string
 *         pincode:
 *           type: string
 *           description: 6-digit pin code (lowercase key in import payload)
 *         city:
 *           type: string
 *         state:
 *           type: string
 *         address:
 *           type: string
 *         brandName:
 *           type: string
 *           description: Brand master name (flag Brand)
 *         outletFunctions:
 *           type: array
 *           description: Outlet function names from master
 *           items:
 *             type: string
 *     DealerOutletImportRequest:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/DealerOutletImportItem'
 *     DealerOutletCreateRequest:
 *       type: object
 *       required: [name, brandId]
 *       description: Public outlet code (OT######) is auto-generated on create and cannot be changed later.
 *       properties:
 *         name:
 *           type: string
 *         manager:
 *           type: string
 *         pinCode:
 *           type: string
 *         city:
 *           type: string
 *         state:
 *           type: string
 *         address:
 *           type: string
 *         brandId:
 *           type: integer
 *           description: Primary brand for the outlet
 *         functions:
 *           type: array
 *           description: Outlet function slugs or IDs from master
 *           items:
 *             oneOf:
 *               - type: string
 *               - type: integer
 *         isActive:
 *           type: boolean
 *     DealerOutletItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         dealerId:
 *           type: integer
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         brandId:
 *           type: integer
 *         brand:
 *           $ref: '#/components/schemas/OutletBrandSummary'
 *         isActive:
 *           type: boolean
 *     DealerEmployeeAssignmentInput:
 *       type: object
 *       properties:
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
 *           description: OrganizationStructure id where flag=role
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *           nullable: true
 *         isActive:
 *           type: boolean
 *     DealerEmployeeCreateRequest:
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
 *         joinedDate:
 *           type: string
 *           format: date
 *         isActive:
 *           type: boolean
 *         designation:
 *           $ref: '#/components/schemas/EmployeeDesignationInput'
 *           deprecated: true
 *           description: Deprecated. Prefer departmentId/designationId on assignment.
 *         assignment:
 *           $ref: '#/components/schemas/DealerEmployeeAssignmentInput'
 *           description: >
 *             Assignment for the authenticated dealer. Include departmentId and designationId.
 *             Response uses assignment.department / assignment.designation.
 *     DealerEmployeeImportItem:
 *       type: object
 *       required: [name, email, phone, designation, department, outletCode, startDate]
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         designation:
 *           type: string
 *           description: OrganizationStructure role name (slug role)
 *         department:
 *           type: string
 *           description: OrganizationStructure department name (slug department)
 *         outletCode:
 *           $ref: '#/components/schemas/OutletPublicCode'
 *           description: Global outlet code (OT######) under any dealer
 *         startDate:
 *           type: string
 *           format: date
 *     DealerEmployeeImportRequest:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/DealerEmployeeImportItem'
 *     DealerEmployeementTransferRequest:
 *       type: object
 *       required: [employeeId, outletId, departmentId, designationId]
 *       properties:
 *         employeeId:
 *           type: integer
 *         outletId:
 *           type: integer
 *           description: Target outlet under the active dealer
 *         departmentId:
 *           type: integer
 *         designationId:
 *           type: integer
 *     FileUploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         file:
 *           type: string
 *           description: Public URL of uploaded file
 */
