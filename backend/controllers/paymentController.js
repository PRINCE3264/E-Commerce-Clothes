const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Razorpay = require('razorpay');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
const { sendOrderWhatsApp } = require('../utils/twilioService');
const sendEmail = require('../utils/sendEmail');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Get all payments (Admin Only)
// @route   GET /api/payments
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
                
                // Send WhatsApp Notification
                await sendOrderWhatsApp(
                    order,
                    order.user ? order.user.name : 'Customer'
                );

                // Send Email Notification
                if (order.user && order.user.email) {
                    const orderSummary = order.orderItems.map(item => `${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}`).join('<br>');
                    const emailHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e2e8f0; border-top: 6px solid #1e3a5f; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #1e3a5f; margin-top: 0;">Order Confirmed! 🛍️</h2>
                        <p>Hi <strong>${order.user.name}</strong>,</p>
                        <p>Thank you for shopping with Pandit Fashion. Your payment was successful and your order has been finalized.</p>
                        <hr style="border: 0; border-top: 1px solid #eee;">
                        <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
                        <p><strong>Payment Status:</strong> PAID (Razorpay)</p>
                        <p><strong>Transaction ID:</strong> ${razorpay_payment_id}</p>
                        <p><strong>Order Total:</strong> ₹${order.totalPrice.toLocaleString()}</p>
                        <hr style="border: 0; border-top: 1px solid #eee;">
                        <h3>Items Ordered:</h3>
                        <div style="background: #f8fafc; padding: 15px; border-radius: 6px;">
                            ${orderSummary}
                        </div>
                        <p style="margin-top: 20px;">We'll notify you once your order is shipped!</p>
                        <p style="color: #64748b; font-size: 0.9rem;">&copy; ${new Date().getFullYear()} Pandit Fashion. All rights reserved.</p>
                    </div>`;

                    await sendEmail({
                        email: order.user.email,
                        subject: `Order Confirmation & Receipt - #${order._id.toString().slice(-8).toUpperCase()}`,
                        message: `Order Confirmed! Your Order ID is #${order._id.toString().slice(-8).toUpperCase()}`,
                        html: emailHtml
                    });

                    // ALSO SEND TO ADMIN
                    await sendEmail({
                        email: process.env.SMTP_EMAIL,
                        subject: `🚨 New Order Received! #${order._id.toString().slice(-8).toUpperCase()}`,
                        message: `New Order Received via RAZORPAY! Customer: ${order.user.name}`,
                        html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e2e8f0; border-top: 6px solid #ef4444; padding: 20px; border-radius: 8px;">
                            <h2 style="color: #ef4444; margin-top: 0;">Online Order Alert! 💰</h2>
                            <p>A new order has been paid via <strong>Razorpay</strong> by <strong>${order.user.name}</strong>.</p>
                            <hr style="border: 0; border-top: 1px solid #eee;">
                            <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
                            <p><strong>Payment Status:</strong> PAID (Verified)</p>
                            <p><strong>Total Amount:</strong> ₹${order.totalPrice.toLocaleString()}</p>
                            <hr style="border: 0; border-top: 1px solid #eee;">
                            <p>Please check the admin dashboard for fulfillment.</p>
                        </div>`
                    });
                }

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

            // Send WhatsApp Notification
            await sendOrderWhatsApp(
                order,
                order.user ? order.user.name : 'Customer'
            );

            // Send Email Notification
            if (order.user && order.user.email) {
                const orderSummary = order.orderItems.map(item => `${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}`).join('<br>');
                const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e2e8f0; border-top: 6px solid #1e3a5f; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #1e3a5f; margin-top: 0;">Order Confirmed! 🛍️</h2>
                    <p>Hi <strong>${order.user.name}</strong>,</p>
                    <p>Thank you for shopping with Pandit Fashion. Your payment was successful and your order has been finalized.</p>
                    <hr style="border: 0; border-top: 1px solid #eee;">
                    <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
                    <p><strong>Payment Status:</strong> PAID (Stripe)</p>
                    <p><strong>Session ID:</strong> ${sessionId}</p>
                    <p><strong>Order Total:</strong> ₹${order.totalPrice.toLocaleString()}</p>
                    <hr style="border: 0; border-top: 1px solid #eee;">
                    <h3>Items Ordered:</h3>
                    <div style="background: #f8fafc; padding: 15px; border-radius: 6px;">
                        ${orderSummary}
                    </div>
                    <p style="margin-top: 20px;">We'll notify you once your order is shipped!</p>
                    <p style="color: #64748b; font-size: 0.9rem;">&copy; ${new Date().getFullYear()} Pandit Fashion. All rights reserved.</p>
                </div>`;

                await sendEmail({
                    email: order.user.email,
                    subject: `Order Confirmation & Receipt - #${order._id.toString().slice(-8).toUpperCase()}`,
                    message: `Order Confirmed! Your Order ID is #${order._id.toString().slice(-8).toUpperCase()}`,
                    html: emailHtml
                });

                // ALSO SEND TO ADMIN
                await sendEmail({
                    email: process.env.SMTP_EMAIL,
                    subject: `🚨 New Order Received! #${order._id.toString().slice(-8).toUpperCase()}`,
                    message: `New Order Received via STRIPE! Customer: ${order.user.name}`,
                    html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e2e8f0; border-top: 6px solid #ef4444; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #ef4444; margin-top: 0;">Online Order Alert! 💰</h2>
                        <p>A new order has been paid via <strong>Stripe (Global)</strong> by <strong>${order.user.name}</strong>.</p>
                        <hr style="border: 0; border-top: 1px solid #eee;">
                        <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
                        <p><strong>Payment Status:</strong> PAID (Verified)</p>
                        <p><strong>Total Amount:</strong> ₹${order.totalPrice.toLocaleString()}</p>
                        <hr style="border: 0; border-top: 1px solid #eee;">
                        <p>Please check the admin dashboard for fulfillment.</p>
                    </div>`
                });
            }

            return res.status(200).json({ success: true, message: "Stripe verified and recorded" });
        }
        
        console.warn(`[STRIPE_VERIFY] Payment not paid for session ${sessionId}`);
        res.status(400).json({ success: false, message: "Payment not completed" });
    } catch (err) {
        console.error("[STRIPE_VERIFY] FATAL ERROR:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
