const mongoose = require('mongoose');
const Order = require('./models/Order');

mongoose.connect('mongodb://127.0.0.1:27017/ecomm').then(async () => {
    try {
        const res = await Order.updateMany(
            { refundProof: { $regex: /./ } },
            { $set: { refundTransactionId: 'TXN_RF_90918341' } }
        );
        console.log('Updated orders with proof:', res.modifiedCount);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
});
