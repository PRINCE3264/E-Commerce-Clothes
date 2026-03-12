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
        const paymentId = 'pay_SPc02Q5VipeG4F'; // The TXN_ID from earlier
        console.log('Fetching details for:', paymentId);
        try {
            const payment = await razorpay.payments.fetch(paymentId);
            console.log('Razorpay Payment Details:', payment);
            fs.writeFileSync('razorpay_details.txt', JSON.stringify(payment, null, 2));
        } catch (err) {
            console.error('Fetch Failed:', err);
            fs.writeFileSync('razorpay_details.txt', JSON.stringify(err, null, 2));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
run();
