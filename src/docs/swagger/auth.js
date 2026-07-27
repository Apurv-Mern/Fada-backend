/**
 * @swagger
 * tags:
 *   - name: Admin Auth
 *     description: Admin authentication endpoints
 *   - name: Dealer Auth
 *     description: Dealer authentication endpoints
 *   - name: Employee Auth
 *     description: Employee authentication endpoints
 *   - name: App Auth
 *     description: App authentication endpoints
 */

/**
 * @swagger
 * /admin/auth/login:
 *   post:
 *     tags: [Admin Auth]
 *     summary: Admin login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful. Check admin.mustChangePassword to prompt password change after forgot-password flow.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminLoginResponse'
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account is not active
 *       404:
 *         description: Admin not found
 */

/**
 * @swagger
 * /admin/auth/forgot-password:
 *   post:
 *     tags: [Admin Auth]
 *     summary: Forgot admin password
 *     description: Sends a temporary password to the admin email if the account exists and is active
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Temporary password sent if account exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *       422:
 *         description: Validation error
 */

/**
 * @swagger
 * /admin/auth/refresh-token:
 *   post:
 *     tags: [Admin Auth]
 *     summary: Refresh admin access token
 *     description: Requires refreshToken HttpOnly cookie from login
 *     responses:
 *       200:
 *         description: Token refreshed
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
 *                         accessToken:
 *                           type: string
 *       401:
 *         description: Refresh token missing or invalid
 */

/**
 * @swagger
 * /admin/auth/logout:
 *   post:
 *     tags: [Admin Auth]
 *     summary: Admin logout
 *     description: Clears refreshToken cookie and invalidates session
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

/**
 * @swagger
 * /admin/auth/change-password:
 *   post:
 *     tags: [Admin Auth]
 *     summary: Change admin password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Current password is incorrect
 *       422:
 *         description: Validation error
 */

/**
 * @swagger
 * /dealer/auth/register:
 *   post:
 *     tags: [Dealer Auth]
 *     summary: Register dealer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, dealerCode, email, password, phone]
 *             properties:
 *               name:
 *                 type: string
 *               dealerCode:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dealer registered, OTP sent
 *       409:
 *         description: Duplicate email or dealer code
 */

/**
 * @swagger
 * /dealer/auth/verify-otp:
 *   post:
 *     tags: [Dealer Auth]
 *     summary: Verify dealer registration OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *                 minLength: 4
 *                 maxLength: 8
 *     responses:
 *       200:
 *         description: OTP verified, dealer logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DealerLoginResponse'
 *       400:
 *         description: OTP verification not required or OTP missing
 *       401:
 *         description: Invalid OTP
 *       404:
 *         description: Dealer not found
 */

/**
 * @swagger
 * /dealer/auth/login:
 *   post:
 *     tags: [Dealer Auth]
 *     summary: Dealer password login
 *     description: Accepts email or phone. If email is not verified, sends OTP instead of logging in.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 description: Dealer email or 10-digit phone number
 *                 example: dealer@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Login successful or OTP sent for email verification
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/DealerLoginResponse'
 *                 - $ref: '#/components/schemas/DealerEmailVerificationPendingResponse'
 *       401:
 *         description: Invalid password
 *       403:
 *         description: Account rejected
 *       404:
 *         description: Dealer not found or password not set
 *       422:
 *         description: Validation error
 */

/**
 * @swagger
 * /dealer/auth/login-otp:
 *   post:
 *     tags: [Dealer Auth]
 *     summary: Send OTP for dealer login
 *     description: Sends OTP to dealer email or phone for passwordless login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 description: Dealer email or 10-digit phone number
 *                 example: dealer@example.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       403:
 *         description: Account rejected, temporary, or inactive
 *       404:
 *         description: Dealer not found
 *       422:
 *         description: Email or phone is required
 */

/**
 * @swagger
 * /dealer/auth/login-otp/verify:
 *   post:
 *     tags: [Dealer Auth]
 *     summary: Verify dealer login OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *                 description: Dealer email or 10-digit phone number
 *               otp:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DealerLoginResponse'
 *       401:
 *         description: Invalid OTP
 *       403:
 *         description: Account rejected or registration incomplete
 *       404:
 *         description: Dealer not found
 */

/**
 * @swagger
 * /dealer/auth/refresh-token:
 *   post:
 *     tags: [Dealer Auth]
 *     summary: Refresh dealer access token
 *     description: Requires refreshToken HttpOnly cookie from login
 *     responses:
 *       200:
 *         description: Token refreshed
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
 *                         accessToken:
 *                           type: string
 *       401:
 *         description: Refresh token missing or invalid
 *       403:
 *         description: Invalid refresh token
 */

/**
 * @swagger
 * /dealer/auth/logout:
 *   post:
 *     tags: [Dealer Auth]
 *     summary: Dealer logout
 *     description: Clears refreshToken cookie and invalidates session
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

/**
 * @swagger
 * /dealer/auth/change-password:
 *   post:
 *     tags: [Dealer Auth]
 *     summary: Change dealer password
 *     description: Requires dealer Bearer token. New password must be at least 6 characters.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *           example:
 *             currentPassword: oldPassword123
 *             newPassword: newPassword123
 *             confirmPassword: newPassword123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *       400:
 *         description: Password is not set on account
 *       401:
 *         description: Current password is incorrect or unauthorized
 *       422:
 *         description: Validation error or new password same as current
 */

/**
 * @swagger
 * /employee/auth/register:
 *   post:
 *     tags: [Employee Auth]
 *     summary: Register employee
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, dob, gender]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1995-06-15"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *     responses:
 *       200:
 *         description: Employee registered, FADA ID generated
 *       409:
 *         description: Email already exists
 */

/**
 * @swagger
 * /employee/auth/verify-otp:
 *   post:
 *     tags: [Employee Auth]
 *     summary: Verify employee registration OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified
 */

/**
 * @swagger
 * /employee/auth/login:
 *   post:
 *     tags: [Employee Auth]
 *     summary: Employee password login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */

/**
 * @swagger
 * /employee/auth/login-otp:
 *   post:
 *     tags: [Employee Auth]
 *     summary: Send OTP for employee login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent
 */

/**
 * @swagger
 * /employee/auth/login-otp/verify:
 *   post:
 *     tags: [Employee Auth]
 *     summary: Verify employee login OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */

/**
 * @swagger
 * /employee/auth/refresh-token:
 *   post:
 *     tags: [Employee Auth]
 *     summary: Refresh employee access token
 *     responses:
 *       200:
 *         description: Token refreshed
 */

/**
 * @swagger
 * /employee/auth/logout:
 *   post:
 *     tags: [Employee Auth]
 *     summary: Employee logout
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

/**
 * @swagger
 * /app/auth/login:
 *   post:
 *     tags: [App Auth]
 *     summary: App user login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
