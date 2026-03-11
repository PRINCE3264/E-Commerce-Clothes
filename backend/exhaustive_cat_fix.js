const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Category = require('./models/Category');
const Product = require('./models/Product');

const fixAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const allProducts = await Product.find({}, 'category');
        const uniqueProductCats = [...new Set(allProducts.map(p => p.category))];
        console.log('Current Product Categories:', uniqueProductCats);

        const allCategories = await Category.find({}, 'name');
        console.log('Current Category Names:', allCategories.map(c => c.name));

        const standardizationMap = {
            "Men's Wear": "Men",
            "Women's Wear": "Women",
            "Kids Wear": "Kids",
            "Men's Collections": "Men",
            "Women's Collections": "Women",
            "Kids Collections": "Kids",
            "Kid's Collections": "Kids",
            "Men's Collection": "Men",
            "Women's Collection": "Women",
            "Kids Collection": "Kids",
            "Accessories Wear": "Accessories",
            "Accessories": "Accessories",
            "Men": "Men",
            "Women": "Women",
            "Kids": "Kids"
        };

        for (const [oldName, newName] of Object.entries(standardizationMap)) {
            // Update Products
            const pRes = await Product.updateMany(
                { category: { $regex: new RegExp(`^${oldName}$`, 'i') } },
                { category: newName }
            );
            if (pRes.modifiedCount > 0) console.log(`Updated ${pRes.modifiedCount} products from "${oldName}" to "${newName}"`);

            // Update Categories
            const cRes = await Category.updateMany(
                { name: { $regex: new RegExp(`^${oldName}$`, 'i') } },
                { name: newName }
            );
            if (cRes.modifiedCount > 0) console.log(`Updated ${cRes.modifiedCount} categories from "${oldName}" to "${newName}"`);
        }

        // Remove duplicate categories after rename
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

        console.log('\n--- Final Verification ---');
        const finalProducts = await Product.distinct('category');
        console.log('Final Product Categories:', finalProducts);
        const finalNames = await Category.distinct('name');
        console.log('Final Category Names:', finalNames);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixAll();
