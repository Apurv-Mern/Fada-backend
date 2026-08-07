/**
 * @swagger
 * tags:
 *   - name: Employee App Profile
 *   - name: Employee App Documents
 *   - name: Employee App Employment
 *   - name: Employee App Certificates
 *   - name: Employee App Skills
 *   - name: Employee App Trainings
 *   - name: Employee App Appreciations
 *   - name: Employee App Promotions
 *   - name: Employee App Journey
 */

/**
 * @swagger
 * /api/v1/employee/profile:
 *   get:
 *     tags: [Employee App Profile]
 *     summary: Get employee profile summary
 *     description: Returns core profile fields, verification flags, score, and current employment (where isCurrentlyWorking is true) including dealership, branch, and designation.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee profile fetched successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/employee/profile/privacy:
 *   get:
 *     tags: [Employee App Profile]
 *     summary: Get profile privacy setting
 *     description: Returns whether the employee profile is private (shared only with selected organisations) or public.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile privacy fetched successfully
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags: [Employee App Profile]
 *     summary: Update profile public or private
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeProfilePrivacyUpdateRequest'
 *     responses:
 *       200:
 *         description: Profile privacy updated successfully
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/employee/profile/shares:
 *   get:
 *     tags: [Employee App Profile]
 *     summary: List profile shares
 *     description: Organisations (dealers) that can view this profile when it is private.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile shares fetched successfully
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags: [Employee App Profile]
 *     summary: Share profile access with organisation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeProfileShareRequest'
 *     responses:
 *       200:
 *         description: Profile access shared successfully
 *       404:
 *         description: Organisation not found
 *       409:
 *         description: Already shared with this organisation
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/employee/profile/shares/{shareId}:
 *   delete:
 *     tags: [Employee App Profile]
 *     summary: Revoke profile share
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shareId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Profile access revoked successfully
 *       404:
 *         description: Share not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/employee/personal-details:
 *   get:
 *     tags: [Employee App Profile]
 *     summary: Get personal details
 *     description: Returns employee profile fields and addresses.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personal details fetched successfully
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags: [Employee App Profile]
 *     summary: Update personal details
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeePersonalDetailsUpdateRequest'
 *     responses:
 *       200:
 *         description: Personal details updated successfully
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/employee/documents:
 *   get:
 *     tags: [Employee App Documents]
 *     summary: Get document checklist with uploads
 *     description: Master document types applicable to employees with optional upload status.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Documents fetched successfully
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags: [Employee App Documents]
 *     summary: Upload employee document
 *     description: Replaces existing upload for the same document type.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeDocumentUploadRequest'
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 *       404:
 *         description: Document type not found
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/employee/documents/{documentId}:
 *   delete:
 *     tags: [Employee App Documents]
 *     summary: Delete uploaded document
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Master document type id
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       404:
 *         description: Upload not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/employee/employeements:
 *   get:
 *     tags: [Employee App Employment]
 *     summary: List employment history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employment records fetched successfully
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags: [Employee App Employment]
 *     summary: Add employment record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeEmployeementCreateRequest'
 *     responses:
 *       200:
 *         description: Employment record created successfully
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/employee/certificates:
 *   get:
 *     tags: [Employee App Certificates]
 *     summary: List employee certificates
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee certificates fetched successfully
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags: [Employee App Certificates]
 *     summary: Add employee certificate
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeCertificateUpsertRequest'
 *     responses:
 *       200:
 *         description: Employee certificate created successfully
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/employee/certificates/{certificateId}:
 *   get:
 *     tags: [Employee App Certificates]
 *     summary: Get employee certificate by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee certificate fetched successfully
 *       404:
 *         description: Certificate not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags: [Employee App Certificates]
 *     summary: Update employee certificate
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeCertificateUpsertRequest'
 *     responses:
 *       200:
 *         description: Employee certificate updated successfully
 *       404:
 *         description: Certificate not found
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *   delete:
 *     tags: [Employee App Certificates]
 *     summary: Delete employee certificate
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee certificate deleted successfully
 *       404:
 *         description: Certificate not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/employee/skills:
 *   get:
 *     tags: [Employee App Skills]
 *     summary: List employee skills
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee skills fetched successfully
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags: [Employee App Skills]
 *     summary: Add employee skill
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeSkillUpsertRequest'
 *     responses:
 *       200:
 *         description: Employee skill created successfully
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/employee/skills/{skillId}:
 *   get:
 *     tags: [Employee App Skills]
 *     summary: Get employee skill by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee skill fetched successfully
 *       404:
 *         description: Skill not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags: [Employee App Skills]
 *     summary: Update employee skill
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeSkillUpsertRequest'
 *     responses:
 *       200:
 *         description: Employee skill updated successfully
 *       404:
 *         description: Skill not found
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *   delete:
 *     tags: [Employee App Skills]
 *     summary: Delete employee skill
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee skill deleted successfully
 *       404:
 *         description: Skill not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/employee/trainings:
 *   get:
 *     tags: [Employee App Trainings]
 *     summary: List employee trainings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee trainings fetched successfully
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags: [Employee App Trainings]
 *     summary: Add employee training
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeTrainingUpsertRequest'
 *     responses:
 *       200:
 *         description: Employee training created successfully
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/employee/trainings/{trainingId}:
 *   get:
 *     tags: [Employee App Trainings]
 *     summary: Get employee training by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee training fetched successfully
 *       404:
 *         description: Training not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags: [Employee App Trainings]
 *     summary: Update employee training
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainingId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeTrainingUpsertRequest'
 *     responses:
 *       200:
 *         description: Employee training updated successfully
 *       404:
 *         description: Training not found
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *   delete:
 *     tags: [Employee App Trainings]
 *     summary: Delete employee training
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee training deleted successfully
 *       404:
 *         description: Training not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/employee/appreciations:
 *   get:
 *     tags: [Employee App Appreciations]
 *     summary: List employee appreciations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee appreciations fetched successfully
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags: [Employee App Appreciations]
 *     summary: Add employee appreciation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeAppreciationUpsertRequest'
 *     responses:
 *       200:
 *         description: Employee appreciation created successfully
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/employee/appreciations/{appreciationId}:
 *   get:
 *     tags: [Employee App Appreciations]
 *     summary: Get employee appreciation by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appreciationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee appreciation fetched successfully
 *       404:
 *         description: Appreciation not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags: [Employee App Appreciations]
 *     summary: Update employee appreciation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appreciationId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeAppreciationUpsertRequest'
 *     responses:
 *       200:
 *         description: Employee appreciation updated successfully
 *       404:
 *         description: Appreciation not found
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *   delete:
 *     tags: [Employee App Appreciations]
 *     summary: Delete employee appreciation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appreciationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee appreciation deleted successfully
 *       404:
 *         description: Appreciation not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/employee/promotions:
 *   get:
 *     tags: [Employee App Promotions]
 *     summary: List employee promotions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee promotions fetched successfully
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags: [Employee App Promotions]
 *     summary: Add employee promotion
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeePromotionUpsertRequest'
 *     responses:
 *       200:
 *         description: Employee promotion created successfully
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/employee/promotions/{promotionId}:
 *   get:
 *     tags: [Employee App Promotions]
 *     summary: Get employee promotion by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: promotionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee promotion fetched successfully
 *       404:
 *         description: Promotion not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags: [Employee App Promotions]
 *     summary: Update employee promotion
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: promotionId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeePromotionUpsertRequest'
 *     responses:
 *       200:
 *         description: Employee promotion updated successfully
 *       404:
 *         description: Promotion not found
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *   delete:
 *     tags: [Employee App Promotions]
 *     summary: Delete employee promotion
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: promotionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee promotion deleted successfully
 *       404:
 *         description: Promotion not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/employee/journeys:
 *   get:
 *     tags: [Employee App Journey]
 *     summary: List employee journey entries
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee journeys fetched successfully
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags: [Employee App Journey]
 *     summary: Add journey entry
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeJourneyUpsertRequest'
 *     responses:
 *       200:
 *         description: Employee journey created successfully
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/employee/journeys/{journeyId}:
 *   get:
 *     tags: [Employee App Journey]
 *     summary: Get journey entry by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: journeyId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee journey fetched successfully
 *       404:
 *         description: Journey not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags: [Employee App Journey]
 *     summary: Update journey entry
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: journeyId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeJourneyUpsertRequest'
 *     responses:
 *       200:
 *         description: Employee journey updated successfully
 *       404:
 *         description: Journey not found
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *   delete:
 *     tags: [Employee App Journey]
 *     summary: Delete journey entry
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: journeyId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee journey deleted successfully
 *       404:
 *         description: Journey not found
 *       401:
 *         description: Unauthorized
 */
