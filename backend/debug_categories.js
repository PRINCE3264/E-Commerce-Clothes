const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Category = require('./models/Category');
const Product = require('./models/Product');

const runCheck = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const cats = await Category.find();
        console.log('--- CATEGORIES ---');
        cats.forEach(c => console.log(`- "${c.name}"`));
        
        const products = await Product.find().limit(50);
        const uniqueProductCats = [...new Set(products.map(p => p.category))];
        console.log('\n--- CATEGORIES USED IN PRODUCTS ---');
        uniqueProductCats.forEach(c => console.log(`- "${c}"`));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

runCheck();
