const fs = require('fs');
const path = require('path');
const sendEmail = require('./sendEmail');
const { sendOrderWhatsApp } = require('./twilioService');
const { generateInvoicePDF } = require('./invoiceGenerator');

/**
 * Centralized Order Notification Engine
 * Dispatches both Email and WhatsApp notifications to Customer and Admin simultaneously.
 */
const sendAllOrderNotifications = async (order, user) => {
    try {
        const orderId = order._id.toString().slice(-8).toUpperCase();
        const customerName = user?.name || 'Customer';
        const customerEmail = user?.email;
        const totalAmount = order.totalPrice.toLocaleString('en-IN');
        
        // --- PDF GENERATION & SAVING (for WhatsApp mediaUrl) ---
        const invoiceBuffer = await generateInvoicePDF(order);
        const fileName = `Invoice_${orderId}.pdf`;
        const filePath = path.join(__dirname, '..', 'uploads', 'invoices', fileName);
        
        // Ensure directory exists if not already (safeguard)
        const dir = path.join(__dirname, '..', 'uploads', 'invoices');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        
        // Save to filesystem
        fs.writeFileSync(filePath, invoiceBuffer);
        
        // Public URL for WhatsApp media (Twilio needs a public URL)
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
        const invoiceUrl = `${backendUrl}/uploads/invoices/${fileName}`;
        const isLocal = backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1');

        const attachments = [
            {
                filename: `PanditFashion_Invoice_${orderId}.pdf`,
                content: invoiceBuffer
            }
        ];
        
        // 1. DISPATCH WHATSAPP (Only include media if NOT on localhost)
        await sendOrderWhatsApp(order, customerName, isLocal ? null : invoiceUrl);

        // 2. DISPATCH EMAILS
        if (customerEmail) {
            const orderSummary = order.orderItems.map(item => `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: #475569;">${item.name} <small>(x${item.quantity}${item.size ? ', ' + item.size : ''})</small></span>
                    <strong style="color: #1e293b;">₹${(item.price * item.quantity).toLocaleString()}</strong>
                </div>
            `).join('');

            const commonStyle = `
                font-family: 'Inter', -apple-system, sans-serif;
                max-width: 600px;
                margin: 20px auto;
                color: #334155;
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            `;

            const headerStyle = `
                background: #1e3a8a;
                padding: 30px;
                text-align: center;
                color: #ffffff;
            `;

            // CUSTOMER EMAIL
            const customerHtml = `
                <div style="${commonStyle}">
                    <div style="${headerStyle}">
                        <h1 style="margin:0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Order Confirmed! 🛍️</h1>
                        <p style="margin: 10px 0 0; opacity: 0.9;">Thank you for shopping with Pandit Fashion</p>
                    </div>
                    <div style="padding: 30px;">
                        <p style="font-size: 16px; margin-top: 0;">Hi <strong>${customerName}</strong>,</p>
                        <p>Your order has been received and is now being processed. We'll alert you via WhatsApp/Email once it's on the move!</p>
                        
                        <div style="background: #f8fafc; border-radius: 10px; padding: 20px; margin: 25px 0;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
                                <span style="font-size: 12px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Order ID</span>
                                <span style="font-weight: 800; color: #1e3a8a;">#${orderId}</span>
                            </div>
                            ${orderSummary}
                            <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px;">
                                <span style="font-weight: 800; color: #1e293b;">ORDER TOTAL</span>
                                <span style="font-size: 20px; font-weight: 900; color: #1e3a8a;">₹${totalAmount}</span>
                            </div>
                        </div>

                        <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 14px; color: #64748b;">
                            <p style="margin-bottom: 5px;">📍 <strong>Delivery Address:</strong></p>
                            <p style="margin: 0;">${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
                            <p style="margin: 3px 0 0;">${order.shippingAddress.country}, ${order.shippingAddress.postalCode}</p>
                            <p style="margin: 10px 0 0;">📞 <strong>Phone:</strong> ${order.shippingAddress.phone}</p>
                        </div>
                    </div>
                    <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
                        &copy; ${new Date().getFullYear()} Pandit Fashion. All rights reserved.
                    </div>
                </div>
            `;

            await sendEmail({
                email: customerEmail,
                subject: `Order Recieved & Confirmed! #${orderId}`,
                message: `Order Confirmed! Your Order ID is #${orderId}`,
                html: customerHtml,
                attachments: attachments
            });

            // ADMIN EMAIL (Premium Dashboard Alert)
            const adminHtml = `
                <div style="${commonStyle}">
                    <div style="${headerStyle} background: #0f172a;">
                        <h1 style="margin:0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">New Revenue Node 💰</h1>
                        <p style="margin: 10px 0 0; opacity: 0.9;">System Alert: Order Incoming from ${customerName}</p>
                    </div>
                    <div style="padding: 30px;">
                        <div style="background: #fff1f2; border-radius: 10px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #ef4444;">
                            <p style="margin: 0 0 5px; font-size: 11px; font-weight: 800; color: #be123b; text-transform: uppercase; letter-spacing: 1px;">Admin Intel</p>
                            <p style="margin: 0; font-size: 15px; color: #334155; font-weight: 700;">
                                Payment System: <span style="color: #10b981;">${order.isPaid ? 'VERIFIED ✅' : 'PENDING (COD/UPI) ⏳'}</span>
                            </p>
                        </div>
                        
                        <div style="border: 1px solid #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 15px;">
                                <span style="font-size: 12px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Tracking Node</span>
                                <span style="font-weight: 800; color: #1e293b;">#${orderId}</span>
                            </div>
                            ${orderSummary}
                            <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px;">
                                <span style="font-weight: 800; color: #1e293b;">TOTAL REVENUE</span>
                                <span style="font-size: 20px; font-weight: 900; color: #0f172a;">₹${totalAmount}</span>
                            </div>
                        </div>

                        <div style="background: #f8fafc; border-radius: 10px; padding: 20px; font-size: 14px; color: #475569;">
                            <p style="margin-bottom: 10px; font-weight: 800; color: #1e293b;">🌐 Customer Logistics:</p>
                            <p style="margin: 0;">${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
                            <p style="margin: 3px 0 0;">${order.shippingAddress.country}, ${order.shippingAddress.postalCode}</p>
                            <p style="margin: 10px 0 0; color: #1fb954; font-weight: 800;">📞 Signal: ${order.shippingAddress.phone}</p>
                        </div>

                        <a href="${process.env.FRONTEND_URL}/admin/orders" 
                           style="display: block; width: 100%; margin: 30px auto 0; padding: 14px; background: #0f172a; color: #ffffff; text-decoration: none; text-align: center; border-radius: 10px; font-weight: 800; font-size: 15px;">
                           Open Fulfillment Center
                        </a>
                    </div>
                </div>
            `;

            if (process.env.SMTP_EMAIL) {
                await sendEmail({
                    email: process.env.SMTP_EMAIL,
                    subject: `🚨 [SALE] New Order #${orderId} - ₹${totalAmount}`,
                    message: `New Order Alert! Total Revenue: ₹${totalAmount}`,
                    html: adminHtml,
                    attachments: attachments
                });
            }
        }
        
        console.log(`[NotificationEngine] 🌐 Multi-channel broadcast completed for Order #${orderId}`);
    } catch (err) {
        console.error('[NotificationEngine] ❌ Broadcast failure:', err.message);
    }
};

