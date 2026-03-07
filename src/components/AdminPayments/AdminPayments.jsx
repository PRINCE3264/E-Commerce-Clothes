import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Filter, 
    CreditCard, 
    CheckCircle, 
    Clock, 
    ArrowUpRight,
    IndianRupee,
    Hash,
    User,
    Mail,
    Loader,
    ShieldCheck
} from 'lucide-react';
import API from '../../utils/api';
import '../../pages/MyPayments/MyPayments.css'; // Import the premium user styling

const AdminPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await API.get('/payments'); 
                if (res.data.success) {
                    setPayments(res.data.data);
                }
            } catch (err) {
                console.error("Admin payments fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const filteredPayments = payments.filter(p => 
        (p.transactionId && p.transactionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.order?._id && p.order._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.user?.email && p.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="admin-loading">
            <Loader size={32} className="pf-spin" />
            <p>Fetching online transactions...</p>
        </div>
    );

    return (
        <div className="admin-panel animate-fade-in">
            <div className="panel-header">
                <div>
                    <h3>Online Payments Tracking</h3>
                    <p>Monitor all Razorpay transactions, successful payments, and order reconciliations.</p>
                </div>
                <div className="header-actions">
                    <div className="admin-search-small">
                        <Search size={16} />
                        <input 
                            type="text" 
                            placeholder="Find by TXN ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="payments-grid mt-30">
                {filteredPayments.length === 0 ? (
                    <div className="empty-payments-state" style={{ background: '#f8fafc', border: '2px dashed #e2e8f0', width: '100%', gridColumn: '1 / -1' }}>
                        <CreditCard size={64} opacity={0.3} color="#94a3b8" />
                        <h3 style={{ color: '#1e293b' }}>No online transactions located</h3>
                        <p style={{ color: '#64748b' }}>Waiting for customers to process secure payments via Razorpay or Stripe.</p>
                    </div>
                ) : (
                    filteredPayments.map(p => (
                        <div key={p._id} className="payment-card-premium glass-panel" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                            <div className="card-top">
                                <div className="gateway-indicator" style={{ color: '#1e293b' }}>
                                    <div className="gateway-dot" style={{ background: '#3b82f6', boxShadow: '0 0 10px rgba(59,130,246,0.5)' }}></div>
                                    <span>{p.gateway} Node</span>
                                </div>
                                <div className={`status-pill ${p.status === 'Completed' ? 'completed' : 'pending'}`}>
                                    {p.status === 'Completed' ? <ShieldCheck size={14}/> : <Clock size={14}/>}
                                    {p.status}
                                </div>
                            </div>

                            <div className="card-body" style={{ background: '#f8fafc' }}>
                                <div className="txn-info">
                                    <small style={{ color: '#64748b' }}>TRANSACTION ID</small>
                                    <strong style={{ fontSize: '0.85rem' }}>{p.transactionId}</strong>
                                </div>
                                <div className="amount-info">
                                    <small style={{ color: '#64748b' }}>VERIFIED YIELD</small>
                                    <div className="price-tag" style={{ color: '#2563eb' }}>
                                        <IndianRupee size={16}/>
                                        <span>{p.amount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="card-footer" style={{ borderTop: '1px dashed #cbd5e1' }}>
                                <div className="order-ref" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b', fontWeight: '800' }}>
                                        <Hash size={14}/> <span>{p.order?._id ? p.order._id.substring(p.order._id.length - 8).toUpperCase() : 'N/A'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                                        <User size={12}/> <span>{p.user?.name || 'Guest'}</span>
                                    </div>
                                </div>
                                <div className="action-buttons">
                                    <button className="btn-details" style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }} title="Analyze Node">
                                        ANALYZE <ArrowUpRight size={14}/>
                                    </button>
                                </div>
                            </div>
                            <div className="payment-date" style={{ color: '#94a3b8' }}>
                                {new Date(p.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminPayments;
