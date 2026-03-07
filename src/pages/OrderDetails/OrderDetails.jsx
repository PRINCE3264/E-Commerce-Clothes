/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ChevronLeft, 
    Printer, 
    Package, 
    Truck, 
    CheckCircle, 
    MapPin, 
    CreditCard, 
    Phone, 
    User,
    Calendar,
    Clock,
    AlertCircle,
    Loader,
    Shirt,
    IndianRupee,
    Download,
    FileText,
    ShoppingCart,
    CircleCheck,
    Navigation,
    Activity,
    MessageCircle,
    Send
} from 'lucide-react';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import API from '../../utils/api';
import './OrderDetails.css';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('admin_token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchOrder = async () => {
            try {
                const res = await API.get(`/orders/${id}`);
                if (res.data.success) {
                    setOrder(res.data.data);
                }
            } catch (err) {
                console.error("Error fetching order details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder(id);
    }, [id, navigate]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return '#10b981';
            case 'Out for Delivery': return '#8b5cf6';
            case 'Shipped': return '#3b82f6';
            case 'Processing': return '#f59e0b';
            case 'Cancelled': return '#ef4444';
            default: return '#64748b';
        }
    };

    const handleDownloadPDF = async () => {
        if (!order) return;
        const now = new Date();
        const timeStr = now.toLocaleDateString() + ' at ' + now.toLocaleTimeString();
        
        const element = document.getElementById('invoice-pdf-template');
        const timeElement = document.getElementById('pdf-gen-time');
        if (timeElement) timeElement.innerText = `Invoice Generated On: ${timeStr}`;
        
        element.style.display = 'block';
        
        try {
            const canvas = await html2canvas(element, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                allowTaint: true
            });
            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
            pdf.save(`Pandit_Fashion_Invoice_${order._id.substring(0, 8)}.pdf`);
        } catch (err) {
            console.error("PDF generation failed:", err);
            alert("Could not generate PDF. Please try again.");
        } finally {
            element.style.display = 'none';
        }
    };

    const handleWhatsAppShare = () => {
        if (!order) return;

        const orderId = order._id.toUpperCase();
        const date = new Date(order.createdAt).toLocaleDateString();
        const status = order.status;
        const total = order.totalPrice.toLocaleString();
        
        let itemsList = "";
        order.orderItems.forEach(item => {
            itemsList += `• ${item.name} (${item.size}, Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toLocaleString()}\n`;
        });

        const message = 
`🛍️ *PANDIT FASHION - ORDER DETAILS* 🛍️

Hello! Here are the details for Order: *#${orderId}*

📅 *Date:* ${date}
📦 *Status:* ${status}

*━━━━━━━━━━━━━━━━━━*
🛍️ *ITEMS:*
${itemsList}
*━━━━━━━━━━━━━━━━━━*
💳 *PAYMENT SUMMARY:*
Subtotal: ₹${order.itemsPrice.toLocaleString()}
Shipping: ${order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice.toLocaleString()}`}
Tax (GST): ₹${order.taxPrice.toLocaleString()}
💰 *Total Amount: ₹${total}*

🚚 *SHIPPING ADDRESS:*
${order.user?.name || 'Customer'}
${order.shippingAddress.address}, ${order.shippingAddress.city}
${order.shippingAddress.postalCode}, ${order.shippingAddress.country}

