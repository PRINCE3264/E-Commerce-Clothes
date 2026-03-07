const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Auth session required' });
        }
        
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }
        
        res.status(200).json({ success: true, data: cart });
    } catch (err) {
        console.error("CART_ERROR_GET:", err);
        res.status(500).json({ success: false, message: "Cart retrieval failed: " + err.message });
    }
};

const addToCart = async (req, res) => {
    try {
        const { cart: frontendCart } = req.body;
        
        if (!req.user || !req.user._id) {
             return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        // Atomic find or create
        let cart = await Cart.findOneAndUpdate(
            { user: req.user._id },
            { $setOnInsert: { items: [] } },
            { upsert: true, new: true }
        );

        if (frontendCart && Array.isArray(frontendCart)) {
            const validItems = frontendCart
                .filter(item => {
                    if (!item) return false;
                    const id = item._id || item.product?._id || item.product;
                    return id && mongoose.Types.ObjectId.isValid(id.toString());
                })
                .map(item => {
                    const id = item._id || item.product?._id || item.product;
                    return {
                        product: id.toString(),
                        name: item.name || 'Product',
                        image: item.image || '',
                        price: Number(item.price) || 0,
                        quantity: Number(item.quantity) || 1,
                        size: item.size || 'M',
                        color: item.color || ''
                    };
                });
            
            cart.items = validItems;
            await cart.save();
        }

        const populatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        res.status(200).json({ success: true, data: populatedCart });
    } catch (err) {
        console.error("CART_SYNC_FATAL:", err);
        res.status(500).json({ success: false, message: "Cart sync failed: " + err.message });
    }
};

// @desc    Remove/update item in cart
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = async (req, res) => {
    try {
        const { quantity, size, color } = req.body;
        let cart = await Cart.findOne({ user: req.user._id });
        
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
        
        const itemIndex = cart.items.findIndex(item => 
            item.product && item.product.toString() === req.params.productId && 
            item.size === size && 
            item.color === color
        );

        if (itemIndex > -1) {
            if (quantity <= 0) {
                cart.items.splice(itemIndex, 1);
            } else {
                cart.items[itemIndex].quantity = quantity;
            }
        }
        
        await cart.save();
        await cart.populate('items.product');
        res.status(200).json({ success: true, data: cart });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Empty cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.status(200).json({ success: true, data: cart });
    } catch (err) {
        console.error("Error in clearCart:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getCart, addToCart, updateCartItem, clearCart };
