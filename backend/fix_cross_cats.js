const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./models/Product');

async function fix() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // 1. Audit and log current counts
        const allCats = await Product.distinct('category');
        console.log("Current unique categories:", allCats);

        // 2. Fix specific products mentioned by user if they are cross-tagged
        // But the user just says "men and womw both prode"
        // Let's look for products with "Men" in name but "Women" category
        const misTaggedMen = await Product.find({ 
            name: /men/i, 
            category: { $ne: 'Men' } 
        });
        console.log(`Found ${misTaggedMen.length} products with 'Men' in name but NOT in 'Men' category`);
        for (const p of misTaggedMen) {
            console.log(`  - [${p.category}] ${p.name}`);
            // If it's clearly a Men product, move it.
            // But "Women" also contains "men". So name match needs to be careful.
            if (p.name.toLowerCase().includes(' men') || p.name.toLowerCase().startsWith('men ')) {
                 console.log(`    -> Moving to Men category`);
                 p.category = 'Men';
                 await p.save();
            }
        }

        const misTaggedWomen = await Product.find({ 
            name: /women/i, 
            category: { $ne: 'Women' } 
        });
        console.log(`Found ${misTaggedWomen.length} products with 'Women' in name but NOT in 'Women' category`);
        for (const p of misTaggedWomen) {
            console.log(`  - [${p.category}] ${p.name}`);
            if (p.name.toLowerCase().includes('women')) {
                console.log(`    -> Moving to Women category`);
                p.category = 'Women';
                await p.save();
            }
        }

        console.log("Finalizing category check...");
        const finalCats = await Product.distinct('category');
        console.log("Final unique categories:", finalCats);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fix();
