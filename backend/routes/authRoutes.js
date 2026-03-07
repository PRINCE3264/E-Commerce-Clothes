const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    adminLogin, 
    getMe, 
    updateProfile, 
    forgotPassword, 
    resetPassword,
    verifyOTP,
    googleAuthUrl,
    googleAuthCallback
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Google OAuth
router.get('/google/url', googleAuthUrl);
router.get('/google/callback', googleAuthCallback);

module.exports = router;
