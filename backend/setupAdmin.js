const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load env vars
dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const adminExists = await User.findOne({ email: 'admin@gmail.com' });

        if (adminExists) {
            console.log('Admin user already exists. Updating role to admin...');
            adminExists.role = 'admin';
            await adminExists.save();
            console.log('Admin role verified.');
        } else {
            console.log('Creating new admin user...');
            await User.create({
                name: 'Admin User',
                email: 'admin@gmail.com',
                password: 'admin123',
                role: 'admin'
            });
            console.log('Admin user created successfully!');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAdmin();
