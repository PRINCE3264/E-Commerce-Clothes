const PDFDocument = require('pdfkit');

/**
 * Generates a Premium, high-end PDF invoice matching the "Luxury Boutique" aesthetic.
 * This includes badges, formatted columns, and a refined color palette.
 */
const generateInvoicePDF = (order) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40, size: 'A4' });
            let buffers = [];
            
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            const orderId = order._id.toString().toUpperCase();
            const accentBlue = "#1e3a8a"; // Pandit Fashion Blue
            const textDark = "#1e293b";
            const textMuted = "#64748b";
            const bgLight = "#f8fafc";
            const statusGreen = "#10b981";

            // 1. --- TOP HEADER REGION ---
            doc.fillColor(accentBlue).font('Helvetica-Bold').fontSize(26).text("PANDIT FASHION", 50, 50);
            doc.fillColor(textMuted).font('Helvetica').fontSize(10).text("Premium Luxury Apparel Boutique", 50, 82);
            doc.fontSize(8).text(`Order ID: #${orderId}`, 50, 96);
            
            // Right-side Info
            doc.fillColor(textDark).font('Helvetica-Bold').fontSize(16).text("OFFICIAL INVOICE", 380, 50, { align: 'right' });
            doc.fillColor(textMuted).font('Helvetica').fontSize(10).text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 380, 72, { align: 'right' });
            
            // Status Badge (Paid Entirely / Pending Payment)
            const statusText = order.isPaid ? 'PAID ENTIRELY' : 'PAYMENT PENDING';
            const badgeWidth = 100;
            const badgeX = 550 - badgeWidth;
            doc.fillColor(order.isPaid ? statusGreen : "#f59e0b")
               .rect(badgeX, 90, badgeWidth, 18, 4) // Rounded rectangle emulation
               .fill();
            doc.fillColor("#ffffff").font('Helvetica-Bold').fontSize(8).text(statusText, badgeX, 95, { width: badgeWidth, align: 'center' });

            // Horizontal Separator
            doc.moveTo(50, 118).lineTo(550, 118).strokeColor("#cbd5e1").lineWidth(1).stroke();

            // 2. --- BILLING & SHIPPING DESTINATION BLOCKS ---
            const boxY = 140;
            const boxWidth = 240;
            const boxHeight = 100;

            // Billing Box
            doc.fillColor(bgLight).rect(50, boxY, boxWidth, boxHeight).fill();
            doc.fillColor(accentBlue).font('Helvetica-Bold').fontSize(10).text("BILLING TO:", 65, boxY + 15);
            doc.fillColor(textDark).fontSize(11).text(order.user?.name || "Premium Client", 65, boxY + 35);
            doc.fillColor(textMuted).fontSize(9).text(order.user?.email || "", 65, boxY + 50);
            doc.text(`Ph: +91 ${order.shippingAddress.phone}`, 65, boxY + 65);

            // Shipping Box
            doc.fillColor(bgLight).rect(310, boxY, boxWidth, boxHeight).fill();
            doc.fillColor(accentBlue).font('Helvetica-Bold').fontSize(10).text("SHIPPING DESTINATION:", 325, boxY + 15);
            doc.fillColor(textDark).fontSize(11).text(`${order.shippingAddress.city}, India`, 325, boxY + 35);
            doc.fillColor(textMuted).fontSize(9).text(order.shippingAddress.address, 325, boxY + 50, { width: boxWidth - 30 });
            doc.text(`${order.shippingAddress.country} - ${order.shippingAddress.postalCode}`, 325, boxY + 75);

            // 3. --- PRODUCT LISTINGS TABLE ---
            const tableTop = 270;
            doc.fillColor(accentBlue).rect(50, tableTop, 500, 30).fill();
            
            doc.fillColor("#ffffff").font('Helvetica-Bold').fontSize(9);
            doc.text("ITEM DESCRIPTION", 65, tableTop + 11);
            doc.text("PRICE", 380, tableTop + 11);
            doc.text("QTY", 450, tableTop + 11);
            doc.text("TOTAL", 500, tableTop + 11);

            let currentY = tableTop + 40;
            order.orderItems.forEach((item) => {
                doc.fillColor(textDark).font('Helvetica-Bold').fontSize(10).text(item.name, 65, currentY);
                doc.fillColor(textMuted).font('Helvetica').fontSize(8).text(`Size: ${item.size} | Color: ${item.color || 'Default'}`, 65, currentY + 12);
                
                doc.fillColor(textDark).font('Helvetica').fontSize(9).text(`₹${item.price.toLocaleString()}`, 380, currentY + 5);
                doc.text(item.quantity.toString(), 450, currentY + 5);
                doc.font('Helvetica-Bold').text(`₹${(item.price * item.quantity).toLocaleString()}`, 500, currentY + 5);
                
                currentY += 40;
                doc.moveTo(50, currentY - 5).lineTo(550, currentY - 5).strokeColor("#f1f5f9").stroke();
            });

            // 4. --- TOTALS SUMMARY ---
            const summaryX = 350;
            doc.fillColor(textMuted).font('Helvetica').fontSize(10).text("Subtotal:", summaryX, currentY + 20);
            doc.fillColor(textDark).text(`₹${order.itemsPrice.toLocaleString()}`, 500, currentY + 20);
            
            doc.fillColor(textMuted).text("Shipping Charge:", summaryX, currentY + 35);
            doc.fillColor(textDark).text(`₹${order.shippingPrice.toLocaleString()}`, 500, currentY + 35);

            doc.fillColor(accentBlue).font('Helvetica-Bold').fontSize(12).text("TOTAL AMOUNT:", summaryX, currentY + 60);
            doc.fontSize(14).text(`₹${order.totalPrice.toLocaleString()}`, 490, currentY + 60);

            // Final Footer
            doc.fillColor(textMuted).fontSize(8).text("Thank you for choosing Pandit Fashion. Expect delivery within 3-5 business days.", 50, 780, { align: 'center' });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { generateInvoicePDF };
