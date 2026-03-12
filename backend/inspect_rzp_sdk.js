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
        const keys = Object.keys(razorpay);
        let output = 'Keys: ' + keys.join(', ') + '\n';
        if (razorpay.payments) {
            output += 'Payments keys: ' + Object.keys(razorpay.payments).join(', ') + '\n';
        }
        if (razorpay.refunds) {
            output += 'Refunds keys: ' + Object.keys(razorpay.refunds).join(', ') + '\n';
        }
        fs.writeFileSync('razorpay_structure.txt', output);
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('razorpay_structure.txt', err.stack);
        process.exit(1);
    }
};
run();
