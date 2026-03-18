const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Razorpay = require('razorpay');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
const { sendOrderWhatsApp } = require('../utils/twilioService');
const { sendAllOrderNotifications } = require('../utils/orderNotifications');
const sendEmail = require('../utils/sendEmail');
const OrderStatuses = ['Pending', 'Completed', 'Failed', 'Refunded'];

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find({})
            .populate('user', 'name email')
            .populate('order', '_id totalPrice')
            .sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, data: payments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get user's payments
// @route   GET /api/payments/mypayments
exports.getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user._id })
            .populate('order', '_id totalPrice')
            .sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, data: payments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Verify Razorpay Payment & Create Payment Record
exports.verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            const order = await Order.findById(order_id).populate('user', 'name');
            if (order) {
                // Update Order
                order.isPaid = true;
                order.paidAt = Date.now();
                order.razorpayPaymentId = razorpay_payment_id;
                order.paymentResult = { id: razorpay_payment_id, status: 'Success' };
                await order.save();

                // Create Payment Record
                await Payment.create({
                    user: req.user._id,
                    order: order._id,
                    gateway: 'RAZORPAY',
                    transactionId: razorpay_payment_id,
                    amount: order.totalPrice,
                    status: 'Completed',
                    paidAt: Date.now(),
                    paymentDetails: req.body
                });

                // Clear Cart
                await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
                
                await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
                
                // Trigger Centralized Notifications (Email + WhatsApp for both sides)
                await sendAllOrderNotifications(order, order.user);

                return res.status(200).json({ success: true, message: "Razorpay verified and recorded" });
            }
        }
        res.status(400).json({ success: false, message: "Invalid signature" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Verify Stripe Payment & Create Payment Record
exports.verifyStripe = async (req, res) => {
    try {
        const { sessionId, orderId } = req.body;
        console.log(`[STRIPE_VERIFY] Started for Session: ${sessionId}, Order: ${orderId}`);
        
        if (!sessionId || !orderId) {
            return res.status(400).json({ success: false, message: "Missing session or order ID" });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        console.log(`[STRIPE_VERIFY] Session Status: ${session.payment_status}`);

        if (session.payment_status === 'paid') {
            const order = await Order.findById(orderId).populate('user', 'name');
            if (!order) {
                console.error(`[STRIPE_VERIFY] Error: Order ${orderId} not found in database`);
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            // check if already paid to avoid duplicate records
            if (order.isPaid) {
                console.log(`[STRIPE_VERIFY] Order ${orderId} already marked as paid.`);
                return res.status(200).json({ success: true, message: "Already verified" });
            }

            order.isPaid = true;
            order.paidAt = Date.now();
            order.stripePaymentIntentId = session.payment_intent;
            order.paymentResult = { id: session.id, status: 'Success' };
            await order.save();
            console.log(`[STRIPE_VERIFY] Order ${orderId} updated to Paid.`);

            // Create Payment Record
            await Payment.create({
                user: req.user._id,
                order: order._id,
                gateway: 'STRIPE',
                transactionId: session.payment_intent || session.id,
                amount: order.totalPrice,
                status: 'Completed',
                paidAt: Date.now(),
                paymentDetails: session
            });
            console.log(`[STRIPE_VERIFY] Payment record created.`);

            // Clear Cart
            await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
            console.log(`[STRIPE_VERIFY] Cart cleared for user ${req.user._id}`);

            await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
            console.log(`[STRIPE_VERIFY] Cart cleared for user ${req.user._id}`);

            // Trigger Centralized Notifications (Email + WhatsApp for both sides)
            await sendAllOrderNotifications(order, order.user);

            return res.status(200).json({ success: true, message: "Stripe verified and recorded" });
        }
        
        console.warn(`[STRIPE_VERIFY] Payment not paid for session ${sessionId}`);
        res.status(400).json({ success: false, message: "Payment not completed" });
    } catch (err) {
        console.error("[STRIPE_VERIFY] FATAL ERROR:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Initiate Refund (Admin Only)
// @route   POST /api/payments/:id/refund
exports.refundPayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('order');
        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment record not found" });
        }

        if (payment.status === 'Refunded') {
            return res.status(400).json({ success: false, message: "Payment already refunded" });
        }

        let refundResponse = null;

        try {
            if (payment.gateway === 'RAZORPAY') {
                // Razorpay Refund - Using the most robust way
                refundResponse = await razorpay.payments.refund(payment.transactionId, {
                    amount: Math.round(payment.amount * 100), // Full refund in paise
                    notes: { reason: req.body.reason || 'Admin Initiated Refund' }
                });
            } else if (payment.gateway === 'STRIPE') {
                // Stripe Refund
                refundResponse = await stripe.refunds.create({
                    payment_intent: payment.transactionId,
                    amount: Math.round(payment.amount * 100)
                });
            } else if (payment.gateway === 'COD') {
                // Manual Refund for COD
                refundResponse = { status: 'Manual Refund Completed', date: new Date() };
            }
        } catch (gatewayErr) {
            console.error(`[REFUND_GATEWAY_ERROR] Gateway: ${payment.gateway}, TXN: ${payment.transactionId}`, gatewayErr);
            return res.status(gatewayErr.statusCode || 400).json({ 
                success: false, 
                message: gatewayErr.description || gatewayErr.message || "Gateway refund failed",
                error: gatewayErr
            });
        }

        // Update Payment Record
        payment.status = 'Refunded';
        payment.paymentDetails = { ...payment.paymentDetails, refundInfo: refundResponse };
        await payment.save();

        // Update Order
        if (payment.order) {
            const order = await Order.findById(payment.order._id);
            if (order) {
                order.status = 'Cancelled';
                order.isRefunded = true;
                order.refundedAt = Date.now();
                order.trackingLog.push({
                    status: 'Cancelled',
                    message: `Refund Processed: ${req.body.reason || 'Admin action'}`,
                    location: 'System',
                    timestamp: Date.now()
                });
                await order.save();
            }
        }

        res.status(200).json({ 
            success: true, 
            message: "Refund processed successfully", 
            data: refundResponse 
        });
    } catch (err) {
        console.error("REFUND_FATAL_ERROR:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Simulate UPI Intent for direct UPI payments
// @route   POST /api/payments/upi-intent
exports.initiateUPIPay = async (req, res) => {
    try {
        const { amount, orderId } = req.body;
        
        // This simulates a UPI deep link or QR generation
        // In reality, Razorpay handles this, but we can provide a direct UPI ID flow
        const upiId = process.env.BUSINESS_UPI_ID || "paytmqr28100505010115l99p6o7z01@paytm";
        const businessName = "Pandit Fashion";
        
        // standard UPI deep link format: upi://pay?pa=ID&pn=NAME&am=AMOUNT&cu=INR
        const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(businessName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Order ' + orderId)}`;

        res.status(200).json({
            success: true,
            upiId: upiId,
            upiLink: upiLink,
            message: "Direct UPI payment intent generated"
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
