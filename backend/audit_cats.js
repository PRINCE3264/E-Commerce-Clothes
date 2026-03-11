const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./models/Product');

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const prods = await Product.find({}, 'name category');
        console.log('--- PRODUCT CATEGORY AUDIT ---');
        prods.forEach(p => {
            console.log(`[${p.category}] ${p.name}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
