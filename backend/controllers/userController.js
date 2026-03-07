const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Sync user cart
// @route   POST /api/users/cart
// @access  Private
const syncCart = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, { cart: req.body.cart || [] }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        res.status(200).json({ success: true, data: user.cart });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Sync user wishlist
// @route   POST /api/users/wishlist
// @access  Private
const syncWishlist = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, { wishlist: req.body.wishlist || [] }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        res.status(200).json({ success: true, data: user.wishlist });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get user profile (includes cart and wishlist)
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        res.status(200).json({ success: true, data: { cart: user.cart, wishlist: user.wishlist } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    syncCart,
    syncWishlist,
    getUserProfile
};
