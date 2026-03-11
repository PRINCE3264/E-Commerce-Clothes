const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Category = require('./models/Category');
const Product = require('./models/Product');

const fixData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // 1. Update Categories
        const catMap = {
            "Men's Wear": "Men",
            "Women's Wear": "Women",
            "Kids Wear": "Kids",
            "Women's Collections": "Women",
            "Kid's Collections": "Kids",
            "Kids Collections": "Kids",
            "Accessories": "Accessories"
        };
        
        for (const [oldName, newName] of Object.entries(catMap)) {
            await Category.updateOne({ name: oldName }, { name: newName });
            await Product.updateMany({ category: oldName }, { category: newName });
        }
        
        // Final sanity check
        const finalCats = await Category.find();
        console.log('--- Final Categories ---');
        finalCats.forEach(c => console.log(`- "${c.name}"`));
        
        const finalProdsCats = await Product.distinct('category');
        console.log('\n--- Final Product Categories ---');
        finalProdsCats.forEach(c => console.log(`- "${c}"`));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixData();
