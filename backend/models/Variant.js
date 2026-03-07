const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String, // e.g., 'Size', 'Color', 'Material'
        required: true
    },
    value: {
        type: String, // e.g., 'XL', 'Obsidian Black', 'Silk'
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    priceMod: {
        type: Number, // Additional cost or discount for this variant
        default: 0
    },
    image: {
        type: String
    },
    status: {
        type: String,
        enum: ['In Stock', 'Low Stock', 'Out of Stock'],
        default: 'In Stock'
    }
}, { timestamps: true });

module.exports = mongoose.model('Variant', variantSchema);
