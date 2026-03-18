const mongoose = require('mongoose');
const Payment = require('./models/Payment');
const Razorpay = require('razorpay');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const paymentId = '69b05a6e46a41d7c5e804477';
        const payment = await Payment.findById(paymentId);
        
        console.log('Attempting refund via refunds.create for:', payment.transactionId);
        try {
            const refundResponse = await razorpay.refunds.create({
                payment_id: payment.transactionId,
                amount: Math.round(payment.amount * 100),
                notes: { reason: 'Debug Refund v2' }
            });
            console.log('Refund Success:', refundResponse);
            fs.writeFileSync('debug_refund_v2_result.txt', JSON.stringify(refundResponse, null, 2));
        } catch (err) {
            console.error('Refund Failed with error:');
            console.error(err);
            fs.writeFileSync('debug_refund_v2_result.txt', JSON.stringify(err, null, 2));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
run();
