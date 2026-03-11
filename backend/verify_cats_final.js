const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./models/Product');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const m = await Product.countDocuments({ category: 'Men' });
        const w = await Product.countDocuments({ category: 'Women' });
        const k = await Product.countDocuments({ category: 'Kids' });
        const a = await Product.countDocuments({ category: 'Accessories' });
        
        console.log('--- FINAL PRODUCT DISTRIBUTION ---');
        console.log('Men:', m);
        console.log('Women:', w);
        console.log('Kids:', k);
        console.log('Accessories:', a);
        
        const mismatched = await Product.find({
            $or: [
                { name: / men/i, category: { $ne: 'Men' } },
                { name: /^men/i, category: { $ne: 'Men' } },
                { name: /women/i, category: { $ne: 'Women' } }
            ]
        });
        
        console.log('\nPotential mismatches remaining:', mismatched.length);
        mismatched.forEach(p => console.log(`[${p.category}] ${p.name}`));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
