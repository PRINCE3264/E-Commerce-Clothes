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
        const txnId = 'pay_SPc02Q5VipeG4F';
        console.log('Final try for refund:', txnId);
        try {
            // Using the most common way for v2
            const res = await razorpay.refunds.create({
                payment_id: txnId,
                amount: 1032900, // 10329.00 INR
                notes: { reason: 'Final Debug' }
            });
            fs.writeFileSync('final_debug_res.txt', JSON.stringify(res, null, 2));
        } catch (err) {
            console.error('ERROR DETECTED');
            let errorDetails = {
                message: err.message,
                statusCode: err.statusCode,
                description: err.description,
                metadata: err.metadata,
                code: err.code
            };
            if (err.error) {
                errorDetails.innerError = err.error;
            }
            fs.writeFileSync('final_debug_res.txt', JSON.stringify(errorDetails, null, 2));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
run();
