const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            name: {
                type: String
            },
            image: {
                type: String
            },
            price: {
                type: Number
            },
            quantity: {
                type: Number,
                default: 1
            },
            size: {
                type: String
            },
            color: {
                type: String
            }
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);
