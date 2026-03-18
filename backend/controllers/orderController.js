const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Cart = require('../models/Cart');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { sendOrderWhatsApp } = require('../utils/twilioService');
const { sendAllOrderNotifications, sendUpdateNotifications } = require('../utils/orderNotifications');
const sendEmail = require('../utils/sendEmail');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            discountAmount,
            couponCode
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No order items' 
            });
        }

        const newOrderData = {
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            discountAmount,
            couponCode,
            trackingLog: [{
                status: 'Processing',
                message: 'Order has been placed and is being processed.',
                location: 'Warehouse',
                timestamp: Date.now()
            }]
        };

        let razorpayOrder = null;
        let stripeSession = null;

        // If ONLINE payment (Razorpay)
        if (paymentMethod === 'ONLINE') {
            try {
                const options = {
                    amount: Math.round(totalPrice * 100), // convert to paise
                    currency: 'INR',
                    receipt: `receipt_${Date.now()}`
                };
                razorpayOrder = await razorpay.orders.create(options);
                newOrderData.razorpayOrderId = razorpayOrder.id;
                newOrderData.paymentResult = { id: razorpayOrder.id, status: 'Pending' };
            } catch (err) {
                console.error("Razorpay Order Error:", err);
                return res.status(500).json({ success: false, message: "Failed to initialize Razorpay payment" });
            }
        }

        // Create the order in DB first so we have an ID
        const order = new Order(newOrderData);
        const createdOrder = await order.save();

        // If STRIPE payment
        if (paymentMethod === 'STRIPE') {
            try {
                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: orderItems.map(item => ({
                        price_data: {
                            currency: 'inr',
                            product_data: {
                                name: item.name,
                                images: [item.image.startsWith('http') ? item.image : 'https://ui-avatars.com/api/?name=PF&background=2b5a91&color=fff']
                            },
                            unit_amount: Math.round(item.price * 100),
                        },
                        quantity: item.quantity,
                    })),
                    mode: 'payment',
                    customer_email: req.user.email,
                    shipping_address_collection: {
                        allowed_countries: ['IN'],
                    },
                    automatic_payment_methods: { enabled: true },
                    success_url: `${process.env.FRONTEND_URL || 'http://127.0.0.1:5173'}/payment?orderId=${createdOrder._id}&sessionId={CHECKOUT_SESSION_ID}&gateway=stripe`,
                    cancel_url: `${process.env.FRONTEND_URL || 'http://127.0.0.1:5173'}/checkout`,
                    metadata: {
                        orderId: createdOrder._id.toString()
                    }
                });
                
                // Update order with the session ID
                createdOrder.stripeSessionId = session.id;
                await createdOrder.save();
                stripeSession = session;
            } catch (err) {
                console.error("Stripe Session Error:", err);
                // Rollback order or mark as failed? For now just return error
                return res.status(500).json({ success: false, message: "Failed to initialize Stripe payment session" });
            }
        }

        // Clear cart if it's COD (order finalized immediately)
        if (paymentMethod === 'COD' || paymentMethod === 'UPI') {
            try {
                await Payment.create({
                    user: req.user._id,
                    order: createdOrder._id,
                    gateway: paymentMethod,
                    transactionId: `${paymentMethod}_TXN_${Date.now()}`,
                    amount: createdOrder.totalPrice,
                    status: paymentMethod === 'COD' ? 'Completed' : 'Pending',
                    paidAt: paymentMethod === 'COD' ? Date.now() : null
                });
                await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

                await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

                // Trigger Centralized Notifications (Email + WhatsApp for both sides)
                await sendAllOrderNotifications(createdOrder, req.user);

            } catch (err) {
                console.error("COD Post-Processing Error:", err);
            }
        }

        res.status(201).json({
            success: true,
            data: createdOrder,
            razorpayOrder,
            stripeUrl: stripeSession ? stripeSession.url : null
        });
    } catch (err) {
        console.error('Order creation error:', err);
        res.status(500).json({ 
            success: false, 
            message: err.message || 'Internal server error' 
        });
    }
};

