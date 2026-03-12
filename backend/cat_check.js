const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const Product = require('./models/Product');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const stats = await Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        console.log('Category Stats:', JSON.stringify(stats, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
