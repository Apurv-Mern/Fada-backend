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
 * /admin/auth/profile:
 *   get:
 *     tags: [Admin Auth]
 *     summary: Get admin profile
 *     description: Returns the authenticated admin profile (id, name, email, phone, profilePicture, role, isActive, timestamps)
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
 *                       $ref: '#/components/schemas/AdminUser'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Admin not found
 *   put:
 *     tags: [Admin Auth]
 *     summary: Update admin profile
 *     description: >
 *       Updates authenticated admin profile. Send multipart/form-data with required
 *       name, email, and phone. Optionally include profilePicture file upload.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/AdminProfileUpdateRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AdminUser'
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Email already exists
 *       422:
 *         description: Validation error
 *       404:
 *         description: Admin not found
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
 *             required: [name, email, password, phone]
 *             properties:
 *               name:
 *                 type: string
 *               dealerCode:
 *                 type: string
 *                 description: Optional legacy manual code. Public dealerId (DL#####) is auto-generated.
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
 *                 maxLength: 4
 *                 example: "1234"
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
 * /dealer/auth/forgot-password:
 *   post:
 *     tags: [Dealer Auth]
 *     summary: "Forgot password — Step 1: Request OTP"
 *     description: |
 *       Starts the dealer forgot-password flow. Sends a 6-digit OTP to the dealer email if the account exists and is eligible (active, not rejected, not temporary).
 *
 *       **Flow:**
 *       1. `POST /dealer/auth/forgot-password` — request OTP
 *       2. `POST /dealer/auth/forgot-password/verify-otp` — verify OTP, receive resetToken
 *       3. `POST /dealer/auth/forgot-password/reset` — set new password
 *       4. `POST /dealer/auth/login` — login with new password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DealerForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Generic success message (does not reveal whether email exists)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *             example:
 *               success: true
 *               message: If an account exists with this email, an OTP has been sent to your email
 *               data: null
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */

/**
 * @swagger
 * /dealer/auth/forgot-password/verify-otp:
 *   post:
 *     tags: [Dealer Auth]
 *     summary: "Forgot password — Step 2: Verify OTP"
 *     description: |
 *       Validates the OTP from Step 1. Does not log in or reset the password.
 *       Returns a short-lived `resetToken` (15 minutes) for Step 3.
 *       OTP is cleared after successful verification (one-time use).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DealerVerifyForgotPasswordOtpRequest'
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DealerVerifyForgotPasswordOtpResponse'
 *       400:
 *         description: No OTP found — request a new one via forgot-password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       401:
 *         description: Invalid OTP or ineligible account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */

/**
 * @swagger
 * /dealer/auth/forgot-password/reset:
 *   post:
 *     tags: [Dealer Auth]
 *     summary: "Forgot password — Step 3: Reset password"
 *     description: |
 *       Sets a new password using the `resetToken` from Step 2.
 *       Clears refresh tokens and forces re-login with the new password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DealerResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *             example:
 *               success: true
 *               message: Password reset successfully
 *               data: null
 *       401:
 *         description: Invalid or expired reset token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: Account not eligible for password reset
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Dealer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       422:
 *         description: Validation error or new password same as current
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
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
 *     description: |
 *       Creates a temporary employee account and sends OTPs:
 *       - **emailOTP** → email
 *       - **otp** → SMS on phone
 *
 *       FADA ID is auto-generated. Verify both OTPs via `verify-registration-otp` to receive login password by email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeRegisterRequest'
 *     responses:
 *       200:
 *         description: Employee registered, OTPs sent
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
 *                         fadaId:
 *                           type: string
 *                         email:
 *                           type: string
 *                           format: email
 *       409:
 *         description: Email or phone already exists
 *       422:
 *         description: Validation error
 */

/**
 * @swagger
 * /employee/auth/verify-registration-otp:
 *   post:
 *     tags: [Employee Auth]
 *     summary: Verify registration OTPs
 *     description: |
 *       Verifies email and phone OTPs from registration.
 *       Activates the account (status `pending`), sets verified flags, and emails a temporary login password.
 *       Does not return an access token — use password login after checking email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeVerifyRegistrationOtpRequest'
 *     responses:
 *       200:
 *         description: Registration verified; login password sent to email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *       401:
 *         description: Invalid email OTP or phone OTP
 *       404:
 *         description: Employee not found
 *       422:
 *         description: Validation error
 */

/**
 * @swagger
 * /employee/auth/login:
 *   post:
 *     tags: [Employee Auth]
 *     summary: Employee password login
 *     description: Login with email and password (password is emailed after registration OTP verification).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeLoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeLoginResponse'
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Account rejected or inactive
 *       404:
 *         description: Employee not found
 *       422:
 *         description: Validation error
 */

/**
 * @swagger
 * /employee/auth/send-login-otp:
 *   post:
 *     tags: [Employee Auth]
 *     summary: Send login OTP
 *     description: |
 *       Sends a 6-digit OTP for passwordless login.
 *       - **Email** → stored in `emailOTP`, sent via email
 *       - **Phone** → stored in `otp`, sent via SMS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeSendLoginOtpRequest'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *       403:
 *         description: Account rejected or inactive
 *       404:
 *         description: User not found
 *       422:
 *         description: Invalid email or phone
 */

/**
 * @swagger
 * /employee/auth/verify-login-otp:
 *   post:
 *     tags: [Employee Auth]
 *     summary: Verify login OTP
 *     description: Verifies OTP from send-login-otp and returns access token (sets refreshToken cookie).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeVerifyLoginOtpRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeOtpLoginResponse'
 *       400:
 *         description: No OTP found
 *       401:
 *         description: Invalid OTP
 *       403:
 *         description: Account rejected
 *       404:
 *         description: Employee not found
 *       422:
 *         description: Validation error
 */

/**
 * @swagger
 * /employee/auth/forgot-password:
 *   post:
 *     tags: [Employee Auth]
 *     summary: "Forgot password — Step 1: Send OTP"
 *     description: Sends OTP to email (`emailOTP`) or phone (`otp`) based on username.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       403:
 *         description: Account rejected or inactive
 *       404:
 *         description: Employee not found
 *       422:
 *         description: Invalid email or phone
 */

/**
 * @swagger
 * /employee/auth/verify-forgot-password-otp:
 *   post:
 *     tags: [Employee Auth]
 *     summary: "Forgot password — Step 2: Verify OTP"
 *     description: Returns a short-lived `resetPasswordToken` (15 min) for step 3.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeVerifyForgotPasswordOtpRequest'
 *     responses:
 *       200:
 *         description: OTP verified successfully
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
 *                         resetPasswordToken:
 *                           type: string
 *       401:
 *         description: Invalid OTP
 *       403:
 *         description: Account rejected or inactive
 *       404:
 *         description: Employee not found
 *       422:
 *         description: Validation error
 */

/**
 * @swagger
 * /employee/auth/reset-password:
 *   post:
 *     tags: [Employee Auth]
 *     summary: "Forgot password — Step 3: Reset password"
 *     description: Sets a new password using the Bearer token from verify-forgot-password-otp.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       401:
 *         description: Invalid or expired reset token
 *       404:
 *         description: Employee not found
 *       422:
 *         description: Validation error
 */

/**
 * @swagger
 * /employee/auth/refresh-token:
 *   post:
 *     tags: [Employee Auth]
 *     summary: Refresh employee access token
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
 * /employee/auth/logout:
 *   post:
 *     tags: [Employee Auth]
 *     summary: Employee logout
 *     description: Clears refreshToken cookie and invalidates session
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     authenticated:
 *                       type: boolean
 *                       example: false
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
