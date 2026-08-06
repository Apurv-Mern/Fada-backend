/**
 * @swagger
 * components:
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
 *         role:
 *           type: string
 *           example: admin
 *         mustChangePassword:
 *           type: boolean
 *           description: True when admin must change password after forgot-password flow
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
 *     RecentDealerSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         dealerCode:
 *           type: string
 *         status:
 *           type: string
 *           enum: [temporary, pending, approved, rejected]
 *         isActive:
 *           type: boolean
 *     AdminDealerUpsertRequest:
 *       type: object
 *       required: [name, email, phone, dealerCode, brands]
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
 *     EmployeePersonalDetailsUpdateRequest:
 *       type: object
 *       required: [name, bloodGroup, dob, gender, address]
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
 *         address:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EmployeeAddressInput'
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
 *     OutletBrandSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *     DealerOutletCreateRequest:
 *       type: object
 *       required: [name, brandId]
 *       properties:
 *         name:
 *           type: string
 *         code:
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
 *         assignment:
 *           $ref: '#/components/schemas/DealerEmployeeAssignmentInput'
 *     FileUploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         file:
 *           type: string
 *           description: Public URL of uploaded file
 */
