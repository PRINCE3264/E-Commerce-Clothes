const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Cart = require('../models/Cart');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { sendOrderWhatsApp } = require('../utils/twilioService');
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
            totalPrice
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
            totalPrice
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
        if (paymentMethod === 'COD') {
            try {
                await Payment.create({
                    user: req.user._id,
                    order: createdOrder._id,
                    gateway: 'COD',
                    transactionId: `COD_TXN_${Date.now()}`,
                    amount: createdOrder.totalPrice,
                    status: 'Completed',
                    paidAt: null
                });
                await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

                // Send WhatsApp Notification for COD
                await sendOrderWhatsApp(
                    createdOrder,
                    req.user ? req.user.name : 'Customer'
                );

                // Send Email Notification for COD
                const orderSummary = createdOrder.orderItems.map(item => `${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}`).join('<br>');
                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e2e8f0; border-top: 6px solid #1e3a5f; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #1e3a5f; margin-top: 0;">Order Confirmed! 🛍️</h2>
                        <p>Hi <strong>${req.user.name}</strong>,</p>
                        <p>Thank you for shopping with Pandit Fashion. Your order has been placed successfully.</p>
                        <hr style="border: 0; border-top: 1px solid #eee;">
                        <p><strong>Order ID:</strong> #${createdOrder._id.toString().slice(-8).toUpperCase()}</p>
                        <p><strong>Payment Method:</strong> ${createdOrder.paymentMethod}</p>
                        <p><strong>Order Total:</strong> ₹${createdOrder.totalPrice.toLocaleString()}</p>
                        <hr style="border: 0; border-top: 1px solid #eee;">
                        <h3>Items Ordered:</h3>
                        <div style="background: #f8fafc; padding: 15px; border-radius: 6px;">
                            ${orderSummary}
                        </div>
                        <p style="margin-top: 20px;">We'll notify you once your order is shipped!</p>
                        <p style="color: #64748b; font-size: 0.9rem;">&copy; ${new Date().getFullYear()} Pandit Fashion. All rights reserved.</p>
                    </div>
                `;

                await sendEmail({
                    email: req.user.email,
                    subject: `Order Confirmed - #${createdOrder._id.toString().slice(-8).toUpperCase()}`,
                    message: `Order Confirmed! Your Order ID is #${createdOrder._id.toString().slice(-8).toUpperCase()}`,
                    html: emailHtml
                });

                // ALSO SEND TO ADMIN
                await sendEmail({
                    email: process.env.SMTP_EMAIL,
                    subject: `🚨 New Order Received! #${createdOrder._id.toString().slice(-8).toUpperCase()}`,
                    message: `New Order Received! Customer: ${req.user.name}`,
                    html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e2e8f0; border-top: 6px solid #ef4444; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #ef4444; margin-top: 0;">New Order Alert! 🔔</h2>
                        <p>A new order has been placed by <strong>${req.user.name}</strong>.</p>
                        <hr style="border: 0; border-top: 1px solid #eee;">
                        <p><strong>Order ID:</strong> #${createdOrder._id.toString().slice(-8).toUpperCase()}</p>
                        <p><strong>Payment:</strong> ${createdOrder.paymentMethod}</p>
                        <p><strong>Total Amount:</strong> ₹${createdOrder.totalPrice.toLocaleString()}</p>
                        <hr style="border: 0; border-top: 1px solid #eee;">
                        <p>Please check the admin dashboard for fulfillment.</p>
                    </div>`
                });

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
        res.status(err.name === 'CastError' ? 400 : 500).json({ 
            success: false, 
            message: err.name === 'CastError' ? 'The provided Order ID is invalid.' : 'Systems encountered an internal error processing your order request.'
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
        const { status, message, location } = req.body;
        const validStatuses = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.status = status;
        
        if (status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        // Add to tracking log
        order.trackingLog.push({
            status,
            message: message || `Order marked as ${status}`,
            location: location || 'Warehouse',
            timestamp: Date.now()
        });

        const updatedOrder = await order.save();

        res.status(200).json({
            success: true,
            data: updatedOrder,
            message: `Order status updated to ${status}`
        });

    } catch (err) {
        console.error("ADMIN_STATUS_UPDATE_ERROR:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
