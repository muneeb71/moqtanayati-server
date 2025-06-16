const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../../middlewares/auth.middleware');
const sellerOnly = require('../../../middlewares/seller.middleware');
const AuctionController = require('../controllers/auction.controller');

/**
 * @swagger
 * /api/auctions:
 *   get:
 *     summary: Get all auctions
 *     tags: [Auctions]
 *     responses:
 *       200:
 *         description: List of auctions
 *   post:
 *     summary: Create a new auction
 *     tags: [Auctions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Auction created
 */

/**
 * @swagger
 * /api/auctions/{id}:
 *   get:
 *     summary: Get auction by ID
 *     tags: [Auctions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Auction data
 *   patch:
 *     summary: Update auction by ID
 *     tags: [Auctions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Auction updated
 *   delete:
 *     summary: Delete auction by ID
 *     tags: [Auctions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Auction deleted
 */

// Create auction
router.post('/', authMiddleware, sellerOnly, AuctionController.createAuction);
// Get all auctions
router.get('/', AuctionController.getAllAuctions);
// Get single auction
router.get('/:id', AuctionController.getAuctionById);
// Update auction
router.patch('/:id', authMiddleware, sellerOnly, AuctionController.updateAuction);
// Delete auction
router.delete('/:id', authMiddleware, sellerOnly, AuctionController.deleteAuction);
// List live auctions
router.get('/live', AuctionController.getLiveAuctions);
// List upcoming auctions
router.get('/upcoming', AuctionController.getUpcomingAuctions);
// List auction history
router.get('/history', AuctionController.getAuctionHistory);
// Get auction details (bids, bidders, retraction requests)
router.get('/:id/details', AuctionController.getAuctionDetails);
// Update auction status
router.patch('/:id/status', authMiddleware, sellerOnly, AuctionController.updateAuctionStatus);

router.get('/seller/:sellerId', AuctionController.getSellerAuctions);

module.exports = router;