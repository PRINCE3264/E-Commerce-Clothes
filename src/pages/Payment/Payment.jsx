import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
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
    Loader
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
    const [redirectTimer, setRedirectTimer] = useState(60);

    useEffect(() => {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('admin_token');
        if (!token && !orderId?.startsWith('temp_')) {
            navigate('/login');
            return;
        }

        const fetchOrderDetails = async () => {
            if (!orderId || orderId === 'undefined' || orderId === 'null') {
                setLoading(false);
                setError("No valid order reference found. Please check your order history.");
                return;
            }

            try {
                // If coming back from Stripe, verify first
                if (gateway?.toLowerCase() === 'stripe' && sessionId) {
                    try {
                        const verifyRes = await API.post('/payments/verify-stripe', { sessionId, orderId });
                        if (!verifyRes.data.success) {
                            console.warn("Verification failed message:", verifyRes.data.message);
                        }
                    } catch (vErr) {
                        console.error("Stripe verification call failed:", vErr.response?.data || vErr.message);
                        // We don't necessarily stop here, we try to fetch the order anyway 
                        // as it might have been verified by a previous attempt or webhook
                    }
                }

                const res = await API.get(`/orders/${orderId}`);
                if (res.data.success) {
                    setOrder(res.data.data);
                    // Clear cart only after successful order load
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
        
        // Clear cart globally when reaching this page (Success fallback)
        if (orderId && setCart) {
            setCart([]);
        }
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
                <div className="loader"></div>
                <p>Retrieving payment data...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container payment-error-view">
                <XCircle size={64} color="#ef4444" />
                <h2>Payment Reference Error</h2>
                <p>{error || "We couldn't find the transaction details you're looking for."}</p>
                <Link to="/" className="btn-return">Return to Shop</Link>
            </div>
        );
    }

    const isSuccess = order.isPaid || order.paymentMethod === 'COD';

    return (
        <div className="payment-status-page">
            <div className="container">
                <div className="payment-main-card glass-panel animate-slide-up">
                    <div className={`status-banner ${isSuccess ? 'success' : 'pending'}`}>
                        {isSuccess ? (
                            <>
                                <CheckCircle size={48} />
                                <div>
                                    <h1>Payment Confirmed</h1>
                                    <p>Your transaction was processed successfully.</p>
                                    <p style={{ fontSize: '0.85rem', marginTop: '8px', color: '#059669', display: 'flex', alignItems: 'center', gap: '5px' }}><Loader size={14} className="spin" /> Redirecting to your tracking dashboard in {redirectTimer}s...</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <Hash size={48} />
                                <div>
                                    <h1>Order Received</h1>
                                    <p>Your order is placed. Our team will begin processing it shortly.</p>
                                    <p style={{ fontSize: '0.85rem', marginTop: '8px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '5px' }}><Loader size={14} className="spin" /> Redirecting to your tracking dashboard in {redirectTimer}s...</p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="payment-details-grid">
                        <section className="detail-section">
                            <h3 className="section-title"><CreditCard size={18}/> Transaction Details</h3>
                            <div className="detail-card">
                                <div className="detail-row">
                                    <span>Transaction ID</span>
                                    <strong>{order?.paymentResult?.id || 'N/A (Offline)'}</strong>
                                </div>
                                <div className="detail-row">
                                    <span>{order?.paymentMethod === 'STRIPE' ? 'Stripe Intent ID' : 'Razorpay Order ID'}</span>
                                    <strong>{order?.stripePaymentIntentId || order?.razorpayOrderId || 'N/A'}</strong>
                                </div>
                                <div className="detail-row">
                                    <span>Payment Method</span>
                                    <strong className="method-badge">
                                        {order?.paymentMethod === 'ONLINE' ? 'Razorpay Secure' : 
                                         order?.paymentMethod === 'STRIPE' ? 'Stripe Global' : 'Cash on Delivery'}
                                    </strong>
                                </div>
                                <div className="detail-row">
                                    <span>Status</span>
                                    <span className={`status-pill ${order?.isPaid ? 'paid' : 'unpaid'}`}>
                                        {order?.isPaid ? 'Payment Verified' : 'Awaiting Payment'}
                                    </span>
                                </div>
                            </div>
                        </section>

                        <section className="detail-section">
                            <h3 className="section-title"><FileText size={18}/> Summarized Receipt</h3>
                            <div className="detail-card summary-receipt">
                                <div className="detail-row">
                                    <span>Total Amount Paid</span>
                                    <strong className="amount-big"><IndianRupee size={20}/>{order?.totalPrice?.toLocaleString() || '0'}</strong>
                                </div>
                                <div className="detail-row">
                                    <span>Date & Time</span>
                                    <span>{order?.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span>Billing Name</span>
                                    <span>{order?.user?.name || 'Customer'}</span>
                                </div>
                                <div className="detail-row">
                                    <span>Billing Phone</span>
                                    <span>{order?.shippingAddress?.phone ? `+91 ${order.shippingAddress.phone}` : 'N/A'}</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="payment-items-summary">
                        <h3 className="section-title"><ShoppingBag size={18}/> Purchase Details</h3>
                        <div className="payment-items-list">
                            {order?.orderItems && order.orderItems.map((item, idx) => (
                                <div className="p-item-row" key={idx}>
                                    <div className="p-item-thumb">
                                        <img src={item.image} alt={item.name} />
                                    </div>
                                    <div className="p-item-info">
                                        <h4>{item.name}</h4>
                                        <p>{item.size} • {item.color || 'Default'}</p>
                                    </div>
                                    <div className="p-item-pricing">
                                        <span>{item.quantity} x ₹{item.price?.toLocaleString()}</span>
                                        <strong>₹{(item.quantity * item.price)?.toLocaleString()}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="payment-total-breakdown">
                            <div className="p-break-row">
                                <span>Subtotal</span>
                                <span>₹{order?.itemsPrice?.toLocaleString() || '0'}</span>
                            </div>
                            <div className="p-break-row">
                                <span>Shipping Fees</span>
                                <span>{order?.shippingPrice === 0 ? 'FREE' : `₹${order?.shippingPrice?.toLocaleString() || '0'}`}</span>
                            </div>
                            <div className="p-break-row">
                                <span>GST (12%)</span>
                                <span>₹{order?.taxPrice?.toLocaleString() || '0'}</span>
                            </div>
                            <div className="p-break-row grand-total">
                                <span>Grand Total Paid</span>
                                <strong>₹{order?.totalPrice?.toLocaleString() || '0'}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="payment-actions">
                        <div className="primary-actions">
                            <button className="btn-track" onClick={() => navigate(`/order/${order._id}`)}>
                                VIEW ORDER DETAILS <ArrowRight size={18}/>
                            </button>
                            <button className="btn-invoice" onClick={() => navigate(`/order/${order._id}`)}>
                                <Download size={18}/> DOWNLOAD INVOICE
                            </button>
                        </div>
                        <Link to="/" className="back-link">
                            <ArrowLeft size={16}/> CONTINUE SHOPPING
                        </Link>
                    </div>
                </div>

                <div className="payment-security-footer">
                    <div className="security-item">
                        <ShieldCheck size={20} />
                        <span>Secure Payments by Razorpay</span>
                    </div>
                    <div className="security-item">
                        <ShoppingBag size={20} />
                        <span>256-bit SSL Encryption</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
