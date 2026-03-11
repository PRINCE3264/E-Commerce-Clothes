const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./models/Product');

async function audit() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const menProds = await Product.find({ category: 'Men' }, 'name category');
        console.log(`--- Products in Men (${menProds.length}) ---`);
        const suspiciousMen = menProds.filter(p => p.name.toLowerCase().includes('women'));
        suspiciousMen.forEach(p => console.log(`SUSPICIOUS: ${p.name}`));

        const womenProds = await Product.find({ category: 'Women' }, 'name category');
        console.log(`\n--- Products in Women (${womenProds.length}) ---`);
        const suspiciousWomen = womenProds.filter(p => 
            (p.name.toLowerCase().includes(' men') || p.name.toLowerCase().startsWith('men ')) && 
            !p.name.toLowerCase().includes('women')
        );
        suspiciousWomen.forEach(p => console.log(`SUSPICIOUS: ${p.name}`));

        // Log all if small
        if (menProds.length < 50) {
            console.log("\nAll Men Products:");
            menProds.forEach(p => console.log(` - ${p.name}`));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

audit();
