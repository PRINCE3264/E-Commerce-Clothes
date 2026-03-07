const express = require('express');
const router = express.Router();
const { syncCart, syncWishlist, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/cart', protect, syncCart);
router.post('/wishlist', protect, syncWishlist);
router.get('/profile', protect, getUserProfile);

module.exports = router;


