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
    changePassword,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
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
router.post('/change-password', protect, changePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.post('/address', protect, addAddress);
router.put('/address/:id', protect, updateAddress);
router.delete('/address/:id', protect, deleteAddress);
router.put('/address/default/:id', protect, setDefaultAddress);

router.post('/payment-method', protect, addPaymentMethod);
router.delete('/payment-method/:id', protect, deletePaymentMethod);
router.put('/payment-method/default/:id', protect, setDefaultPaymentMethod);

// Google OAuth
router.get('/google/url', googleAuthUrl);
router.get('/google/callback', googleAuthCallback);

module.exports = router;
