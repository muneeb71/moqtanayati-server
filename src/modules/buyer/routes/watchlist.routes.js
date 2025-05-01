const express = require('express');
const watchlistController = require('../controllers/watchlist.controller');
const router = express.Router();

router.get('/', watchlistController.getWatchlist);
router.post('/:auctionId', watchlistController.addToWatchlist);
router.delete('/:auctionId', watchlistController.removeFromWatchlist);

module.exports = router; 