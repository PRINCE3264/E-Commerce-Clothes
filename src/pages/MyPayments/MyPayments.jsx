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
        <div className="my-payments-page animate-fade-in">
            <div className="container">
                <div className="page-header-premium">
                    <h1>Transaction History</h1>
                    <p>Track your premium purchases and secure payment confirmations.</p>
                </div>

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
                            <div key={payment._id} className="payment-card-premium glass-panel">
                                <div className="card-top">
                                    <div className="gateway-indicator">
                                        <div className="gateway-dot"></div>
                                        <span>{payment.gateway} Secure</span>
                                    </div>
                                    <div className={`status-pill ${payment.status.toLowerCase()}`}>
                                        {payment.status === 'Completed' ? <CheckCircle size={14}/> : <Clock size={14}/>}
                                        {payment.status}
                                    </div>
                                </div>

                                <div className="card-body">
                                    <div className="txn-info">
                                        <small>TRANSACTION ID</small>
                                        <strong>{payment.transactionId}</strong>
                                    </div>
                                    <div className="amount-info">
                                        <small>TOTAL PAID</small>
                                        <div className="price-tag">
                                            <IndianRupee size={16}/>
                                            <span>{payment.amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <div className="order-ref">
                                        <Hash size={14}/>
                                        <span>Order: #{payment.order?._id ? payment.order._id.substring(0, 8).toUpperCase() : 'N/A'}</span>
                                    </div>
                                    <div className="action-buttons">
                                        <button className="btn-details" onClick={() => navigate(`/order/${payment.order?._id}`)}>
                                            VIEW ORDER <ArrowRight size={14}/>
                                        </button>
                                        <button className="btn-invoice-mini" title="Download Receipt">
                                            <Download size={14}/>
                                        </button>
                                    </div>
                                </div>
                                <div className="payment-date">
                                    {new Date(payment.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
