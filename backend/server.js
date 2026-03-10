const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Standard Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Configure Allowed Origins for CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://e-commerce-clothes-xlzx.onrender.com',
    process.env.FRONTEND_URL,
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            console.error(`CORS Blocked for origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposedHeaders: ['set-cookie', 'x-rtb-fingerprint-id', 'x-razorpay-signature']
}));

// Added to resolve Permissions Policy and Accelerator warnings
app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'accelerometer=(self), payment=(self), camera=(), microphone=()');
    next();
});

// Internal Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const contactRoutes = require('./routes/contactRoutes');
const blogRoutes = require('./routes/blogRoutes');
const variantRoutes = require('./routes/variantRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const chatRoutes = require('./routes/chatRoutes');
const socketHandler = require('./utils/socketHandler');

// Registry mounting
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);

// Static assets (Uploads folder)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health-check endpoint
app.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'API Core Online: Pandit Shop Backend v1.0.0' });
});

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend Engine running in ${process.env.NODE_ENV} mode on Port ${PORT}`);
});

// Initialize Socket.io
socketHandler(server);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:", err.stack);
    res.status(500).json({ 
        success: false, 
        message: err.message || 'Internal Server Error' 
    });
});

// Handling Unhandled Rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Error Rejection Shutdown: ${err.message}`);
    server.close(() => process.exit(1));
});
