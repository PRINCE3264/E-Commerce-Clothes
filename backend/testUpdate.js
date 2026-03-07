const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

const test = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne();
    if (!user) return console.log("No user");
    
    try {
        const u = await User.findByIdAndUpdate(user.id, { cart: [] }, { new: true });
        console.log("Success updated cart", typeof u);
    } catch(err) {
        console.error("Error updating user:", err.message);
    }
    
    process.exit(0);
};
test();
