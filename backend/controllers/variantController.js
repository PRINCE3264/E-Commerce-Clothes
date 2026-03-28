const Variant = require('../models/Variant');
const Product = require('../models/Product');

// @desc    Get all variants
// @route   GET /api/variants
// @access  Private/Admin Validate admin logic or public 
const getVariants = async (req, res) => {
    try {
        const variants = await Variant.find().sort('-createdAt');
        res.status(200).json({ success: true, count: variants.length, data: variants });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get single variant
// @route   GET /api/variants/:id
// @access  Public
const getVariant = async (req, res) => {
    try {
        const variant = await Variant.findById(req.params.id);
        if(!variant) {
            return res.status(404).json({ success: false, message: 'Variant not found' });
        }
        res.status(200).json({ success: true, data: variant });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create new variant
// @route   POST /api/variants
// @access  Private/Admin
const createVariant = async (req, res) => {
    try {
        // Option to verify if product exists
        const productExists = await Product.findById(req.body.productId);
        if (!productExists) {
             return res.status(404).json({ success: false, message: 'Parent product not found' });
        }
        
        const variant = await Variant.create(req.body);
        res.status(201).json({ success: true, data: variant });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update variant
// @route   PUT /api/variants/:id
// @access  Private/Admin
const updateVariant = async (req, res) => {
    try {
        const variant = await Variant.findByIdAndUpdate(req.params.id, req.body, {
            returnDocument: 'after',
            runValidators: true
        });

        if (!variant) {
            return res.status(404).json({ success: false, message: 'Variant not found' });
        }

        res.status(200).json({ success: true, data: variant });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete variant
// @route   DELETE /api/variants/:id
// @access  Private/Admin
const deleteVariant = async (req, res) => {
    try {
        const variant = await Variant.findById(req.params.id);

        if (!variant) {
            return res.status(404).json({ success: false, message: 'Variant not found' });
        }

        await variant.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getVariants,
    getVariant,
    createVariant,
    updateVariant,
    deleteVariant
};
