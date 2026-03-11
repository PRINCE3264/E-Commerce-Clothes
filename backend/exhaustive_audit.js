const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./models/Product');

const audit = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const products = await Product.find({}, 'name category');
        console.log('--- PRODUCT CATEGORY AUDIT ---');
        const categories = {};
        products.forEach(p => {
            if (!categories[p.category]) categories[p.category] = [];
            categories[p.category].push(p.name);
        });
        
        for (const [cat, names] of Object.entries(categories)) {
            console.log(`\nCategory: "${cat}" (${names.length} products)`);
            names.forEach(name => console.log(` - ${name}`));
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

audit();
