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
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /admin/auth/refresh-token:
 *   post:
 *     tags: [Admin Auth]
 *     summary: Refresh admin access token
 *     responses:
 *       200:
 *         description: Token refreshed
 *       401:
 *         description: Refresh token missing or invalid
 */

/**
 * @swagger
 * /admin/auth/logout:
 *   post:
 *     tags: [Admin Auth]
 *     summary: Admin logout
 *     responses:
 *       200:
 *         description: Logged out successfully
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
 *     responses:
 *       200:
 *         description: OTP verified
 *       401:
 *         description: Invalid OTP
 */

/**
 * @swagger
 * /dealer/auth/login:
 *   post:
 *     tags: [Dealer Auth]
 *     summary: Dealer password login
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
 * /dealer/auth/login-otp:
 *   post:
 *     tags: [Dealer Auth]
 *     summary: Send OTP for dealer login
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
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */

/**
 * @swagger
 * /dealer/auth/refresh-token:
 *   post:
 *     tags: [Dealer Auth]
 *     summary: Refresh dealer access token
 *     responses:
 *       200:
 *         description: Token refreshed
 */

/**
 * @swagger
 * /dealer/auth/logout:
 *   post:
 *     tags: [Dealer Auth]
 *     summary: Dealer logout
 *     responses:
 *       200:
 *         description: Logged out successfully
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
