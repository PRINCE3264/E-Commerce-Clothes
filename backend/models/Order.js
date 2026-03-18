const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            size: { type: String },
            color: { type: String }
        }
    ],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        phone: { type: String, required: true },
        aadharNumber: { type: String },
        panNumber: { type: String }
    },
    paymentMethod: {
        type: String,
        required: true,
        default: 'COD' // Cash on Delivery
    },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String }
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    discountAmount: {
        type: Number,
        default: 0.0
    },
    couponCode: {
        type: String,
        default: ''
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    paidAt: {
        type: Date
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false
    },
    deliveredAt: {
        type: Date
    },
    isRefunded: {
        type: Boolean,
        default: false
    },
    refundedAt: {
        type: Date
    },
    refundProof: {
        type: String
    },
    refundProofStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    refundTransactionId: {
        type: String
    },
    status: {
        type: String,
        required: true,
        default: 'Processing',
        enum: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled']
    },
    trackingLog: [
        {
            status: { type: String },
            message: { type: String },
            location: { type: String },
            timestamp: { type: Date, default: Date.now }
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
