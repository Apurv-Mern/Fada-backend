/**
 * @swagger
 * tags:
 *   - name: Common
 *     description: Shared utility endpoints
 */

/**
 * @swagger
 * /file-upload:
 *   post:
 *     tags: [Common]
 *     summary: Upload a file
 *     description: Upload image or PDF. Returns public file URL for use in documentUrl fields.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileUploadResponse'
 */

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Common]
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Service is healthy
 */

/**
 * @swagger
 * /api:
 *   get:
 *     tags: [Common]
 *     summary: API status
 *     responses:
 *       200:
 *         description: API is running
 */

/**
 * @swagger
 * /test-email:
 *   post:
 *     tags: [Common]
 *     summary: Queue a test email (OTP template)
 *     description: Enqueues an email job. Requires the SMS/email worker (`npm run worker` or PM2 fadaid-worker) to be running.
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
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Email queued successfully
 */

/**
 * @swagger
 * /test-sms:
 *   post:
 *     tags: [Common]
 *     summary: Queue a test SMS (OTP)
 *     description: >
 *       Enqueues an SMS job with the standard OTP template.
 *       Requires the worker (`npm run worker` or PM2 fadaid-worker) and SMS env
 *       (`SMS_API_URL`, `SMS_API_KEY`, `SMS_SENDER`, `IS_SMS_ENABLED`).
 *       Route type defaults to TRANS (OTP gateway is not configured on AOC).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, otp]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *                 description: 10-digit Indian mobile (normalized to 91XXXXXXXXXX)
 *               otp:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: SMS queued successfully
 *       422:
 *         description: phone and otp are required
 *       500:
 *         description: Failed to queue SMS
 */
