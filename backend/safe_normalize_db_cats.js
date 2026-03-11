const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Category = require('./models/Category');
const Product = require('./models/Product');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- STARTING SAFE CATEGORY NORMALIZATION ---');

        const map = {
            'Women': [/women/i],
            'Men': [/men/i],
            'Kids': [/kids/i],
            'Accessories': [/accessories/i]
        };

        for (const [target, regexes] of Object.entries(map)) {
            console.log(`Processing Target: "${target}"`);
            
            // 1. Ensure target category exists
            let targetCat = await Category.findOne({ name: target });
            if (!targetCat) {
                console.log(`Creating target category: "${target}"`);
                targetCat = await Category.create({ 
                    name: target, 
                    description: `${target} Collections`, 
                    status: 'active' 
                });
            }

            for (const re of regexes) {
                // Skip if regex perfectly matches target (no change needed)
                if (target.match(re) && target.toLowerCase() === target.match(re)[0].toLowerCase()) {
                    // But we still want to move products from other variations
                }

                // 2. Move products from variations to target
                // Find variations that are NOT the target name exactly
                const variations = await Product.distinct('category', { 
                    category: { $regex: re, $ne: target } 
                });
                
                if (variations.length > 0) {
                    console.log(`Moving products from variations ${JSON.stringify(variations)} to "${target}"`);
                    const pRes = await Product.updateMany({ category: { $in: variations } }, { category: target });
                    console.log(`Moved ${pRes.modifiedCount} products.`);
                }

                // 3. Delete redundant category documents
                const catVariations = await Category.find({ 
                    name: { $regex: re, $ne: target } 
                });
                
                if (catVariations.length > 0) {
                    console.log(`Deleting redundant categories: ${catVariations.map(c => c.name)}`);
                    await Category.deleteMany({ _id: { $in: catVariations.map(c => c._id) } });
                }
            }
        }

        console.log('--- FINAL PRODUCT CATEGORY COUNTS ---');
        const counts = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
        console.log(counts);

        const finalCats = await Category.find({}, 'name');
        console.log('Final Categories in DB:', finalCats.map(c => c.name));

        process.exit(0);
    } catch (err) {
        console.error('CRITICAL ERROR:', err);
        process.exit(1);
    }
};

run();
