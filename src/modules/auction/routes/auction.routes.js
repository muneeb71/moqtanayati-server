const express = require('express');
const router = express.Router();
const { auth } = require('../../../middlewares/auth.middleware');
const { sellerOnly } = require('../../../middlewares/seller.middleware');
const AuctionController = require('../controllers/auction.controller');

// Create auction
router.post('/', auth, sellerOnly, AuctionController.createAuction);
// Get all auctions
router.get('/', AuctionController.getAuctions);
// Get single auction
router.get('/:id', AuctionController.getAuction);
// Update auction
router.patch('/:id', auth, sellerOnly, AuctionController.updateAuction);
// Delete auction
router.delete('/:id', auth, sellerOnly, AuctionController.deleteAuction);
// List live auctions
router.get('/live', AuctionController.getLiveAuctions);
// List upcoming auctions
router.get('/upcoming', AuctionController.getUpcomingAuctions);
// List auction history
router.get('/history', AuctionController.getAuctionHistory);
// Get auction details (bids, bidders, retraction requests)
router.get('/:id/details', AuctionController.getAuctionDetails);
// Update auction status
router.patch('/:id/status', auth, sellerOnly, AuctionController.updateAuctionStatus);

module.exports = router; 