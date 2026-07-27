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
