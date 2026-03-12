const mongoose = require('mongoose');
const Payment = require('./models/Payment');
const Order = require('./models/Order');
const dotenv = require('dotenv');

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const paymentId = '69b05a6e46a41d7c5e804477';
        const p = await Payment.findById(paymentId);
        if (!p) {
            console.log('NOT_FOUND');
            process.exit(0);
        }
        console.log('ID:', p._id);
        console.log('GATEWAY:', p.gateway);
        console.log('STATUS:', p.status);
        console.log('TXN_ID:', p.transactionId);
        console.log('AMOUNT:', p.amount);
        
        const o = await Order.findById(p.order);
        if (o) {
            console.log('ORDER_ID:', o._id);
            console.log('ORDER_STATUS:', o.status);
        } else {
            console.log('ORDER_NOT_FOUND');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
run();
