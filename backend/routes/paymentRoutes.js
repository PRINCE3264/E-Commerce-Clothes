const express = require('express');
const router = express.Router();
const { 
    getAllPayments, 
    getMyPayments, 
    verifyRazorpay, 
    verifyStripe,
    refundPayment,
    initiateUPIPay
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), getAllPayments);
router.get('/mypayments', protect, getMyPayments);
router.post('/verify-razorpay', protect, verifyRazorpay);
router.post('/verify-stripe', protect, verifyStripe);
router.post('/:id/refund', protect, authorize('admin'), refundPayment);
router.post('/upi-intent', protect, initiateUPIPay);

module.exports = router;
