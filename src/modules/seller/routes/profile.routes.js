const express = require("express");
const profileController = require("../controllers/profile.controller");
const logoUpload = require("../../utils/logoUpload");
const { authMiddleware } = require("../../../middlewares/auth.middleware");
const router = express.Router();
const upload = require("../../../middlewares/upload.middleware");

/**
 * @swagger
 * /api/sellers/profile/me:
 *   get:
 *     summary: Get authenticated user's own profile
 *     tags: [Seller Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Unauthorized
 * /api/sellers/profile/{userId}:
 *   get:
 *     summary: Get user profile by userId
 *     description: Users can only view their own profile. Admins can view any profile. Sensitive fields (password, nationalId) are excluded from response.
 *     tags: [Seller Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (must match authenticated user's ID unless admin)
 *     responses:
 *       200:
 *         description: User profile data (sensitive fields excluded)
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - You can only view your own profile
 *       404:
 *         description: User not found
 *   patch:
 *     summary: Update user profile (with avatar upload)
 *     description: Users can only update their own profile. The userId in URL must match the authenticated user's ID.
 *     tags: [Seller Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (must match authenticated user's ID)
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
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               nationalId:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - You can only modify your own profile
 *   patch:
 *     summary: Update user status (admin only or own account)
 *     tags: [Seller Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 *       403:
 *         description: Forbidden - Can only update own status unless admin
 */

router.get("/me", authMiddleware, profileController.getProfile);
router.get("/:userId", authMiddleware, profileController.getProfile);
router.patch(
  "/:userId",
  authMiddleware,
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  profileController.updateProfile
);
router.patch("/:userId/status", authMiddleware, profileController.updateStatus);
// Change password
router.post(
  "/change-password",
  authMiddleware,
  profileController.changePassword
);

router.put(
  "/set/auction-preferences",
  authMiddleware,
  profileController.updateAuctionPreference
);

module.exports = router;
