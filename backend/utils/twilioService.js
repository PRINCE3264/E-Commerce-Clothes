/**
 * Twilio WhatsApp Notification Service
 * Sends professional order confirmation messages to customers and admin.
 */

const sendOrderWhatsApp = async (order, customerName, mediaUrl = null) => {
    try {
        // Guard: skip if Twilio credentials are not configured
        if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_WHATSAPP_NUMBER) {
            console.log('[Twilio] Skipped: credentials not configured.');
            return;
        }

        const twilio = require('twilio');
        const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

        // Format Phone
        let phone = (order.shippingAddress?.phone || '').toString().replace(/\D/g, '');
        if (phone.length === 10) phone = `+91${phone}`;
        else if (!phone.startsWith('+')) phone = `+${phone}`;

        const orderId = order._id.toString().slice(-8).toUpperCase();
        const totalAmount = order.totalPrice?.toLocaleString('en-IN') || '0';
        const paymentMethod = order.paymentMethod || 'N/A';
        const city = order.shippingAddress?.city || '';
        const postalCode = order.shippingAddress?.postalCode || '';

        // Build product summary (max 3 items)
        const itemLines = (order.orderItems || []).slice(0, 3).map(item => {
            const qty = item.quantity || 1;
            const name = item.name || 'Product';
            const size = item.size ? ` (${item.size})` : '';
            const price = (item.price * qty).toLocaleString('en-IN');
            return `  • ${name}${size} × ${qty}  →  ₹${price}`;
        }).join('\n');

        const moreItems = (order.orderItems || []).length > 3
            ? `\n  + ${order.orderItems.length - 3} more item(s)...`
            : '';

        // ─────────────────────────────────────────────
        //  CUSTOMER MESSAGE
        // ─────────────────────────────────────────────
        const customerMsg =
`🛍️ *Order Confirmed — Pandit Fashion*

Hi *${customerName}*! Your order has been placed successfully. ✅

━━━━━━━━━━━━━━━━━━
🔖 *Order ID:* #${orderId}
📅 *Date:* ${new Date(order.createdAt).toLocaleDateString()}
💳 *Payment:* ${paymentMethod}
💰 *Total Paid:* ₹${totalAmount}
━━━━━━━━━━━━━━━━━━

📦 *Items Ordered:*
${itemLines}${moreItems}

📍 *Delivery To:*
${order.shippingAddress?.address}, ${city}, ${order.shippingAddress?.country} - ${postalCode}

━━━━━━━━━━━━━━━━━━
We'll notify you once your order is shipped! 🚚
Thank you for shopping with *Pandit Fashion* 🙏`;

        // ─────────────────────────────────────────────
        //  ADMIN MESSAGE
        // ─────────────────────────────────────────────
        const adminMsg =
`🔔 *New Order Received!*

━━━━━━━━━━━━━━━━━━
👤 *Customer:* ${customerName}
📞 *Phone:* ${phone}
🔖 *Order ID:* #${orderId}
💳 *Payment:* ${paymentMethod}
💰 *Amount:* ₹${totalAmount}
━━━━━━━━━━━━━━━━━━

📦 *Items:*
${itemLines}${moreItems}

📍 *Ship To:* ${order.shippingAddress?.address}, ${city}, ${order.shippingAddress?.country} - ${postalCode}
━━━━━━━━━━━━━━━━━━
⚡ Action required: Process & dispatch.`;

        // Send to Customer (WhatsApp)
        const customerPayload = {
            body: customerMsg,
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${phone}`
        };
        if (mediaUrl) customerPayload.mediaUrl = [mediaUrl];
        
        await client.messages.create(customerPayload);

        // Send to Customer (Regular SMS fallback/additional)
        try {
            await client.messages.create({
                body: `Order Confirmed! Your Order #${orderId} for ₹${totalAmount} has been placed. Thank you for shopping with Pandit Fashion!`,
                from: process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_WHATSAPP_NUMBER.replace('whatsapp:', ''),
                to: phone
            });
        } catch (smsErr) {
            console.log('[Twilio] SMS skip/fail (likely no SMS number configured):', smsErr.message);
        }

        // Send to Admin (if configured)
        if (process.env.ADMIN_WHATSAPP_NUMBER) {
            const adminPayload = {
                body: adminMsg,
                from: process.env.TWILIO_WHATSAPP_NUMBER,
                to: process.env.ADMIN_WHATSAPP_NUMBER
            };
            if (mediaUrl) adminPayload.mediaUrl = [mediaUrl];
            
            await client.messages.create(adminPayload);
        }

        console.log(`[Twilio] ✅ Notifications sent for order #${orderId}`);
    } catch (error) {
        // Never crash the order flow due to notification failure
        console.error('[Twilio] ❌ Failed to send WhatsApp message:', error.message);
    }
};

const sendOrderUpdateWhatsApp = async (order, customerName, status, updateInfo = null) => {
    try {
        if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_WHATSAPP_NUMBER) return;

        const twilio = require('twilio');
        const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

        let phone = (order.shippingAddress?.phone || '').toString().replace(/\D/g, '');
        if (phone.length === 10) phone = `+91${phone}`;
        else if (!phone.startsWith('+')) phone = `+${phone}`;

        const orderId = order._id.toString().slice(-8).toUpperCase();
        const totalAmount = order.totalPrice?.toLocaleString('en-IN') || '0';
        
        let statusEmoji = '📦';
        if (status === 'Shipped') statusEmoji = '🚚';
        if (status === 'Out for Delivery') statusEmoji = '🛵';
        if (status === 'Delivered') statusEmoji = '✅';
        if (status === 'Cancelled') statusEmoji = '❌';

        // CUSTOMER UPDATE MESSAGE
        const customerMsg = 
`${statusEmoji} *Order Update — Pandit Fashion*

Hi *${customerName}*, your order *#${orderId}* status has been updated to: *${status}*.

━━━━━━━━━━━━━━━━━━
📍 *Current Status:* ${status}
🏢 *Location:* ${updateInfo?.location || 'Processing Center'}
✉️ *Note:* ${updateInfo?.message || 'We are making progress on your order!'}
━━━━━━━━━━━━━━━━━━

Order Total: ₹${totalAmount}
Thank you for your patience! 🙏`;

        // ADMIN UPDATE MESSAGE
        const adminMsg = 
`🔔 *Order Status Modified*

🔖 *Order:* #${orderId}
👤 *User:* ${customerName}
🔄 *New Status:* ${status}
━━━━━━━━━━━━━━━━━━
Message: ${updateInfo?.message || 'N/A'}
Financials: ₹${totalAmount}`;

        // Send to Customer
        await client.messages.create({
            body: customerMsg,
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${phone}`
        });

        // Send to Admin
        if (process.env.ADMIN_WHATSAPP_NUMBER) {
            await client.messages.create({
                body: adminMsg,
                from: process.env.TWILIO_WHATSAPP_NUMBER,
                to: process.env.ADMIN_WHATSAPP_NUMBER
            });
        }

        console.log(`[Twilio] ✅ Update notification sent for #${orderId} - ${status}`);
    } catch (err) {
        console.error('[Twilio] ❌ Update notification failed:', err.message);
    }
};

module.exports = { 
    sendOrderWhatsApp,
    sendOrderUpdateWhatsApp 
};
