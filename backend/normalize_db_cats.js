const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Category = require('./models/Category');
const Product = require('./models/Product');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // 1. Unify Product Categories
        // We want all variations of "Women" to become "Women"
        const prodCategories = await Product.distinct('category');
        console.log('Current unique product categories:', prodCategories);

        const map = {
            'Women': [/women/i],
            'Men': [/men/i],
            'Kids': [/kids/i],
            'Accessories': [/accessories/i]
        };

        for (const [target, regexes] of Object.entries(map)) {
            for (const re of regexes) {
                const res = await Product.updateMany({ category: { $regex: re } }, { category: target });
                if (res.modifiedCount > 0) {
                    console.log(`Updated ${res.modifiedCount} products matching ${re} to "${target}"`);
                }
            }
        }

        // 2. Unify Category Names
        const catDocs = await Category.find();
        console.log('Current category documents:', catDocs.map(c => c.name));

        for (const [target, regexes] of Object.entries(map)) {
            for (const re of regexes) {
                const res = await Category.updateMany({ name: { $regex: re } }, { name: target });
                if (res.modifiedCount > 0) {
                    console.log(`Updated ${res.modifiedCount} category docs matching ${re} to "${target}"`);
                }
            }
        }

        // 3. Remove duplicate Category documents if they exist now
        const finalCats = await Category.find();
        const seen = new Set();
        for (const cat of finalCats) {
            if (seen.has(cat.name)) {
                console.log(`Deleting duplicate category: ${cat.name} (${cat._id})`);
                await Category.deleteOne({ _id: cat._id });
            } else {
                seen.add(cat.name);
            }
        }

        console.log('--- FINAL PRODUCT CATEGORY COUNTS ---');
        const counts = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
        console.log(counts);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
