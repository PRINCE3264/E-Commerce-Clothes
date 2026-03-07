const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized access' });
        }
        let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products.product');
        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [] });
        }
        res.status(200).json({ success: true, data: wishlist });
    } catch (err) {
        console.error("WISHLIST_ERROR_GET:", err);
        res.status(500).json({ success: false, message: "Wishlist loading failed: " + err.message });
    }
};

// @desc    Sync user wishlist
// @route   POST /api/wishlist
// @access  Private
const syncWishlist = async (req, res) => {
    try {
        const { wishlist: frontendWishlist } = req.body;
        
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        // Use atomic findOneAndUpdate with upsert to prevent race conditions
        let wishlist = await Wishlist.findOneAndUpdate(
            { user: req.user._id },
            { $setOnInsert: { products: [] } },
            { upsert: true, new: true }
        );

        if (frontendWishlist && Array.isArray(frontendWishlist)) {
            const validItems = frontendWishlist
                .filter(item => {
                    if (!item) return false;
                    const id = item._id || item.product?._id || item.product;
                    return id && mongoose.Types.ObjectId.isValid(id.toString());
                })
                .map(item => {
                    const id = item._id || item.product?._id || item.product;
                    const cleanPrice = Number(item.price);
                    return {
                        product: id.toString(),
                        name: item.name || 'Product',
                        image: item.image || '',
                        price: isNaN(cleanPrice) ? 0 : cleanPrice
                    };
                });
            
            wishlist.products = validItems;
            await wishlist.save();
        }
        
        // Final fetch with populate for consistency
        const result = await Wishlist.findOne({ user: req.user._id }).populate('products.product');
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        console.error("WISHLIST_SYNC_FATAL:", err);
        res.status(500).json({ 
            success: false, 
            message: "Wishlist Sync Failure: " + err.message
        });
    }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            return res.status(404).json({ success: false, message: 'Wishlist not found' });
        }

        wishlist.products = wishlist.products.filter(item => 
            item.product && item.product.toString() !== req.params.productId
        );
        await wishlist.save();
        
        await wishlist.populate({ path: 'products.product' });
        res.status(200).json({ success: true, data: wishlist });
    } catch (err) {
        console.error("Error in removeFromWishlist:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getWishlist, syncWishlist, removeFromWishlist };
