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
        const paymentId = 'pay_SPc02Q5VipeG4F';
        console.log('Attempting full refund (no amount) for:', paymentId);
        try {
            // Some versions of SDK use this
            const res = await razorpay.payments.refund(paymentId, {
                notes: { reason: 'No Amount Test' }
            });
            fs.writeFileSync('full_refund_res.txt', JSON.stringify(res, null, 2));
        } catch (err) {
            fs.writeFileSync('full_refund_res.txt', JSON.stringify({
                message: err.message,
                statusCode: err.statusCode,
                description: err.description,
                metadata: err.metadata
            }, null, 2));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
run();
