const mongoose = require('mongoose');
const Payment = require('./models/Payment');
const Order = require('./models/Order');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const paymentId = '69b05a6e46a41d7c5e804477';
        const p = await Payment.findById(paymentId);
        let output = '';
        if (!p) {
            output = 'NOT_FOUND\n';
        } else {
            output += `ID: ${p._id}\n`;
            output += `GATEWAY: ${p.gateway}\n`;
            output += `STATUS: ${p.status}\n`;
            output += `TXN_ID: ${p.transactionId}\n`;
            output += `AMOUNT: ${p.amount}\n`;
            
            const o = await Order.findById(p.order);
            if (o) {
                output += `ORDER_ID: ${o._id}\n`;
                output += `ORDER_STATUS: ${o.status}\n`;
                output += `ORDER_EMAIL: ${o.paymentResult?.email_address || 'N/A'}\n`;
            } else {
                output += 'ORDER_NOT_FOUND\n';
            }
        }
        fs.writeFileSync('final_inspection.txt', output, 'utf8');
        console.log('Inspection complete. Read final_inspection.txt');
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('final_inspection.txt', err.stack, 'utf8');
        process.exit(1);
    }
};
run();