Thank you for shopping with us!
📍 *Shop at:* www.panditfashion.com`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    if (loading) return (
        <motion.div 
            className="order-details-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <Loader size={48} className="spin" />
            <p>Loading your order details...</p>
        </motion.div>
    );

    if (!order) return (
        <motion.div 
            className="order-details-error container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <AlertCircle size={60} color="#ef4444" />
            <h2>Order Not Found</h2>
            <p>We couldn't locate the order you're looking for. It may have been deleted or the ID is incorrect.</p>
            <Link to="/my-orders" className="back-link">Return to My Orders</Link>
        </motion.div>
    );

    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6, staggerChildren: 0.1, ease: "easeOut" }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="order-details-page">
            <motion.div 
                className="container"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="order-details-header">
                    <button className="btn-back" onClick={() => navigate('/my-orders')}>
                        <ChevronLeft size={20} /> BACK TO ORDERS
                    </button>
                    <h1>Order Details & Tracking</h1>
                    <div className="order-meta-summary">
                        <span className="order-id"># {order._id.toUpperCase()}</span>
                        <span className="order-date"><Calendar size={14}/> {new Date(order.createdAt).toLocaleDateString()}</span>
                        <div className="order-actions-wrap">
                            <div className="print-action" onClick={() => window.print()}>
                                <Printer size={16} /> <span>Print</span>
                            </div>
                            <div className="download-action" onClick={handleDownloadPDF}>
                                <Download size={16} /> <span>Invoice PDF</span>
                            </div>
                            <div className="whatsapp-action" onClick={handleWhatsAppShare}>
                                <MessageCircle size={16} /> <span>WhatsApp Share</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="order-details-layout" id="order-printable-section">
                    <motion.div className="order-main-view" variants={itemVariants}>
                        <div className="track-status-advanced glass-panel shadow-premium">
                            <div className="track-status-line">
                                <div className="line-fill" style={{ 
                                    width: order.status === 'Delivered' ? '100%' : (order.status === 'Out for Delivery' ? '75%' : (order.status === 'Shipped' ? '40%' : '0%')),
                                    background: getStatusColor(order.status)
                                }}></div>
                            </div>
                            
                            <div className="track-step active">
                                <div className="step-point-with-icon" style={{color: '#fff', background: '#2b5a91', boxShadow: '0 0 20px rgba(43, 90, 145, 0.4)'}}>
                                    <ShoppingCart size={22} />
                                </div>
                                <div className="step-text">
                                    <span className="s-label">Confirmed</span>
                                    <span className="s-time">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>

                            <div className={`track-step ${['Shipped', 'Delivered'].includes(order.status) ? 'active' : ''}`}>
                                <div className="step-point-with-icon" style={{
                                    color: ['Shipped', 'Delivered'].includes(order.status) ? '#fff' : '#94a3b8',
                                    background: ['Shipped', 'Delivered'].includes(order.status) ? '#3b82f6' : '#e2e8f0',
                                    boxShadow: ['Shipped', 'Delivered'].includes(order.status) ? '0 0 20px rgba(59, 130, 246, 0.4)' : 'none'
                                }}>
                                    <Truck size={22} />
                                </div>
                                <div className="step-text">
                                    <span className="s-label">Shipped</span>
                                    <span className="s-time">{order.status === 'Shipped' ? 'In Transit' : (order.status === 'Delivered' ? 'Completed' : 'Pending')}</span>
                                </div>
                            </div>

                            <div className={`track-step ${['Out for Delivery', 'Delivered'].includes(order.status) ? 'active' : ''}`}>
                                <div className="step-point-with-icon" style={{
                                    color: ['Out for Delivery', 'Delivered'].includes(order.status) ? '#fff' : '#94a3b8',
                                    background: ['Out for Delivery', 'Delivered'].includes(order.status) ? '#8b5cf6' : '#e2e8f0',
                                    boxShadow: ['Out for Delivery', 'Delivered'].includes(order.status) ? '0 0 20px rgba(139, 92, 246, 0.4)' : 'none'
                                }}>
                                    <Navigation size={22} />
                                </div>
                                <div className="step-text">
                                    <span className="s-label">Out for Delivery</span>
                                    <span className="s-time">{order.status === 'Out for Delivery' ? 'Arriving Today' : (order.status === 'Delivered' ? 'Completed' : 'Pending')}</span>
                                </div>
                            </div>

                            <div className={`track-step ${order.status === 'Delivered' ? 'active' : ''}`}>
                                <div className="step-point-with-icon" style={{
                                    color: order.status === 'Delivered' ? '#fff' : '#94a3b8',
                                    background: order.status === 'Delivered' ? '#10b981' : '#e2e8f0',
                                    boxShadow: order.status === 'Delivered' ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none'
                                }}>
                                    <Package size={22} />
                                </div>
                                <div className="step-text">
                                    <span className="s-label">Delivered</span>
                                    <span className="s-time">{order.status === 'Delivered' ? 'Package Arrived' : 'Awaiting Delivery'}</span>
                                </div>
                            </div>
                        </div>

                        {order.trackingLog && order.trackingLog.length > 0 && (
                            <div className="tracking-timeline-card glass-panel shadow-premium" style={{ padding: '30px' }}>
                                <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Activity size={20} color="#2b5a91"/> Transit History</h3>
                                <div className="timeline-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderLeft: '2px dashed #cbd5e1', marginLeft: '10px', paddingLeft: '20px' }}>
                                    {[...order.trackingLog].reverse().map((log, idx) => (
                                        <div key={idx} className="timeline-event" style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: '-29px', top: '0', width: '16px', height: '16px', borderRadius: '50%', background: getStatusColor(log.status), border: '3px solid #fff', boxShadow: '0 0 0 1px #cbd5e1' }}></div>
                                            <h4 style={{ fontSize: '1rem', color: '#1e293b', margin: '0 0 5px 0' }}>{log.status}</h4>
                                            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 5px 0' }}>{log.message}</p>
                                            <div style={{ display: 'flex', gap: '15px', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12}/> {log.location}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> {new Date(log.timestamp).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="order-items-card glass-panel shadow-premium">
                            <div className="card-header"><Shirt size={20}/> Product Details</div>
                            <div className="items-list">
                                {order.orderItems.map((item, idx) => (
                                    <div key={idx} className="order-item-row">
                                        <div className="oi-img">
                                            <img src={item.image} alt={item.name} />
                                        </div>
                                        <div className="oi-info">
                                            <h3>{item.name}</h3>
                                            <p>{item.size} • {item.color || 'Default'}</p>
                                            <span className="oi-qty">Quantity: {item.quantity}</span>
                                        </div>
                                        <div className="oi-price">
                                            <IndianRupee size={14} />{(item.price * item.quantity).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <aside className="order-sidebar-view">
                        <div className="order-info-card glass-panel shadow-premium">
                            <div className="card-header"><User size={20}/> Customer Info</div>
                            <div className="card-body">
                                <div className="info-item">
                                    <span className="info-label">Recipient</span>
                                    <span className="info-val">{order.user?.name || 'Customer'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Email</span>
                                    <span className="info-val">{order.user?.email}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label"><Phone size={14}/> Phone</span>
                                    <span className="info-val">+91 {order.shippingAddress.phone}</span>
                                </div>
                            </div>
                        </div>

                        <div className="order-info-card glass-panel shadow-premium">
                            <div className="card-header"><MapPin size={20}/> Shipping Address</div>
                            <div className="card-body">
                                <div className="address-content">
                                    <p>{order.shippingAddress.address}</p>
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                    <p>{order.shippingAddress.country}</p>
                                </div>
                            </div>
                        </div>

                        <div className="order-info-card glass-panel shadow-premium summary-card">
                            <div className="card-header"><CreditCard size={20}/> Payment Summary</div>
                            <div className="card-body">
                                <div className="payment-method-badge">
                                    {order.paymentMethod === 'ONLINE' ? 'Razorpay Secure' : order.paymentMethod === 'STRIPE' ? 'Stripe Global' : 'Cash on Delivery'}
                                    {order.isPaid ? <span className="status paid"><CheckCircle size={12}/> Paid</span> : <span className="status pending"><Clock size={12}/> Pending</span>}
                                </div>

                                <div className="calc-group">
                                    <div className="calc-row"><span>Items Total</span><span><IndianRupee size={15}/>{order.itemsPrice.toLocaleString()}</span></div>
                                    <div className="calc-row"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : <><IndianRupee size={14}/>{order.shippingPrice.toLocaleString()}</>}</span></div>
                                    <div className="calc-row"><span>Tax (GST)</span><span><IndianRupee size={14}/>{order.taxPrice.toLocaleString()}</span></div>
                                    <div className="calc-divider"></div>
                                    <div className="calc-row total"><span>Total Amount</span><span><IndianRupee size={22}/>{order.totalPrice.toLocaleString()}</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="order-info-card glass-panel shadow-premium whatsapp-card">
                            <div className="card-header"><MessageCircle size={20} color="#25D366"/> WhatsApp Connect</div>
                            <div className="card-body">
                                <p className="v-whatsapp-hint">Send this order summary for easy access and updates.</p>
                                <button className="v-whatsapp-btn" onClick={handleWhatsAppShare}>
                                    <Send size={16} /> SEND DETAILS NOW
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>

                <div id="invoice-pdf-template" style={{ display: 'none', width: '800px', padding: '40px', background: '#fff' }}>
                    <div className="invoice-brand-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '4px solid #2b5a91', paddingBottom: '20px', marginBottom: '30px' }}>
                        <div>
                            <h1 style={{ margin: 0, color: '#2b5a91', fontSize: '36px', fontWeight: '900' }}>PANDIT FASHION</h1>
                            <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>Order ID: #{order._id.toUpperCase()}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h2 style={{ margin: 0, color: '#1e293b', fontSize: '24px' }}>INVOICE</h2>
                            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                        <thead>
                            <tr style={{ background: '#2b5a91', color: '#fff' }}>
                                <th style={{ padding: '12px', textAlign: 'left' }}>ITEM</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>PRICE</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>QTY</th>
                                <th style={{ padding: '12px', textAlign: 'right' }}>TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.orderItems.map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '15px' }}>{item.name} ({item.size})</td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>₹{item.price.toLocaleString()}</td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ padding: '15px', textAlign: 'right' }}>₹{(item.price * item.quantity).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ width: '300px', background: '#f8fafc', padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Grand Total:</span>
                                <strong>₹{order.totalPrice.toLocaleString()}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default OrderDetails;
