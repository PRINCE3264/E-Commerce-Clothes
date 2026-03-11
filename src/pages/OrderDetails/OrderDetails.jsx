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
    Send,
    ArrowLeft
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
            <Link to="/account/orders" className="back-link">Return to My Orders</Link>
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
                {/* Header Navigation & Actions */}
                <div className="order-details-header">
                    <div className="header-main-flex">
                        <div className="header-info-group">
                            <button className="btn-back" onClick={() => navigate('/account/orders')}>
                                <ChevronLeft size={18} /> BACK TO ORDERS
                            </button>
                            <h1 className="luxury-header-title">PANDIT FASHION</h1>
                            <p className="luxury-header-subtitle">Premium Luxury Apparel Boutique</p>
                            <div className="header-meta-pills">
                                <span className="order-id-label">ORD ID: #{order._id.toUpperCase()}</span>
                                <span className="order-date"><Calendar size={14}/> {new Date(order.createdAt).toLocaleDateString()}</span>
                                {order.isPaid && <span className="paid-entirely-badge">PAID ENTIRELY</span>}
                            </div>
                        </div>
                        
                        <div className="order-actions-wrap">
                            <div className="print-action" onClick={() => window.print()}>
                                <Printer size={16} /> <span>Print</span>
                            </div>
                            <div className="download-action" onClick={handleDownloadPDF}>
                                <Download size={16} /> <span>Invoice PDF</span>
                            </div>
                            <div className="whatsapp-action" onClick={handleWhatsAppShare}>
                                <MessageCircle size={16} /> <span>WhatsApp</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="order-details-layout" id="order-printable-section">
                    <div className="order-main-view">
                        {/* Tracking Section */}
                        <motion.div className="track-status-advanced glass-panel shadow-premium" variants={itemVariants}>
                            <h3>COLLECTION TRACKING</h3>
                            <div className="tracking-container">
                                <div className="track-status-line">
                                    <div className="line-fill" style={{ 
                                        width: order.status === 'Delivered' ? '100%' : (order.status === 'Out for Delivery' ? '75%' : (order.status === 'Shipped' ? '40%' : '0%')),
                                        background: getStatusColor(order.status)
                                    }}></div>
                                </div>
                                
                                <div className="track-step active">
                                    <div className="step-point-with-icon" style={{ borderColor: '#2b5a91', color: '#2b5a91' }}>
                                        <ShoppingCart size={22} />
                                    </div>
                                    <span className="s-label">CONFIRMED</span>
                                </div>

                                <div className={`track-step ${['Shipped', 'Delivered'].includes(order.status) ? 'active' : ''}`}>
                                    <div className="step-point-with-icon" style={{ 
                                        borderColor: ['Shipped', 'Delivered'].includes(order.status) ? '#3b82f6' : '#e2e8f0',
                                        color: ['Shipped', 'Delivered'].includes(order.status) ? '#3b82f6' : '#94a3b8'
                                    }}>
                                        <Truck size={22} />
                                    </div>
                                    <span className="s-label">SHIPPED</span>
                                </div>

                                <div className={`track-step ${['Out for Delivery', 'Delivered'].includes(order.status) ? 'active' : ''}`}>
                                    <div className="step-point-with-icon" style={{ 
                                        borderColor: ['Out for Delivery', 'Delivered'].includes(order.status) ? '#8b5cf6' : '#e2e8f0',
                                        color: ['Out for Delivery', 'Delivered'].includes(order.status) ? '#8b5cf6' : '#94a3b8'
                                    }}>
                                        <Navigation size={22} />
                                    </div>
                                    <span className="s-label">TRANSIT</span>
                                </div>

                                <div className={`track-step ${order.status === 'Delivered' ? 'active' : ''}`}>
                                    <div className="step-point-with-icon" style={{ 
                                        borderColor: order.status === 'Delivered' ? '#10b981' : '#e2e8f0',
                                        color: order.status === 'Delivered' ? '#10b981' : '#94a3b8'
                                    }}>
                                        <Package size={22} />
                                    </div>
                                    <span className="s-label">DELIVERED</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Invoice Info Grid */}
                        <div className="invoice-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '35px' }}>
                            <motion.div className="invoice-card-lite glass-panel" variants={itemVariants}>
                                <h4>BILLING TO:</h4>
                                <p className="customer-name">{order.user?.name?.toUpperCase() || 'VALUED CUSTOMER'}</p>
                                <p>{order.user?.email}</p>
                                <p>Ph: +91 {order.shippingAddress.phone}</p>
                            </motion.div>
                            <motion.div className="invoice-card-lite glass-panel" variants={itemVariants}>
                                <h4>SHIPPING DESTINATION:</h4>
                                <p className="customer-name">{order.shippingAddress.city}, India</p>
                                <p>{order.shippingAddress.address}, {order.shippingAddress.postalCode}</p>
                                <p>{order.shippingAddress.country}</p>
                            </motion.div>
                        </div>

                        {/* Items Table Card */}
                        <motion.div className="premium-items-card shadow-premium glass-panel" variants={itemVariants}>
                            <div className="p-items-header">
                                <div>IMAGE</div>
                                <div>ITEM DESCRIPTION</div>
                                <div style={{ textAlign: 'center' }}>PRICE</div>
                                <div style={{ textAlign: 'center' }}>QTY</div>
                                <div style={{ textAlign: 'right' }}>TOTAL</div>
                            </div>
                            <div className="p-items-body">
                                {order.orderItems.map((item, idx) => (
                                    <div className="p-item-row" key={idx}>
                                        <img src={item.image} alt={item.name} className="p-item-img" />
                                        <div className="p-item-info">
                                            <h5>{item.name}</h5>
                                            <div className="p-item-variant-meta">
                                                <span>{item.size} • {item.color || 'Premium Edit'}</span>
                                                <div className="mobile-only-price-qty">
                                                    <span>Qty: {item.quantity}</span>
                                                    <span>Unit: ₹{item.price.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-item-price">₹{item.price.toLocaleString()}</div>
                                        <div className="p-item-qty">{item.quantity}</div>
                                        <div className="p-item-total">₹{(item.price * item.quantity).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <aside className="order-sidebar-view">
                        {/* Summary Receipt Box */}
                        <motion.div className="receipt-summary-box shadow-premium glass-panel" variants={itemVariants}>
                            <h3 style={{ margin: '0 0 25px 0', fontSize: '1.2rem', fontWeight: '900', color: '#2b5a91', textTransform: 'uppercase' }}>
                                PAYMENT SUMMARY
                            </h3>
                            <div className="receipt-row">
                                <span>Basket Amount:</span>
                                <span>₹{order.itemsPrice.toLocaleString()}</span>
                            </div>
                            <div className="receipt-row">
                                <span>Shipping Cost:</span>
                                <span style={{ color: order.shippingPrice === 0 ? '#10b981' : '#1e293b' }}>
                                    {order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice.toLocaleString()}`}
                                </span>
                            </div>
                            <div className="receipt-row">
                                <span>GST Applied (12%):</span>
                                <span>₹{order.taxPrice.toLocaleString()}</span>
                            </div>
                            
                            <div className="receipt-row total-row">
                                <span>GRAND TOTAL:</span>
                                <span className="grand-total-val">₹{order.totalPrice.toLocaleString()}</span>
                            </div>

                            <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <Link to="/account/orders" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
                                    <ArrowLeft size={18} /> BACK TO ORDERS
                                </Link>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold', color: '#94a3b8' }}>
                                    <span>PAYMENT MODE</span>
                                    <span>{order.paymentMethod}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold', color: '#94a3b8' }}>
                                    <span>TRANSACTION ID</span>
                                    <span style={{ fontFamily: 'monospace' }}>#{order.razorpayOrderId || 'OFFLINE'}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Additional Branding */}
                        <motion.div style={{ textAlign: 'center', marginTop: '30px' }} variants={itemVariants}>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>
                                Thank you for shopping with Pandit Fashion. Your satisfaction is our priority.
                            </p>
                            <p style={{ color: '#2b5a91', fontSize: '0.85rem', fontWeight: '900', letterSpacing: '1px', marginTop: '10px' }}>
                                STAY STYLISH | STAY BOLD
                            </p>
                        </motion.div>
                    </aside>
                </div>

                {/* HIDDEN TEMPLATE FOR PDF GENERATION */}
                <div id="invoice-pdf-template" style={{ 
                    display: 'none', 
                    width: '794px', 
                    minHeight: '1123px', 
                    padding: '50px', 
                    background: '#fff',
                    fontFamily: "'Inter', sans-serif",
                    color: '#1e293b',
                    boxSizing: 'border-box'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                            <h1 style={{ margin: 0, color: '#2b5a91', fontSize: '42px', fontWeight: '900', letterSpacing: '-1.5px' }}>PANDIT FASHION</h1>
                            <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '15px', fontWeight: '600' }}>Premium Luxury Apparel Boutique</p>
                            <p style={{ margin: '3px 0 0 0', color: '#94a3b8', fontSize: '11px' }}>Order ID: #{order._id.toUpperCase()}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h2 style={{ margin: 0, color: '#1e293b', fontSize: '26px', fontWeight: '800', letterSpacing: '1px' }}>OFFICIAL INVOICE</h2>
                            <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                            {order.isPaid && <div style={{ marginTop: '12px', display: 'inline-block', background: '#10b981', color: '#fff', padding: '6px 14px', borderRadius: '4px', fontSize: '11px', fontWeight: '900' }}>PAID ENTIRELY</div>}
                        </div>
                    </div>

                    <div style={{ height: '4px', background: '#2b5a91', marginBottom: '40px', borderRadius: '2px' }}></div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '45px' }}>
                        <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                            <h4 style={{ margin: '0 0 15px 0', color: '#2b5a91', fontSize: '14px', fontWeight: '900', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>BILLING TO:</h4>
                            <p style={{ margin: '0', fontWeight: '900', fontSize: '16px' }}>{order.user?.name?.toUpperCase() || 'VALUED CUSTOMER'}</p>
                            <p style={{ margin: '5px 0', color: '#64748b', fontSize: '14px' }}>{order.user?.email}</p>
                            <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>Ph: +91 {order.shippingAddress.phone}</p>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                            <h4 style={{ margin: '0 0 15px 0', color: '#2b5a91', fontSize: '14px', fontWeight: '900', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>SHIPPING DESTINATION:</h4>
                            <p style={{ margin: '0', fontWeight: '900', fontSize: '16px' }}>{order.shippingAddress.city}, India</p>
                            <p style={{ margin: '5px 0', color: '#64748b', fontSize: '14px' }}>{order.shippingAddress.address}, {order.shippingAddress.postalCode}</p>
                            <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>India</p>
                        </div>
                    </div>

                    <div style={{ background: '#2b5a91', color: '#fff', padding: '15px 25px', borderRadius: '8px 8px 0 0', display: 'flex', fontWeight: '800', fontSize: '13px', letterSpacing: '1px' }}>
                        <div style={{ width: '80px' }}>IMAGE</div>
                        <div style={{ flex: 2 }}>ITEM DESCRIPTION</div>
                        <div style={{ width: '100px', textAlign: 'center' }}>PRICE</div>
                        <div style={{ width: '60px', textAlign: 'center' }}>QTY</div>
                        <div style={{ width: '100px', textAlign: 'right' }}>TOTAL</div>
                    </div>

                    {order.orderItems.map((item, idx) => (
                        <div key={idx} style={{ padding: '20px 25px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                            <div style={{ width: '80px' }}>
                                <img src={item.image} alt="" style={{ width: '50px', height: '65px', objectFit: 'cover', borderRadius: '6px' }} />
                            </div>
                            <div style={{ flex: 2 }}>
                                <p style={{ margin: 0, fontWeight: '900', fontSize: '15px' }}>{item.name}</p>
                                <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '11px' }}>Size: {item.size} | Color: {item.color || 'Premium Edit'}</p>
                            </div>
                            <div style={{ width: '100px', textAlign: 'center', fontWeight: '700' }}>₹{item.price.toLocaleString()}</div>
                            <div style={{ width: '60px', textAlign: 'center', fontWeight: '700' }}>{item.quantity}</div>
                            <div style={{ width: '100px', textAlign: 'right', fontWeight: '900' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                        </div>
                    ))}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
                        <div style={{ width: '350px', background: '#f8fafc', padding: '30px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '15px', color: '#64748b' }}>
                                <span>Basket Amount:</span>
                                <span style={{ fontWeight: '800', color: '#1e293b' }}>₹{order.itemsPrice.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '15px', color: '#64748b' }}>
                                <span>Shipping Cost:</span>
                                <span style={{ fontWeight: '800', color: order.shippingPrice === 0 ? '#10b981' : '#1e293b' }}>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice.toLocaleString()}`}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '15px', color: '#64748b' }}>
                                <span>GST Applied (12%):</span>
                                <span style={{ fontWeight: '800', color: '#1e293b' }}>₹{order.taxPrice.toLocaleString()}</span>
                            </div>
                            <div style={{ height: '2px', background: '#e2e8f0', marginBottom: '20px' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '18px', fontWeight: '900', color: '#2b5a91' }}>GRAND TOTAL:</span>
                                <span style={{ fontSize: '26px', fontWeight: '900', color: '#1e293b' }}>₹{order.totalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '100px', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '40px' }}>
                        <h4 style={{ margin: '0', fontSize: '18px', fontWeight: '900', color: '#1e293b' }}>Thank you for choosing Pandit Fashion!</h4>
                        <p id="pdf-gen-time" style={{ margin: '10px 0', fontSize: '11px', color: '#94a3b8' }}>Invoice Generated On: {new Date().toLocaleString()}</p>
                        <p style={{ margin: '5px 0', fontSize: '11px', color: '#94a3b8' }}>This is a computer generated invoice and does not require a physical signature.</p>
                        <div style={{ margin: '20px 0 0 0', padding: '10px 0', borderTop: '1px dashed #e2e8f0' }}>
                            <p style={{ margin: '0', fontSize: '12px', color: '#2b5a91', fontWeight: '900', letterSpacing: '4px', textTransform: 'uppercase' }}>STAY STYLISH | STAY BOLD</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default OrderDetails;
