const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    gateway: {
        type: String,
        required: true,
        enum: ['RAZORPAY', 'STRIPE', 'COD', 'ONLINE', 'UPI']
    },
    transactionId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    paymentDetails: {
        type: Object // Raw response from gateway
    },
    paidAt: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
