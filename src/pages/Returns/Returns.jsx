import React, { useState, useEffect } from 'react';
import { 
    CheckCircle, Clock, X, ArrowLeft, ArrowRight, 
    RotateCcw, Search, Loader, AlertCircle, Package, Hash,
    ArrowUpRight, ShoppingBag, Eye, Check
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import './Returns.css';

const ReturnDetailsModal = ({ item, onClose, onCancel }) => {
    return (
        <div className="ret-modal-overlay" onClick={onClose}>
            <div className="ret-modal-box animate-wow" onClick={e => e.stopPropagation()}>
                <div className="ret-modal-header">
                    <h3>Return Tracking</h3>
                    <button className="ret-close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="ret-modal-body">
                    <div className="ret-id-row">
                        <div className="ret-id-label">Return ID: <strong>{item.id}</strong></div>
                        <div className={`ret-status-badge ${item.status.toLowerCase()}`}>{item.status}</div>
                    </div>

                    <div className="ret-prod-card">
                        <img src={item.product.image} alt={item.product.name} className="ret-prod-img" />
                        <div className="ret-prod-info">
                            <h4>{item.product.name}</h4>
                            <p>Order Reference: {item.orderId}</p>
                            <div className="ret-refund-amount">Refund Amount: <span>{item.status === 'Cancelled' ? '—' : item.refundAmount}</span></div>
                        </div>
                    </div>

                    <div className="ret-timeline">
                        {item.trackingLog ? (
                            item.trackingLog.slice().reverse().map((log, i) => (
                                <div key={i} className={`ret-time-item ${i === 0 ? 'active' : 'done'}`}>
                                    <div className="ret-time-icon"><Check size={14} /></div>
                                    <div className="ret-time-info">
                                        <strong>{log.status === 'Cancelled' ? 'Cancellation' : log.status}</strong>
                                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                                        <p>{log.message || (log.status === 'Cancelled' ? 'Order was cancelled.' : '')}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="ret-time-item done">
                                <div className="ret-time-icon"><Check size={14} /></div>
                                <div className="ret-time-info">
                                    <strong>Return Requested</strong>
                                    <span>{item.date} • 10:30 AM</span>
                                    <p>Your request has been received and is being processed.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {item.refundProof && (
                        <div className="ret-proof-section">
                            <h4>Refund confirmation</h4>
                            <div className="ret-proof-card">
                                <div className="ret-proof-img-wrap">
                                    {item.refundProof?.toLowerCase().endsWith('.pdf') ? (
                                        <div 
                                            style={{width:'80px',height:'80px',background:'#fff',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',border:'2px solid white', boxShadow:'0 4px 10px rgba(0,0,0,0.05)', color:'#ef4444', fontWeight:'bold', fontSize:'12px', textAlign:'center', padding:'5px', transition:'transform 0.2s'}} 
                                            onClick={() => window.open(item.refundProof?.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000'}${item.refundProof}` : item.refundProof, '_blank')}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            PDF Receipt
                                        </div>
                                    ) : (
                                        <img src={item.refundProof?.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000'}${item.refundProof}` : item.refundProof} alt="Refund Proof" onClick={() => window.open(item.refundProof?.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000'}${item.refundProof}` : item.refundProof, '_blank')} />
                                    )}
                                </div>
                                <div className="ret-proof-details">
                                    <p>Your refund has been processed successfully.</p>
                                    <div className="ret-tx-id">TXN ID: <strong>{item.refundTransactionId || 'N/A'}</strong></div>
                                    <span className="ret-notice">Click image to view full receipt</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="ret-modal-footer">
                    {item.status === 'Processing' && (
                        <button className="ret-btn-cancel" onClick={onCancel}>Cancel Return Request</button>
                    )}
                    <button className="ret-btn-close" onClick={onClose}>Close Window</button>
                </div>
            </div>
        </div>
    );
};

const Returns = () => {
    const [returnsList, setReturnsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRefunds = async () => {
            try {
                const res = await API.get('/orders/myorders');
                if (res.data.success) {
                    const refunds = res.data.data.filter(order => 
                        order.status === 'Cancelled' || order.isRefunded || order.status === 'Returned'
                    ).map(order => ({
                        id: `REF-${order._id.substring(order._id.length - 4).toUpperCase()}`,
                        orderId: `#${order._id.substring(0, 8).toUpperCase()}`,
                        date: new Date(order.updatedAt).toLocaleDateString(),
                        status: order.isRefunded ? 'Refunded' : (order.status === 'Cancelled' ? 'Cancelled' : 'Processing'),
                        refundAmount: (order.status === 'Cancelled' && !order.isPaid) ? '—' : `₹${order.totalPrice.toLocaleString('en-IN')}`,
                        refundProof: order.refundProof,
                        refundTransactionId: order.refundTransactionId,
                        trackingLog: order.trackingLog,
                        product: {
                            name: order.orderItems[0]?.name || 'Multiple Items',
                            image: order.orderItems[0]?.image || '',
                            count: order.orderItems.length
                        },
                        originalOrder: order
                    }));
                    setReturnsList(refunds);
                }
            } catch (err) {
                console.error("Refunds fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRefunds();
    }, []);

    if (loading) return (
        <div className="ret-loading-container">
            <div className="ret-loader"></div>
            <p>Syncing return data...</p>
        </div>
    );

    return (
        <div className="returns-page-elite animate-fade-in">
            <div className="ret-hero-elite">
                <div className="ret-hero-pattern"></div>
                <div className="container">
                    <div className="ret-breadcrumb">
                        <Link to="/">Home</Link>
                        <span className="sep">/</span>
                        <span className="current">Returns & Refunds</span>
                    </div>
                    <div className="ret-hero-content">
                        <h1 className="ret-title-glam">Returns & Refunds</h1>
                        <p className="ret-subtitle-glam">Manage your cancellations and track your refund status with ease.</p>
                    </div>
                </div>
            </div>

            <div className="container ret-main-content">
                {returnsList.length > 0 ? (
                    <div className="ret-grid-premium">
                        {returnsList.map(item => (
                            <div key={item.id} className={`ret-card-elite ${item.status.toLowerCase()}`}>
                                <div className="ret-card-header">
                                    <div className="ret-ref-id">
                                        <Hash size={14} />
                                        <span>{item.id}</span>
                                    </div>
                                    <div className={`ret-status-pill ${item.status.toLowerCase()}`}>
                                        {item.status === 'Refunded' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                        {item.status}
                                    </div>
                                </div>

                                <div className="ret-card-body">
                                    <div className="ret-item-preview">
                                        <img src={item.product.image} alt={item.product.name} />
                                        <div className="ret-item-meta">
                                            <h4>{item.product.name} {item.product.count > 1 ? `(+${item.product.count - 1} items)` : ''}</h4>
                                            <p>Order: {item.orderId}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="ret-amount-box">
                                        <div className="amount-label">REFUND VALUE</div>
                                        <div className="amount-val">{item.status === 'Cancelled' ? '—' : item.refundAmount}</div>
                                    </div>
                                </div>

                                <div className="ret-card-footer">
                                    <div className="ret-date-label">Updated on {item.date}</div>
                                    <button className="ret-btn-track" onClick={() => setSelectedReturn(item)}>
                                        TRACK STATUS <ArrowRight size={16} />
                                    </button>
                                </div>
                                
                                {item.status === 'Refunded' && (
                                    <div className="ret-success-ribbon">
                                        <CheckCircle size={12} /> COMPLETED
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="ret-empty-state">
                        <div className="ret-empty-circle">
                            <RotateCcw size={60} strokeWidth={1} />
                        </div>
                        <h2 className="ret-empty-title">No Active Returns</h2>
                        <p className="ret-empty-desc">You don't have any pending returns or refund requests at the moment.</p>
                        <button className="ret-btn-shopping" onClick={() => navigate('/orders')}>
                            VIEW MY ORDERS
                        </button>
                    </div>
                )}
            </div>

            {selectedReturn && (
                <ReturnDetailsModal 
                    item={selectedReturn} 
                    onClose={() => setSelectedReturn(null)}
                    onCancel={() => {
                        // Modal cancel logic if needed
                        setSelectedReturn(null);
                    }}
                />
            )}
        </div>
    );
};

export default Returns;
