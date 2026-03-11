const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Category = require('./models/Category');
const Product = require('./models/Product');

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const cats = await Category.find();
        console.log('CATEGORIES IN DB:', cats.map(c => c.name));
        const prodCats = await Product.distinct('category');
        console.log('PRODUCT CATEGORIES IN DB:', prodCats);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
