import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Clock, ArrowRight, Download, Hash, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import './MyPayments.css';

const MyPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await API.get('/payments/mypayments');
                if (res.data.success) {
                    setPayments(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch personal payments", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    if (loading) return (
        <div className="pd-loading-container">
            <div className="pd-loader-glam"></div>
            <p>Gathering your transaction history...</p>
        </div>
    );

    return (
        <div className="my-payments-page animate-fade-in premium-orders-page-standalone">
            <div className="page-header-premium premium-orders-header">
                <h1>Transaction History</h1>
                <p>Track your premium purchases and secure payment confirmations.</p>
            </div>

            <div className="container">
                <div className="payments-grid">
                    {payments.length === 0 ? (
                        <div className="empty-payments-state">
                            <CreditCard size={64} opacity={0.2} />
                            <h3>No transactions yet</h3>
                            <p>Once you make a purchase, your payment receipts will appear here.</p>
                            <button onClick={() => navigate('/products')}>START SHOPPING</button>
                        </div>
                    ) : (
                        payments.map(payment => (
                            <div key={payment._id} className="payment-card-premium animate-slide-up">
                                <div className="card-top-elite">
                                    <div className="gateway-badge">
                                        <div className="dot-blue"></div>
                                        <span>{payment.gateway.toUpperCase()} SECURE</span>
                                    </div>
                                    <div className={`status-pill-elite ${payment.status.toLowerCase()}`}>
                                        <CheckCircle size={14}/>
                                        <span>{payment.status.toUpperCase()}</span>
                                    </div>
                                </div>

                                <div className="card-body">
                                    <div className="txn-info-elite">
                                        <small>TRANSACTION ID</small>
                                        <strong>{payment.transactionId}</strong>
                                    </div>
                                    <div className="amount-info-elite">
                                        <small>TOTAL PAID</small>
                                        <div className="price-tag-elite">
                                            <div className="currency-symbol">₹</div>
                                            <span>{payment.amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-footer-elite">
                                    <div className="order-ref-elite">
                                        <div className="hash-icon">#</div>
                                        <div className="ref-content">
                                            <small>Order:</small>
                                            <strong>#{payment.order?._id ? payment.order._id.substring(0, 8).toUpperCase() : 'N/A'}</strong>
                                        </div>
                                    </div>
                                    <div className="action-buttons-elite">
                                        <button className="btn-view-order-pill" onClick={() => navigate(`/order/${payment.order?._id}`)}>
                                            <span>VIEW ORDER</span>
                                            <ArrowRight size={16} strokeWidth={3}/>
                                        </button>
                                    </div>
                                </div>
                                <div className="payment-timestamp-centered">
                                    {new Date(payment.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    <span className="dot-separator">•</span>
                                    {new Date(payment.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyPayments;
