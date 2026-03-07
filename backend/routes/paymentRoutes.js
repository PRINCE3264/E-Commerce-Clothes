const express = require('express');
const router = express.Router();
const { 
    getAllPayments, 
    getMyPayments, 
    verifyRazorpay, 
    verifyStripe 
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), getAllPayments);
router.get('/mypayments', protect, getMyPayments);
router.post('/verify-razorpay', protect, verifyRazorpay);
router.post('/verify-stripe', protect, verifyStripe);

module.exports = router;
