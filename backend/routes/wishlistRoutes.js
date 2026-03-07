const express = require('express');
const router = express.Router();
const { getWishlist, syncWishlist, removeFromWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getWishlist)
    .post(protect, syncWishlist);

router.route('/:productId')
    .delete(protect, removeFromWishlist);

module.exports = router;
