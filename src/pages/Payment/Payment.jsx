import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
//import { motion } from 'framer-motion';
import { 
    CheckCircle, 
    XCircle, 
    CreditCard, 
    Calendar, 
    Hash, 
    User, 
    IndianRupee, 
    ArrowRight,
    ShoppingBag,
    ShieldCheck,
    Download,
    FileText,
    ArrowLeft,
    Loader,
    Package,
    Truck,
    MapPin,
    Phone,
    Shirt,
    Star
} from 'lucide-react';
import API from '../../utils/api';
import './Payment.css';

const Payment = ({ setCart }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get('orderId');
    const gateway = queryParams.get('gateway');
    const sessionId = queryParams.get('sessionId');
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [redirectTimer, setRedirectTimer] = useState(15);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        // Match the logic used in App.jsx for consistency
        if (!token || !userData) {
            if (!orderId?.startsWith('temp_')) {
                const currentPath = window.location.pathname + window.location.search;
                window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
                return;
            }
        }

        const fetchOrderDetails = async () => {
            if (!orderId || orderId === 'undefined' || orderId === 'null') {
                setLoading(false);
                setError("No valid order reference found. Please check your order history.");
                return;
            }

            try {
                if (gateway?.toLowerCase() === 'stripe' && sessionId) {
                    try {
                        const verifyRes = await API.post('/payments/verify-stripe', { sessionId, orderId });
                        if (!verifyRes.data.success) {
                            console.warn("Verification failed message:", verifyRes.data.message);
                        }
                    } catch (vErr) {
                        console.error("Stripe verification call failed:", vErr.response?.data || vErr.message);
                    }
                }

                const res = await API.get(`/orders/${orderId}`);
                if (res.data.success) {
                    setOrder(res.data.data);
                    if (setCart) {
                        setCart([]);
                        localStorage.removeItem('khushi_cart');
                    }
                } else {
                    setError("Could not retrieve order details.");
                }
            } catch (err) {
                console.error("Error in payment page fetch:", err.response?.data || err.message);
                setError(err.response?.data?.message || "Something went wrong while confirming your payment.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId, setCart, gateway, sessionId, navigate]);

    useEffect(() => {
        let timer;
        if (!loading && !error && order) {
            timer = setInterval(() => {
                setRedirectTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        navigate(`/order/${orderId}`);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [loading, error, order, navigate, orderId]);

    if (loading) {
        return (
            <div className="payment-page-loading">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="loader-container-elite"
                >
                    <div className="loader-glam-orbit"></div>
                    <p>Confirming your premium purchase...</p>
                </motion.div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="payment-status-page error-state">
                <div className="page-accents">
                    <div className="accent-orb orb-1"></div>
                    <div className="accent-orb orb-2"></div>
                </div>
                <div className="container payment-error-view">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="error-card-glass"
                    >
                        <XCircle size={64} className="err-icon-pulse" />
                        <h2>Payment Reference Issue</h2>
                        <p>{error || "We couldn't find the transaction details you're looking for."}</p>
                        <div className="error-actions">
                            <button onClick={() => navigate('/')} className="btn-return-elite">Return to Shop</button>
                            <button onClick={() => navigate('/login')} className="btn-relogin-elite">Re-login</button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    const isSuccess = order.isPaid || order.paymentMethod === 'COD';

    const containerVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.8, staggerChildren: 0.15, ease: "easeOut" }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    };

    return (
        <div className="payment-status-page">
            <div className="page-accents">
                <div className="accent-orb orb-1"></div>
                <div className="accent-orb orb-2"></div>
            </div>

            <motion.div 
                className="container"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="payment-header-elite">
                    <div className="success-lottie-emulation">
                        <svg viewBox="0 0 52 52" className="checkmark-svg-elite">
                            <circle className="checkmark-circle-elite" cx="26" cy="26" r="25" fill="none" />
                            <path className="checkmark-check-elite" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                        </svg>
                    </div>
                    <motion.h1 className="luxury-brand-title" variants={cardVariants}>PANDIT FASHION</motion.h1>
                    <motion.h2 className="header-title-glam" variants={cardVariants}>
                        {isSuccess ? 'Transaction Perfected' : 'Order Secured'}
                    </motion.h2>
                    <motion.p className="header-subtitle-glam" variants={cardVariants}>
                        Thank you for choosing Pandit Fashion. Your curated collection is being prepared.
                    </motion.p>
                </div>

                <div className="payment-main-grid-layout">
                    {/* Left: Primary Status & Details */}
                    <div className="payment-column-primary">
                        <motion.div className="status-hero-card glass-panel shadow-premium" variants={cardVariants}>
                            <div className={`status-highlight-bar ${isSuccess ? 'success' : 'pending'}`}></div>
                            <div className="hero-content-wrap">
                                <div className="hero-icon-box">
                                    {isSuccess ? <ShieldCheck size={40} /> : <Package size={40} />}
                                </div>
                                <div className="hero-text-box">
                                    <h3>{isSuccess ? "Payment Verified" : "Order Processing"}</h3>
                                    <p>Order ID: <strong>#{order._id.toUpperCase()}</strong></p>
                                </div>
                                <div className="redirect-countdown-pill">
                                    <Loader size={12} className="spin" />
                                    <span>Tracking in {redirectTimer}s</span>
                                </div>
                            </div>
                        </motion.div>

                        <div className="details-two-column">
                            <motion.div className="info-sub-card glass-panel" variants={cardVariants}>
                                <div className="card-tag">BILLING DETAILS</div>
                                <div className="info-entry">
                                    <User size={16} />
                                    <div>
                                        <span>Customer</span>
                                        <p>{order.user?.name || 'Valued Client'}</p>
                                    </div>
                                </div>
                                <div className="info-entry">
                                    <Phone size={16} />
                                    <div>
                                        <span>Contact</span>
                                        <p>+91 {order.shippingAddress?.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="info-entry">
                                    <Calendar size={16} />
                                    <div>
                                        <span>Date</span>
                                        <p>{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div className="info-sub-card glass-panel" variants={cardVariants}>
                                <div className="card-tag">PAYMENT METHOD</div>
                                <div className="payment-method-large">
                                    <CreditCard size={24} />
                                    <div className="pm-details">
                                        <p>{order.paymentMethod === 'ONLINE' ? 'Razorpay Integrated' : 
                                           order.paymentMethod === 'STRIPE' ? 'Stripe International' : 'Cash on Delivery'}</p>
                                        <span>Secure 256-bit Transaction</span>
                                    </div>
                                </div>
                                <div className="payment-id-tag">
                                    <Hash size={12} /> ID: {order?.paymentResult?.id || order?.razorpayOrderId || 'OFFLINE'}
                                </div>
                            </motion.div>
                        </div>

                        <motion.div className="purchase-list-card glass-panel shadow-premium" variants={cardVariants}>
                            <div className="card-header-elite">
                                <Shirt size={18} /> Purchase Content
                            </div>
                            <div className="purchase-items-scroller">
                                {order.orderItems.map((item, idx) => (
                                    <div className="purchase-item-row-elite" key={idx}>
                                        <div className="p-item-img-elite">
                                            <img src={item.image} alt={item.name} />
                                        </div>
                                        <div className="p-item-core-elite">
                                            <h4>{item.name}</h4>
                                            <p>{item.size} • {item.color || 'Premium Edit'}</p>
                                        </div>
                                        <div className="p-item-math-elite">
                                            <span className="p-qty">{item.quantity} x</span>
                                            <span className="p-price">₹{item.price.toLocaleString()}</span>
                                            <strong className="p-subtotal">₹{(item.quantity * item.price).toLocaleString()}</strong>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Summary & Actions */}
                    <div className="payment-column-secondary">
                        <motion.div className="summary-sticky-card glass-panel shadow-premium" variants={cardVariants}>
                            <div className="card-header-elite">ORDER SUMMARY</div>
                            <div className="summary-math-block">
                                <div className="math-row">
                                    <span>Subtotal</span>
                                    <span>₹{order.itemsPrice.toLocaleString()}</span>
                                </div>
                                <div className="math-row">
                                    <span>Shipping</span>
                                    <span className={order.shippingPrice === 0 ? 'text-free' : ''}>
                                        {order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice.toLocaleString()}`}
                                    </span>
                                </div>
                                <div className="math-row">
                                    <span>GST (12%)</span>
                                    <span>₹{order.taxPrice.toLocaleString()}</span>
                                </div>
                                <div className="math-divider"></div>
                                <div className="math-row-grand">
                                    <div>
                                        <span>Total Paid</span>
                                        <p>Incl. all taxes</p>
                                    </div>
                                    <div className="grand-amount-wrap">
                                        <IndianRupee size={18} />
                                        <strong>{order.totalPrice.toLocaleString()}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="summary-actions-elite">
                                <button className="btn-track-elite" onClick={() => navigate(`/order/${order._id}`)}>
                                    TRACK YOUR COLLECTION <ArrowRight size={18} />
                                </button>
                                <div className="secondary-action-buttons">
                                    <button className="btn-icon-elite" title="Download Receipt">
                                        <Download size={18} /> RECEIPT
                                    </button>
                                    <button className="btn-icon-elite" title="View History">
                                        <FileText size={18} /> INVOICE
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div className="trust-badges-card glass-panel" variants={cardVariants}>
                            <div className="trust-item-elite">
                                <ShieldCheck size={20} className="text-blue" />
                                <div>
                                    <h5>Buyer Protection</h5>
                                    <p>Secure global fashion assets</p>
                                </div>
                            </div>
                            <div className="trust-item-elite">
                                <Star size={20} className="text-gold" />
                                <div>
                                    <h5>Premium Quality</h5>
                                    <p>Verified designer standards</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div className="continue-shopping-wrap" variants={cardVariants}>
                            <Link to="/" className="btn-back-to-shop-elite">
                                <ArrowLeft size={16} /> CONTINUE SHOPPING
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Payment;
