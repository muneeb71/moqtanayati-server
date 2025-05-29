const express = require('express');
const router = express.Router();
const { auth } = require('../../../middlewares/auth.middleware');
const upload = require('../../../middlewares/upload.middleware');
const SupportController = require('../controllers/support.controller');

/**
 * @swagger
 * /api/support/contact:
 *   post:
 *     summary: Submit a support/contact form
 *     tags: [Support]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               attachment:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Support request submitted
 */

// Submit support/contact form (with optional file upload)
router.post('/contact', upload.single('attachment'), SupportController.submitSupportRequest);

module.exports = router;