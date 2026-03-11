const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Category = require('./models/Category');
const Product = require('./models/Product');

const exhaustiveFix = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('--- STARTING CATEGORY UNIFICATION ---');
        
        // 1. Define standardization map
        const map = {
            "Men": ["Men's Wear", "Mens Wear", "Men Collections", "Men's Collection", "Men"],
            "Women": ["Women's Wear", "Womens Wear", "Women Collections", "Women's Collection", "Women", "Women's Collections"],
            "Kids": ["Kids Wear", "Kid's Wear", "Kids Collections", "Kid's Collections", "Kids", "Kids Collection"],
            "Accessories": ["Accessories Wear", "Accessories", "Accessorie's Collection"]
        };

        for (const [target, variations] of Object.entries(map)) {
            // Update Products
            const pRes = await Product.updateMany(
                { category: { $in: variations.map(v => new RegExp(`^${v}$`, 'i')) } },
                { category: target }
            );
            console.log(`Standardized Products to "${target}": ${pRes.modifiedCount} matches.`);

            // Update Categories (names)
            const cRes = await Category.updateMany(
                { name: { $in: variations.map(v => new RegExp(`^${v}$`, 'i')) } },
                { name: target }
            );
            console.log(`Standardized Categories to "${target}": ${cRes.modifiedCount} matches.`);
        }

        // 2. Remove duplicates in Category collection
        const allCats = await Category.find();
        const seen = new Set();
        for (const cat of allCats) {
            if (seen.has(cat.name)) {
                console.log(`Deleting duplicate category document: ${cat.name} (${cat._id})`);
                await Category.deleteOne({ _id: cat._id });
            } else {
                seen.add(cat.name);
            }
        }

        console.log('\n--- VERIFICATION ---');
        const finalProds = await Product.distinct('category');
        console.log('Final unique categories in Products:', finalProds);
        const finalCats = await Category.distinct('name');
        console.log('Final unique names in Categories:', finalNames = await Category.find({}, 'name'));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

exhaustiveFix();
