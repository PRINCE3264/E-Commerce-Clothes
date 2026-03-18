const mongoose = require('mongoose');
const Payment = require('./models/Payment');
const Order = require('./models/Order');
const dotenv = require('dotenv');

dotenv.config();

const inspectPayment = async (paymentId) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const payment = await Payment.findById(paymentId).populate('order');
        if (!payment) {
            console.log('Payment not found');
            return;
        }

        console.log('Payment details:', JSON.stringify(payment, null, 2));
        
        if (payment.order) {
            console.log('Order exists:', payment.order._id);
            console.log('Order status:', payment.order.status);
            console.log('Order trackingLog:', payment.order.trackingLog ? 'Array of ' + payment.order.trackingLog.length : 'MISSING');
        } else {
            console.log('Order is NULL in payment record');
        }

        process.exit(0);
    } catch (err) {
        console.error('Inspection error:', err);
        process.exit(1);
    }
};

const paymentId = '69b05a6e46a41d7c5e804477';
inspectPayment(paymentId);