// Logic for payment verification moved to paymentController.js for centralized governance.

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'This order could not be found in our records.' 
            });
        }

        // Security Check: Does the order belong to the logged-in user or an admin?
        const isOwner = req.user && order.user && (order.user._id ? order.user._id.toString() : order.user.toString()) === req.user._id.toString();
        const isAdmin = req.user && req.user.role === 'admin';

        // Enhanced Logic: Allow access if owner, if admin, or if it's an unpaid online order being verified
        if (!isOwner && !isAdmin) {
            // If the order is paid and doesn't belong to the user, strictly deny
            if (order.isPaid) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'You are not authorized to view this finalized order.' 
                });
            }
            // Otherwise, for development and payment verification flow, we permit access via Order ID
        }

        res.status(200).json({ 
            success: true, 
            data: order 
        });
    } catch (err) {
        console.error("GET_ORDER_BY_ID_ERROR:", err.message);
        if (err.name === 'CastError') {
            return res.status(404).json({ 
                success: false, 
                message: 'This order could not be found. Please check your Order ID.' 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: 'Systems encountered an internal error processing your order request.'
        });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ 
            success: true, 
            data: orders 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// @desc    Get all orders (Admin Only)
// @route   GET /api/orders
// @access  Private
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
        res.status(200).json({ 
            success: true, 
            data: orders 
        });
    } catch (err) {
        console.error("ADMIN_ORDERS_FETCH_ERROR:", err);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error fetching all orders' 
        });
    }
};

// @desc    Update order status (Admin Only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, message, location, isRefunded, refundProof, refundProofStatus, refundTransactionId } = req.body;
        const validStatuses = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (status) {
            order.status = status;
            if (status === 'Delivered') {
                order.isDelivered = true;
                order.deliveredAt = Date.now();
            }
        }
        
        if (isRefunded !== undefined && isRefunded !== order.isRefunded) {
            order.isRefunded = isRefunded;
            if (isRefunded) {
                order.refundedAt = Date.now();
            }
        }

        if (refundProof !== undefined) order.refundProof = refundProof;
        if (refundProofStatus !== undefined) order.refundProofStatus = refundProofStatus;
        if (refundTransactionId !== undefined || refundTransactionId === '') order.refundTransactionId = refundTransactionId;

        // Add to tracking log if there's a status change or message
        if (status || message || isRefunded || refundProof) {
            let trackingMsg = message;
            if (!trackingMsg) {
                if (refundProof) trackingMsg = 'Refund proof uploaded by admin.';
                else if (isRefunded) trackingMsg = 'Payment successfully refunded.';
                else trackingMsg = `Order marked as ${status || order.status}`;
            }

            order.trackingLog.push({
                status: status || order.status,
                message: trackingMsg,
                location: location || 'Warehouse',
                timestamp: Date.now()
            });
        }

        const updatedOrder = await order.save();
        
        // Trigger Notifications for Status/Refund Update
        await sendUpdateNotifications(updatedOrder, updatedOrder.user, status || updatedOrder.status, { message, location });

        res.status(200).json({
            success: true,
            data: updatedOrder,
            message: 'Order updated successfully'
        });

    } catch (err) {
        console.error("ADMIN_STATUS_UPDATE_ERROR:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check ownership
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Check if cancellable (Consistent with frontend: Processing and Shipped are cancellable)
        if (['Out for Delivery', 'Delivered', 'Cancelled'].includes(order.status)) {
            return res.status(400).json({ 
                success: false, 
                message: `Order cannot be cancelled. Current status: ${order.status}` 
            });
        }

        order.status = 'Cancelled';
        
        // Add to tracking log
        order.trackingLog.push({
            status: 'Cancelled',
            message: order.isPaid 
                ? 'Order cancelled by user. Refund will be processed into the original payment method within 24 hours.' 
                : 'Order cancelled by user.',
            location: 'System',
            timestamp: Date.now()
        });

        const cancelledOrder = await order.save();
        
        // Trigger Notifications for Cancellation
        await sendUpdateNotifications(cancelledOrder, req.user, 'Cancelled', { 
            message: cancelledOrder.isPaid 
                ? 'Order cancelled. Refund will be processed within 24 hours.' 
                : 'Order cancelled by user.' 
        });

        res.status(200).json({
            success: true,
            data: cancelledOrder,
            message: cancelledOrder.isPaid 
                ? 'Order cancelled. Your payment will be refunded within 24 hours.' 
                : 'Order cancelled successfully.'
        });

    } catch (err) {
        console.error("ORDER_CANCEL_ERROR:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Submit refund proof (User)
// @route   PUT /api/orders/:id/refund-proof
// @access  Private
exports.submitRefundProof = async (req, res) => {
    try {
        const { refundProof } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check ownership
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        order.refundProof = refundProof;
        order.refundProofStatus = 'Pending';
        
        order.trackingLog.push({
            status: order.status,
            message: 'Refund proof submitted by user. Awaiting admin approval.',
            location: 'System',
            timestamp: Date.now()
        });

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Refund proof submitted successfully. Admin will review it shortly.'
        });
    } catch (err) {
        console.error("REFUND_PROOF_SUBMIT_ERROR:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
