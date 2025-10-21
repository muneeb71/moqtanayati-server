/**
 * @swagger
 * /api/buyers/watchlist:
 *   get:
 *     summary: Get the buyer's watchlist
 *     tags: [Buyer Watchlist]
 *     responses:
 *       200:
 *         description: List of watchlist items
 *   post:
 *     summary: Add an item to the watchlist
 *     tags: [Buyer Watchlist]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Item added to watchlist
 */

const express = require("express");
const watchlistController = require("../controllers/watchlist.controller");
const { authMiddleware } = require("../../../middlewares/auth.middleware");
const router = express.Router();

router.get("/", authMiddleware, watchlistController.getWatchlist);
router.get("/:productId", authMiddleware, watchlistController.getById);
router.post("/:productId", authMiddleware, watchlistController.addToWatchlist);
router.delete(
  "/:watchlistId",
  authMiddleware,
  watchlistController.removeFromWatchlist
);

module.exports = router;
