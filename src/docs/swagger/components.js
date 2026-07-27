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
 *         totalActiveEmployees:
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
 */
