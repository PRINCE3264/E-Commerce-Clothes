const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
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
            }
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