const sendUpdateNotifications = async (order, user, status, updateInfo = null) => {
    try {
        const orderId = order._id.toString().slice(-8).toUpperCase();
        const customerName = user?.name || 'Customer';
        const customerEmail = user?.email;
        const totalAmount = order.totalPrice.toLocaleString('en-IN');

        // 1. DISPATCH WHATSAPP
        await sendOrderUpdateWhatsApp(order, customerName, status, updateInfo);

        // 2. DISPATCH EMAIL
        if (customerEmail) {
            const updateHtml = `
                <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 20px auto; color: #334155; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background: #1e3a8a; padding: 30px; text-align: center; color: #ffffff;">
                        <h1 style="margin:0; font-size: 24px; font-weight: 800;">Order Status Update 🚚</h1>
                    </div>
                    <div style="padding: 30px;">
                        <p>Hi <strong>${customerName}</strong>,</p>
                        <p>Your order <strong>#${orderId}</strong> status has been updated to: <strong>${status}</strong>.</p>
                        <div style="background: #f8fafc; border-radius: 10px; padding: 20px; margin: 25px 0; border-left: 4px solid #1e3a8a;">
                            <p style="margin: 0; font-weight: 800; color: #1e3a8a;">Current Note:</p>
                            <p style="margin: 5px 0 0;">${updateInfo?.message || 'Package is being handled and moving towards your destination.'}</p>
                        </div>
                        <p style="font-size: 14px; color: #64748b;">Total Value: ₹${totalAmount}</p>
                    </div>
                    <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
                        &copy; ${new Date().getFullYear()} Pandit Fashion. All rights reserved.
                    </div>
                </div>
            `;

            await sendEmail({
                email: customerEmail,
                subject: `Order #${orderId} - Status Update: ${status}`,
                message: `Update: Your order #${orderId} is now ${status}`,
                html: updateHtml
            });
        }
        
        console.log(`[NotificationEngine] ✅ Status Update Alert broadcasted for Order #${orderId}`);
    } catch (err) {
        console.error('[NotificationEngine] ❌ Status Update failed:', err.message);
    }
};

module.exports = { 
    sendAllOrderNotifications,
    sendUpdateNotifications
};
