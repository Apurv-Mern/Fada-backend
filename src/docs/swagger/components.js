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
 *     OutletBrandCategoryInput:
 *       type: object
 *       required: [brandId]
 *       properties:
 *         brandId:
 *           type: integer
 *         vehicleClassId:
 *           type: integer
 *           nullable: true
 *     DealerOutletCreateRequest:
 *       type: object
 *       required: [name]
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
 *         functions:
 *           type: array
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
