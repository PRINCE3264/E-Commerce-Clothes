const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Category = require('./models/Category');
const Product = require('./models/Product');

const exhaustiveFix = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // 1. Broadly normalize all categories to Men, Women, Kids, Accessories
        const updateProduct = async (reg, target) => {
            const res = await Product.updateMany({ category: { $regex: reg, $options: 'i' } }, { category: target });
            console.log(`Updated ${res.modifiedCount} products matching ${reg} to ${target}`);
        };
        const updateCategory = async (reg, target) => {
            const res = await Category.updateMany({ name: { $regex: reg, $options: 'i' } }, { name: target });
            console.log(`Updated ${res.modifiedCount} categories matching ${reg} to ${target}`);
        };

        await updateProduct(/Men/i, 'Men');
        await updateProduct(/Women/i, 'Women');
        await updateProduct(/Kid/i, 'Kids');
        await updateProduct(/Accessory|Accessories/i, 'Accessories');

        await updateCategory(/Men/i, 'Men');
        await updateCategory(/Women/i, 'Women');
        await updateCategory(/Kid/i, 'Kids');
        await updateCategory(/Accessory|Accessories/i, 'Accessories');

        // 2. Remove duplicate categories
        const allCats = await Category.find();
        const seen = new Set();
        for (const cat of allCats) {
            if (seen.has(cat.name)) {
                console.log(`Removing duplicate category: ${cat.name} (${cat._id})`);
                await Category.deleteOne({ _id: cat._id });
            } else {
                seen.add(cat.name);
            }
        }

        console.log('--- FINAL STATE ---');
        console.log('Categories:', await Category.distinct('name'));
        console.log('Prods Categories:', await Product.distinct('category'));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

exhaustiveFix();
