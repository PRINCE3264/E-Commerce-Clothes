const axios = require('axios');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const testUserApi = async () => {
    try {
        // Create a fake token
        // Assuming we need a valid user ID, let's find one
        const mongoose = require('mongoose');
        const User = require('./models/User');
        
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne();
        
        if (!user) {
            console.log("No user found");
            process.exit(0);
        }
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        console.log("Testing POST /api/users/cart...");
        try {
            const res = await axios.post('http://localhost:5000/api/users/cart', { 
                cart: [{
                    _id: "60c72b2f5f1b2c0015f3a123",
                    name: "Test item",
                    price: 2499,
                    quantity: 2,
                    size: "M",
                    color: "Blue"
                }] 
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("Cart Success:", res.data);
        } catch (err) {
            console.error("Cart Error:", err.response ? err.response.data : err.message);
        }

        console.log("Testing POST /api/users/wishlist...");
        try {
            const res = await axios.post('http://localhost:5000/api/users/wishlist', { wishlist: [] }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("Wishlist Success:", res.data);
        } catch (err) {
            console.error("Wishlist Error:", err.response ? err.response.data : err.message);
        }
        
    } catch (err) {
        console.error("Global error:", err);
    } finally {
        process.exit(0);
    }
}

testUserApi();
