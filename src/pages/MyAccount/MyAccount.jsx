import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    User, Package, Heart, MapPin, CreditCard,
    Truck, Gift, RotateCcw, Bell, Headphones,
    ChevronRight, LogOut, Camera, Edit3, Save, X,
    CheckCircle, AlertCircle, Loader, Star, ShoppingBag,
    Plus, Trash2, Eye, IndianRupee, Clock, Search, Mail,
    Lock, Phone, Map, Globe, CheckCircle2,
    Box,
    Home,
    Briefcase,
    Building2,
    Check,
    Calendar,
    Shield,
    Crown
} from 'lucide-react';
import API from '../../utils/api';
import './MyAccount.css';

const MyAccount = ({ onAddToCart, onToggleWishlist }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const tabs = useMemo(() => [
        { id: 'profile', label: 'Profile Information', num: 1, icon: <User size={18} /> },
        { id: 'orders', label: 'My Orders', num: 2, icon: <Package size={18} /> },
        { id: 'wishlist', label: 'My Wishlist', num: 3, icon: <Heart size={18} /> },
        { id: 'addresses', label: 'My Addresses', num: 4, icon: <MapPin size={18} /> },
        // { id: 'payments', label: 'Payment Methods', num: 5, icon: <CreditCard size={18} /> },
        { id: 'tracking', label: 'Order Tracking', num: 6, icon: <Truck size={18} /> },
        { id: 'coupons', label: 'Coupons & Rewards', num: 7, icon: <Gift size={18} /> },
        { id: 'returns', label: 'Returns & Refunds', num: 8, icon: <RotateCcw size={18} /> },
    ], []);

    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const path = location.pathname.split('/').pop().toLowerCase();
        
        if (path === 'account' || path === 'profile') {
            setActiveTab('profile');
        } else if (path === 'orders') {
            setActiveTab('orders');
        } else if (path === 'wishlist') {
            setActiveTab('wishlist');
        } else if (path === 'address' || path === 'addresses') {
            setActiveTab('addresses');
        } else if (path === 'payments' || path === 'mypayments') {
            setActiveTab('payments');
        } else if (path === 'tracking') {
            setActiveTab('tracking');
        } else if (path === 'coupons') {
            setActiveTab('coupons');
        } else if (path === 'returns') {
            setActiveTab('returns');
        } else {
            const tabParam = new URLSearchParams(location.search).get('tab');
            if (tabParam) setActiveTab(tabParam);
            else setActiveTab('profile');
        }
    }, [location, tabs]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await API.get('/auth/me');
                if (res.data.success) {
                    setUser(res.data.data);
                }
            } catch {
                navigate('/login?redirect=/profile');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = '/login';
    };

    if (loading) return (
        <div className="account-loading">
            <Loader className="spin" size={40} />
            <p>Loading your account...</p>
        </div>
    );

    return (
        <div className="account-page">
            <div className="account-container">
                <aside className="account-sidebar">
                    <div className="account-user-mini">
                        <div className="mini-avatar">
                            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=c0392b&color=fff`} alt={user?.name} />
                        </div>
                        <div className="mini-info">
                            <h4>{user?.name}</h4>
                            <p>{user?.email}</p>
                        </div>
                    </div>
                    <nav className="account-nav">
                        {tabs.map(tab => (
                            <button 
                                key={tab.id} 
                                className={`nav-items ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => {
                                    const pathMap = {
                                        'profile': '/account',
                                        'orders': '/account/orders',
                                        'wishlist': '/account/wishlist',
                                        'payments': '/account/payments',
                                        'addresses': '/account/address',
                                        'tracking': '/account/tracking',
                                        'coupons': '/account/coupons',
                                        'returns': '/account/returns'
                                    };
                                    navigate(pathMap[tab.id] || `/profile?tab=${tab.id}`);
                                }}
                            >
                                <div className="nav-icon-elite">{tab.icon}</div>
                                <span className="nav-num-square">{tab.num}</span>
                                <span className="nav-label">{tab.label}</span>
                                <ChevronRight className="nav-chevron" size={16} />
                            </button>
                        ))}
                    </nav>
                    <button className="nav-item logout-btn" onClick={handleLogout}>
                        <span className="nav-icon"><LogOut size={18} /></span>
                        <span className="nav-label">Logout</span>
                    </button>
                </aside>

                <main className="account-content">
                    {!user ? (
                        <div className="error-state">
                            <AlertCircle size={40} />
                            <p>Failed to load user data. Please try logging in again.</p>
                            <button onClick={handleLogout}>Logout</button>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'profile' && <ProfileSection user={user} setUser={setUser} />}
                            {activeTab === 'orders' && <OrdersSection />}
                            {activeTab === 'wishlist' && <WishlistSection onAddToCart={onAddToCart} onToggleWishlist={onToggleWishlist} />}
                            {activeTab === 'addresses' && <AddressesSection user={user} setUser={setUser} />}
                            {activeTab === 'payment' && <PaymentsSection user={user} setUser={setUser} />}
                            {activeTab === 'tracking' && <TrackingSection />}
                            {activeTab === 'coupons' && <CouponsSection />}
                            {activeTab === 'returns' && <ReturnsSection />}
                           
                           
                            {activeTab === 'support' && <SupportSection />}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

/* ── Section Components ── */

const ProfileSection = ({ user, setUser }) => {
    const fileInputRef = useRef(null);
    const [editMode, setEditMode] = useState(false);
    const [passMode, setPassMode] = useState(false);
    const [formData, setFormData] = useState({ 
        name: user?.name || '',
        phone: user?.phone || '',
        gender: user?.gender || '',
        dob: user?.dob ? user.dob.split('T')[0] : '',
        avatar: user?.avatar || ''
    });
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null);
    const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result;
            setFormData(prev => ({ ...prev, avatar: base64 }));
            // Auto-save avatar
            try {
                const res = await API.put('/auth/profile', { avatar: base64 });
                if (res.data.success) {
                    setUser(res.data.data);
                }
            } catch (err) {
                console.error("Avatar upload failed", err);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setStatus(null);
        try {
            const res = await API.put('/auth/profile', formData);
            if (res.data.success) {
                setUser(res.data.data);
                setEditMode(false);
                setStatus({ type: 'success', text: 'Profile updated successfully!' });
                setTimeout(() => setStatus(null), 3000);
            }
        } catch {
            setStatus({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passData.newPassword !== passData.confirmPassword) {
            return alert("New passwords do not match!");
        }
        setSaving(true);
        try {
            const res = await API.post('/auth/change-password', {
                currentPassword: passData.currentPassword,
                newPassword: passData.newPassword
            });
            if (res.data.success) {
                setPassMode(false);
                setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                alert("Password updated successfully!");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update password");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="section-container profile-section animate-fade-in">
            <div className="section-header">
                <h2 className="profile-title">Profile Information</h2>
                <button className="edit-profile-btn-elite" onClick={() => setEditMode(!editMode)}>
                    {editMode ? <><X size={18} /> Cancel</> : <><Edit3 size={18} /> Edit Profile</>}
                </button>
            </div>
            
            {status && <div className={`status-banner ${status.type}`}>{status.text}</div>}

            {!editMode ? (
                <div className="profile-view-card">
                    <div className="profile-main-info-elite">
                        <div className="profile-photo-wrap">
                            <img src={formData.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=c0392b&color=fff`} alt={user?.name} className="profile-img-elite" />
                            <button className="cam-edit-btn" onClick={() => fileInputRef.current?.click()}>
                                <Camera size={16} />
                            </button>
                            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleAvatarChange} />
                        </div>
                        
                        <div className="profile-details-grid-elite">
                            <div className="elite-detail-item">
                                <label>FULL NAME</label>
                                <strong>{user?.name}</strong>
                            </div>
                            <div className="elite-detail-item">
                                <label>EMAIL ID</label>
                                <strong>{user?.email}</strong>
                            </div>
                            <div className="elite-detail-item">
                                <label>PHONE NUMBER</label>
                                <strong>{user?.phone || 'Not Added'}</strong>
                            </div>
                            <div className="elite-detail-item">
                                <label>GENDER</label>
                                <strong>{user?.gender || 'Not Specified'}</strong>
                            </div>
                            <div className="elite-detail-item">
                                <label>DATE OF BIRTH</label>
                                <strong>{user?.dob ? new Date(user.dob).toLocaleDateString() : 'Not Provided'}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <form className="profile-edit-form" onSubmit={handleSave}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label><User size={14} /> Full Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label><Mail size={14} /> Email ID</label>
                                <input type="email" value={user.email} disabled />
                            </div>
                            <div className="form-group">
                                <label><Phone size={14} /> Phone Number</label>
                                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Gender</label>
                                <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Date of Birth</label>
                                <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="save-btn" disabled={saving}>
                                {saving ? <Loader className="spin" size={16} /> : <Save size={16} />}
                                Save Changes
                            </button>
                            <button type="button" className="change-pass-btn" onClick={() => setPassMode(true)}><Lock size={16} /> Change Password</button>
                        </div>
                </form>
            )}

            {passMode && (
                <div className="modal-overlay">
                    <div className="password-modal animate-fade-in">
                        <div className="modal-header">
                            <h3>Change Password</h3>
                            <button onClick={() => setPassMode(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleChangePassword}>
                            <div className="form-group">
                                <label>Current Password</label>
                                <input type="password" value={passData.currentPassword} onChange={e => setPassData({...passData, currentPassword: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input type="password" value={passData.newPassword} onChange={e => setPassData({...passData, newPassword: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input type="password" value={passData.confirmPassword} onChange={e => setPassData({...passData, confirmPassword: e.target.value})} required />
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="save-btn" disabled={saving}>
                                    {saving ? <Loader className="spin" /> : "Update Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const OrdersSection = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [confirmCancel, setConfirmCancel] = useState(null);
    const [cancelling, setCancelling] = useState(false);

    const fetchOrders = async () => {
        try {
            const res = await API.get('/orders/myorders');
            if (res.data.success) {
                setOrders(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered': return <CheckCircle size={18} color="#10b981" />;
            case 'Shipped': return <Truck size={18} color="#3b82f6" />;
            case 'Processing': return <Clock size={18} color="#f59e0b" />;
            default: return <Clock size={18} color="#64748b" />;
        }
    };

    const filteredOrders = orders.filter(order => 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderItems.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="section-loading"><Loader className="spin" /></div>;

    return (
        <div className="section-container premium-orders-section animate-fade-in">
            <div className="premium-orders-header">
                <div className="header-meta">
                    <h2>Your Orders</h2>
                    <p>Manage and track all your luxury purchases in one place.</p>
                </div>
                <div className="premium-orders-search">
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by Order ID or Product..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="premium-orders-list">
                {orders.length === 0 ? (
                    <div className="empty-state">
                        <Package size={48} />
                        <p>You haven't placed any orders yet.</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="no-results">
                        <AlertCircle size={32} />
                        <p>No orders matched your search.</p>
                    </div>
                ) : (
                    filteredOrders.map((order, idx) => (
                        <div key={order._id} className="premium-order-card animate-slide-up" style={{animationDelay: `${idx * 0.1}s`}}>
                            <div className="premium-card-header">
                                <div className="meta-grid">
                                    <div className="meta-col">
                                        <span className="label">ORDER PLACED</span>
                                        <span className="value">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                    <div className="meta-col">
                                        <span className="label">TOTAL</span>
                                        <span className="value">₹{order.totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="meta-col">
                                        <span className="label">SHIP TO</span>
                                        <span className="value">{order.shippingAddress.city.toLowerCase() === 'surat' ? 'surat' : order.shippingAddress.city}</span>
                                    </div>
                                </div>
                                <div className="id-col">
                                    <span className="label">ORDER # {order._id.toUpperCase()}</span>
                                    <button className="text-link-btn" onClick={() => navigate(`/order/${order._id}`)}>View Order Details</button>
                                </div>
                            </div>

                            <div className="premium-card-body">
                                <div className="delivery-row">
                                    <div className="status-pill">
                                        {getStatusIcon(order.status)}
                                        <span>{order.status.toUpperCase()}</span>
                                    </div>
                                    <span className="pmt-label">
                                        <CreditCard size={14} /> 
                                        {order.isPaid ? 'Paid' : (order.paymentMethod === 'COD' ? 'Pay on Delivery' : 'Pending')}
                                    </span>
                                </div>

                                <div className="products-preview">
                                    {order.orderItems.map((item, i) => (
                                        <div key={i} className="preview-row">
                                            <div className="img-box">
                                                <img src={item.image} alt={item.name} />
                                            </div>
                                            <div className="info-box">
                                                <h5>{item.name}</h5>
                                                <p>Qty: {item.quantity} • {item.size}</p>
                                                <span className="price-tag">₹{item.price.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="premium-card-footer">
                                <button 
                                    className="premium-track-btn"
                                    onClick={() => navigate(`/order/${order._id}`)}
                                >
                                    Track Package <ChevronRight size={16} />
                                </button>
                                
                                {(order.status === 'Processing' || order.status === 'Shipped') && (
                                    <button 
                                        className="premium-cancel-btn-sm"
                                        onClick={() => setConfirmCancel(order)}
                                    >
                                        Cancel Order
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedOrder && (
                <OrderDetailsModal 
                    order={selectedOrder} 
                    onClose={() => setSelectedOrder(null)} 
                    onCancel={() => {
                        setConfirmCancel(selectedOrder);
                        setSelectedOrder(null);
                    }}
                />
            )}

            {confirmCancel && (
                <CancelOrderModal 
                    order={confirmCancel} 
                    onClose={() => setConfirmCancel(null)} 
                    onConfirm={async (reason) => {
                        setCancelling(true);
                        try {
                            const res = await API.put(`/orders/${confirmCancel._id}/cancel`, { reason });
                            if (res.data.success) {
                                setOrders(prev => prev.map(o => o._id === confirmCancel._id ? res.data.data : o));
                                setConfirmCancel(null);
                            }
                        } catch (err) {
                            alert(err.response?.data?.message || "Failed to cancel order");
                        } finally {
                            setCancelling(false);
                        }
                    }}
                    loading={cancelling}
                />
            )}
        </div>
    );
};

const OrderDetailsModal = ({ order, onClose, onCancel }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="account-modal order-detail-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Order Details</h3>
                    <button className="close-modal" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="modal-body">
                    <div className="od-header">
                        <div className="od-id">Order ID: <strong>#{order._id.substring(0, 12).toUpperCase()}</strong></div>
                        <div className={`status-tag ${order.status.toLowerCase()}`}>{order.status}</div>
                    </div>

                    <div className="od-section">
                        <h4>Items ({order.orderItems.length})</h4>
                        <div className="od-items-list">
                            {order.orderItems.map((item, idx) => (
                                <div key={idx} className="od-item">
                                    <img src={item.image} alt={item.name} />
                                    <div className="item-info">
                                        <h5>{item.name}</h5>
                                        <p>Qty: {item.quantity} | Size: {item.size || 'N/A'}</p>
                                        <span className="price">₹{item.price.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="od-grid">
                        <div className="od-section">
                            <h4>Shipping Address</h4>
                            <div className="address-info-mini">
                                <strong>{order.shippingAddress.fullName || order.user?.name}</strong>
                                <p>{order.shippingAddress.address}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                <p>Phone: {order.shippingAddress.phone}</p>
                            </div>
                        </div>
                        <div className="od-section">
                            <h4>Payment Summary</h4>
                            <div className="payment-summary-mini">
                                <div className="summary-row"><span>Subtotal</span> <span>₹{order.itemsPrice.toLocaleString()}</span></div>
                                <div className="summary-row"><span>Shipping</span> <span>₹{order.shippingPrice.toLocaleString()}</span></div>
                                <div className="summary-row total"><span>Total Amount</span> <span>₹{order.totalPrice.toLocaleString()}</span></div>
                                <div className="payment-method">Method: <strong>{order.paymentMethod}</strong></div>
                                {order.isRefunded && (
                                    <div className="refund-badge-mini">REFUNDED</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {order.refundProof && (
                        <div className="od-section refund-proof-section">
                            <h4>Refund confirmation</h4>
                            <div className="refund-proof-card">
                                <div className="proof-image">
                                    <img src={order.refundProof} alt="Refund Proof" onClick={() => window.open(order.refundProof, '_blank')} />
                                </div>
                                <div className="proof-details">
                                    <p>Your refund has been processed successfully.</p>
                                    <div className="tx-id">Transaction ID: <strong>{order.refundTransactionId || 'N/A'}</strong></div>
                                    <span className="notice">Click image to view full receipt</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="od-section tracking">
                        <h4>Tracking History</h4>
                        <div className="rd-timeline">
                            {order.trackingLog?.map((log, i) => (
                                <div key={i} className="time-item done">
                                    <div className="time-icon"><Check size={14} /></div>
                                    <div className="time-info">
                                        <strong>{log.status}</strong>
                                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                                        <p>{log.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="modal-footer flex-gap">
                    {['Processing', 'Shipped'].includes(order.status) && (
                        <button className="text-btn red-border" onClick={onCancel}>Cancel Order</button>
                    )}
                    <button className="cancel-btn full-flex" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

const CancelOrderModal = ({ order, onClose, onConfirm, loading }) => {
    const [reason, setReason] = useState("");
    const reasons = [
        "Mistake in Order",
        "Found a better price elsewhere",
        "Delivery time is too long",
        "Change of mind",
        "Other"
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="account-modal confirm-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Cancel Order</h3>
                    <button className="close-modal" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="modal-body text-center">
                    <AlertCircle size={48} color="#ef4444" className="margin-auto" />
                    <h4 className="mt-20">Cancel Order #{order._id.substring(0, 8).toUpperCase()}?</h4>
                    <p className="mt-10">Please let us know why you are cancelling this order.</p>
                    
                    <div className="reason-selector mt-20">
                        <select 
                            value={reason} 
                            onChange={(e) => setReason(e.target.value)}
                            className="form-select"
                        >
                            <option value="">Select a reason...</option>
                            {reasons.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                </div>
                <div className="modal-footer flex-col">
                    <button 
                        className="save-btn full-width" 
                        onClick={() => onConfirm(reason)}
                        disabled={!reason || loading}
                    >
                        {loading ? <Loader className="spin" /> : "Confirm Cancellation"}
                    </button>
                    <button className="cancel-btn full-width mt-10" onClick={onClose} disabled={loading}>Keep My Order</button>
                </div>
            </div>
        </div>
    );
};

const WishlistSection = ({ onAddToCart, onToggleWishlist }) => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = async () => {
        try {
            const res = await API.get('/wishlist');
            if (res.data.success) {
                // We use products.map(p => p.product) to get the actual product objects
                setWishlist(res.data.data.products.map(p => p.product));
            }
        } catch (err) {
            console.error("Wishlist fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemove = async (productId) => {
        try {
            await API.delete(`/wishlist/${productId}`);
            // Update local state
            setWishlist(prev => prev.filter(item => item._id !== productId));
            // Sync with global state if provided
            if (onToggleWishlist) {
                const product = wishlist.find(item => item._id === productId);
                if (product) onToggleWishlist(product);
            }
        } catch (err) {
            console.error("Remove from wishlist error:", err);
        }
    };

    const handleMoveToCart = async (product) => {
        try {
            if (onAddToCart) {
                onAddToCart(product);
                // Also remove from wishlist after moving to cart
                await handleRemove(product._id);
            }
        } catch (err) {
            console.error("Move to cart error:", err);
        }
    };

    if (loading) return <div className="section-loading"><Loader className="spin" /></div>;

    return (
        <div className="section-container wishlist-section animate-fade-in">
            <div className="section-header">
                <h2>My Wishlist ❤️</h2>
            </div>
            <div className="wishlist-grid">
                {wishlist.length === 0 ? (
                    <div className="empty-state">
                        <Heart size={48} />
                        <p>Your wishlist is currently empty.</p>
                        <span>Save items you love to find them here!</span>
                    </div>
                ) : (
                    wishlist.map(item => (
                        <div key={item._id} className="wish-item-card">
                            <div className="wish-image-wrapper">
                                <img src={item.image} alt={item.name} />
                                <div className="wish-badge">SAVE</div>
                            </div>
                            <div className="wish-info">
                                <h4>{item.name}</h4>
                                <div className="wish-price">
                                    <span className="current">₹{item.price.toLocaleString()}</span>
                                    {item.oldPrice && <span className="old">₹{item.oldPrice.toLocaleString()}</span>}
                                </div>
                                <div className="wish-actions">
                                    <button className="btn-move" onClick={() => handleMoveToCart(item)}>
                                        <ShoppingBag size={16} />
                                        <span>Move to Cart</span>
                                    </button>
                                    <button className="btn-remove" onClick={() => handleRemove(item._id)} title="Remove">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const AddressesSection = ({ user, setUser }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    const addresses = user?.addresses || [];

    const handleAddClick = () => {
        setEditingAddress(null);
        setShowModal(true);
    };

    const handleEditClick = (addr) => {
        setEditingAddress(addr);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this address?")) return;
        try {
            const res = await API.delete(`/auth/address/${id}`);
            if (res.data.success) {
                setUser({ ...user, addresses: res.data.data });
            }
        } catch (err) {
            console.error("Delete address error:", err);
            alert("Failed to delete address");
        }
    };

    const handleSetDefault = async (id) => {
        try {
            const res = await API.put(`/auth/address/default/${id}`);
            if (res.data.success) {
                setUser({ ...user, addresses: res.data.data });
            }
        } catch (err) {
            console.error("Set default error:", err);
            alert("Failed to set default address");
        }
    };

    const onAddressSaved = (updatedAddresses) => {
        setUser({ ...user, addresses: updatedAddresses });
        setShowModal(false);
    };

    return (
        <div className="section-container addresses-section animate-fade-in">
            <div className="section-header">
                <h2>My Addresses</h2>
                {addresses.length < 2 ? (
                    <button className="add-btn" onClick={handleAddClick}>
                        <Plus size={18} /> Add New Address
                    </button>
                ) : (
                    <span className="limit-tag"><AlertCircle size={14} /> Maximum 2 Addresses Saved</span>
                )}
            </div>

            <div className="address-grid">
                {addresses.length === 0 ? (
                    <div className="empty-state">
                        <MapPin size={48} />
                        <p>No addresses saved yet.</p>
                        <button className="add-btn-large" onClick={handleAddClick}>Add Your First Address</button>
                    </div>
                ) : (
                    addresses.sort((a,b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)).map(addr => (
                        <div key={addr._id} className={`address-card ${addr.isDefault ? 'active' : ''}`}>
                            {addr.isDefault && <div className="card-badge">Default Address</div>}
                            <div className="addr-content">
                                <div className="addr-type-header">
                                    <span className={`addr-type-tag ${addr.addressType?.toLowerCase()}`}>
                                        {addr.addressType === 'Home' && <Home size={12} />}
                                        {addr.addressType === 'Work' && <Briefcase size={12} />}
                                        {addr.addressType === 'Other' && <Building2 size={12} />}
                                        {addr.addressType || 'Home'}
                                    </span>
                                </div>
                                <strong>{addr.fullName}</strong>
                                <p><Phone size={14} /> {addr.mobileNumber}</p>
                                <p><MapPin size={14} /> {addr.houseNumber}, {addr.street}</p>
                                <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                                <p>India</p>
                            </div>
                            <div className="addr-actions">
                                <button className="edit-addr-btn" onClick={() => handleEditClick(addr)}><Edit3 size={14} /> Edit</button>
                                <button className="delete-addr-btn" onClick={() => handleDelete(addr._id)}><Trash2 size={14} /> Remove</button>
                                {!addr.isDefault && (
                                    <button className="set-default-btn" onClick={() => handleSetDefault(addr._id)}>Set Default</button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <AddressModal 
                    address={editingAddress} 
                    onClose={() => setShowModal(false)} 
                    onSaved={onAddressSaved}
                />
            )}
        </div>
    );
};

const AddressModal = ({ address, onClose, onSaved }) => {
    const [formData, setFormData] = useState({
        fullName: address?.fullName || '',
        mobileNumber: address?.mobileNumber || '',
        houseNumber: address?.houseNumber || '',
        street: address?.street || '',
        city: address?.city || '',
        state: address?.state || '',
        pincode: address?.pincode || '',
        addressType: address?.addressType || 'Home',
        isDefault: address ? address.isDefault : false
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let res;
            if (address) {
                res = await API.put(`/auth/address/${address._id}`, formData);
            } else {
                res = await API.post('/auth/address', formData);
            }
            if (res.data.success) {
                onSaved(res.data.data);
            }
        } catch (err) {
            console.error("Save address error:", err);
            alert("Failed to save address");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="account-modal-overlay" onClick={onClose}>
            <div className="account-modal animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{address ? 'Edit Address' : 'Add New Address'}</h3>
                    <button className="modal-close" onClick={onClose}><X size={20} /></button>
                </div>
                <form className="modal-body" onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                value={formData.fullName} 
                                onChange={e => setFormData({...formData, fullName: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Mobile Number</label>
                            <input 
                                type="text" 
                                value={formData.mobileNumber} 
                                onChange={e => setFormData({...formData, mobileNumber: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>House / Flat No.</label>
                            <input 
                                type="text" 
                                value={formData.houseNumber} 
                                onChange={e => setFormData({...formData, houseNumber: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Street / Colony</label>
                            <input 
                                type="text" 
                                value={formData.street} 
                                onChange={e => setFormData({...formData, street: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>City</label>
                            <input 
                                type="text" 
                                value={formData.city} 
                                onChange={e => setFormData({...formData, city: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Pincode</label>
                            <input 
                                type="text" 
                                value={formData.pincode} 
                                onChange={e => setFormData({...formData, pincode: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Address Type</label>
                            <div className="type-selector">
                                <button 
                                    type="button" 
                                    className={`type-btn ${formData.addressType === 'Home' ? 'active' : ''}`}
                                    onClick={() => setFormData({...formData, addressType: 'Home'})}
                                >
                                    <Home size={14} /> Home
                                </button>
                                <button 
                                    type="button" 
                                    className={`type-btn ${formData.addressType === 'Work' ? 'active' : ''}`}
                                    onClick={() => setFormData({...formData, addressType: 'Work'})}
                                >
                                    <Briefcase size={14} /> Work
                                </button>
                                <button 
                                    type="button" 
                                    className={`type-btn ${formData.addressType === 'Other' ? 'active' : ''}`}
                                    onClick={() => setFormData({...formData, addressType: 'Other'})}
                                >
                                    <Building2 size={14} /> Other
                                </button>
                            </div>
                        </div>
                        <div className="form-group full-width checkbox-group">
                            <label className="checkbox-container">
                                <input 
                                    type="checkbox" 
                                    checked={formData.isDefault} 
                                    onChange={e => setFormData({...formData, isDefault: e.target.checked})} 
                                />
                                <span className="checkmark"></span>
                                Set as Default Address
                            </label>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="save-btn" disabled={saving}>
                            {saving ? <Loader className="spin" size={16} /> : <Save size={16} />}
                            {address ? 'Update Address' : 'Save Address'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PaymentsSection = ({ user, setUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(null);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this payment method?')) return;
        setDeleting(id);
        try {
            const res = await API.delete(`/auth/payment-method/${id}`);
            if (res.data.success) {
                setUser({ ...user, paymentMethods: res.data.data });
            }
        } catch (err) {
            console.error(err);
            alert('Failed to delete payment method');
        } finally {
            setDeleting(null);
        }
    };

    const handleSetDefault = async (id) => {
        try {
            const res = await API.put(`/auth/payment-method/default/${id}`);
            if (res.data.success) {
                setUser({ ...user, paymentMethods: res.data.data });
            }
        } catch (err) {
            console.error(err);
            alert('Failed to set default payment method');
        }
    };

    return (
        <div className="section-container payments-section animate-fade-in">
            <div className="section-header">
                <div className="header-info">
                    <h2>Payment Methods</h2>
                    <p className="subtitle">Manage your saved cards and UPI IDs</p>
                </div>
                <button className="add-btn" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Add New Method
                </button>
            </div>

            {(!user?.paymentMethods || user.paymentMethods.length === 0) ? (
                <div className="empty-state placeholder">
                    <div className="empty-icon-wrapper">
                        <CreditCard size={48} />
                    </div>
                    <h3>No Payment Methods Saved</h3>
                    <p>Save your cards or UPI IDs for a faster and smoother checkout experience.</p>
                    <button className="primary-btn-outline" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Add Your First Method
                    </button>
                </div>
            ) : (
                <div className="payment-methods-grid">
                    {user.paymentMethods.map(method => (
                        <div key={method._id} className={`payment-card ${method.isDefault ? 'is-default' : ''}`}>
                            <div className="card-type-header">
                                <div className={`method-type-badge ${method.methodType.toLowerCase()}`}>
                                    {method.methodType === 'Card' ? <CreditCard size={14} /> : <IndianRupee size={14} />}
                                    {method.methodType}
                                </div>
                                {method.isDefault && <span className="default-pill">Default</span>}
                            </div>
                            
                            <div className="card-main-info">
                                {method.methodType === 'Card' ? (
                                    <>
                                        <div className="card-num">{method.cardNumber}</div>
                                        <div className="card-footer-info">
                                            <span className="holder">{method.cardHolder}</span>
                                            <span className="expiry">{method.expiry}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="upi-info">
                                        <div className="upi-id">{method.upiId}</div>
                                        <div className="upi-label">UPI ID</div>
                                    </div>
                                )}
                            </div>

                            <div className="card-actions">
                                {!method.isDefault && (
                                    <button 
                                        className="text-action green" 
                                        onClick={() => handleSetDefault(method._id)}
                                    >
                                        Set Default
                                    </button>
                                )}
                                <button 
                                    className="delete-icon-btn" 
                                    onClick={() => handleDelete(method._id)}
                                    disabled={deleting === method._id}
                                >
                                    {deleting === method._id ? <Loader className="spin" size={16} /> : <Trash2 size={16} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <PaymentMethodModal 
                    onClose={() => setIsModalOpen(false)} 
                    user={user} 
                    setUser={setUser} 
                />
            )}
        </div>
    );
};

const PaymentMethodModal = ({ onClose, setUser, user }) => {
    const [methodType, setMethodType] = useState('Card'); // 'Card' or 'UPI'
    const [formData, setFormData] = useState({
        cardHolder: '',
        cardNumber: '',
        expiry: '',
        cardType: 'Visa',
        upiId: '',
        isDefault: false
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Validate & Mask card number if it's a card
            let processedData = { ...formData, methodType };
            if (methodType === 'Card') {
                const last4 = formData.cardNumber.slice(-4);
                processedData.cardNumber = `**** **** **** ${last4}`;
            }

            const res = await API.post('/auth/payment-method', processedData);
            if (res.data.success) {
                setUser({ ...user, paymentMethods: res.data.data });
                onClose();
            }
        } catch (err) {
            console.error(err);
            alert('Failed to save payment method');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="account-modal-overlay" onClick={onClose}>
            <div className="account-modal animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Add Payment Method</h3>
                    <button className="modal-close" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group full-width">
                            <label>Method Type</label>
                            <div className="type-selector">
                                <button 
                                    type="button" 
                                    className={`type-btn ${methodType === 'Card' ? 'active' : ''}`}
                                    onClick={() => setMethodType('Card')}
                                >
                                    <CreditCard size={16} /> Card
                                </button>
                                <button 
                                    type="button" 
                                    className={`type-btn ${methodType === 'UPI' ? 'active' : ''}`}
                                    onClick={() => setMethodType('UPI')}
                                >
                                    <IndianRupee size={16} /> UPI
                                </button>
                            </div>
                        </div>

                        {methodType === 'Card' ? (
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Card Holder Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="John Doe"
                                        value={formData.cardHolder}
                                        onChange={e => setFormData({...formData, cardHolder: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Card Number</label>
                                    <input 
                                        type="text" 
                                        placeholder="0000 0000 0000 0000"
                                        maxLength="19"
                                        value={formData.cardNumber}
                                        onChange={e => setFormData({...formData, cardNumber: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Expiry Date</label>
                                    <input 
                                        type="text" 
                                        placeholder="MM/YY"
                                        maxLength="5"
                                        value={formData.expiry}
                                        onChange={e => setFormData({...formData, expiry: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Card Type</label>
                                    <select 
                                        value={formData.cardType}
                                        onChange={e => setFormData({...formData, cardType: e.target.value})}
                                        className="form-select"
                                    >
                                        <option value="Visa">Visa</option>
                                        <option value="Mastercard">Mastercard</option>
                                        <option value="Rupay">Rupay</option>
                                        <option value="Amex">Amex</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="form-group full-width">
                                <label>UPI ID</label>
                                <input 
                                    type="text" 
                                    placeholder="username@bank"
                                    value={formData.upiId}
                                    onChange={e => setFormData({...formData, upiId: e.target.value})}
                                    required
                                />
                            </div>
                        )}

                        <div className="form-group full-width checkbox-group">
                            <label className="checkbox-container">
                                <input 
                                    type="checkbox" 
                                    checked={formData.isDefault}
                                    onChange={e => setFormData({...formData, isDefault: e.target.checked})}
                                />
                                <span className="checkmark"></span>
                                Set as Default Payment Method
                            </label>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="save-btn" disabled={saving}>
                            {saving ? <Loader className="spin" size={16} /> : <Save size={16} />}
                            Save Payment Method
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TrackingSection = () => {
    const [orderId, setOrderId] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleTrack = async (e) => {
        e.preventDefault();
        const cleanId = orderId.trim().replace(/^#/, '');
        if (!cleanId) return;
        setLoading(true);
        setError(null);
        setOrder(null);
        try {
            const res = await API.get(`/orders/${cleanId}`);
            if (res.data.success) {
                setOrder(res.data.data);
            }
        } catch (err) {
            if (err.response?.status === 403 || err.response?.status === 401) {
                setError("You are not authorized to track this order.");
            } else if (err.response?.status === 400 || err.response?.status === 404) {
                setError("Invalid Order ID or Order not found.");
            } else {
                setError("An error occurred while tracking your order.");
            }
        } finally {
            setLoading(false);
        }
    };

    const steps = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
    // For visual mapping: Placed (mapped to index 0 - Processing), Shipped, Out for Delivery, Delivered
    const currentStepIndex = order ? steps.indexOf(order.status) : -1;

    return (
        <div className="section-container tracking-section animate-fade-in">
            <div className="section-header">
                <h2>Order Tracking</h2>
            </div>

            <div className="tracking-search">
                <p>Enter your Order ID to track in real-time.</p>
                <form className="track-input-group" onSubmit={handleTrack}>
                    <input 
                        type="text" 
                        placeholder="e.g. 69B05A5A..." 
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? <Loader className="spin" size={18} /> : "Track Order"}
                    </button>
                </form>
            </div>

            {error && <div className="status-banner error">{error}</div>}

            {order && (
                <div className="tracking-result-area animate-fade-in">
                    <div className="tracking-visual-card">
                        <div className="tracking-steps-horizontal">
                            <div className={`step-item ${currentStepIndex >= 0 || (order && order.status !== 'Cancelled') ? 'active' : ''}`}>
                                <div className="step-point"><Clock size={16} /></div>
                                <span>Processing</span>
                            </div>
                            <div className={`step-item ${currentStepIndex >= 1 ? 'active' : ''}`}>
                                <div className="step-point"><Package size={16} /></div>
                                <span>Shipped</span>
                            </div>
                            <div className={`step-item ${currentStepIndex >= 2 ? 'active' : ''}`}>
                                <div className="step-point"><Truck size={16} /></div>
                                <span>Out for Delivery</span>
                            </div>
                            <div className={`step-item ${currentStepIndex >= 3 ? 'active' : ''}`}>
                                <div className="step-point"><CheckCircle size={16} /></div>
                                <span>Delivered</span>
                            </div>
                        </div>
                        {order.status === 'Cancelled' && (
                            <div className="cancelled-notice">
                                <AlertCircle size={20} />
                                <span>This order was cancelled.</span>
                            </div>
                        )}
                    </div>

                    <div className="order-summary-mini">
                        <div className="summary-item">
                            <label>Order Status</label>
                            <span className={`status-tag-large ${order.status.toLowerCase()}`}>{order.status}</span>
                        </div>
                        <div className="summary-item">
                            <label>Estimated Delivery</label>
                            <span>{order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'Expected in 3-5 days'}</span>
                        </div>
                    </div>

                    <div className="tracking-history">
                        <h3>Tracking History</h3>
                        <div className="history-timeline">
                            {order.trackingLog && order.trackingLog.length > 0 ? (
                                order.trackingLog.slice().reverse().map((log, idx) => (
                                    <div key={idx} className="timeline-item">
                                        <div className="timeline-dot"></div>
                                        <div className="timeline-content">
                                            <div className="timeline-header">
                                                <strong>{log.status}</strong>
                                                <span>{new Date(log.timestamp).toLocaleString()}</span>
                                            </div>
                                            <p>{log.message}</p>
                                            {log.location && <span className="location"><MapPin size={12} /> {log.location}</span>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-history">No detailed history logs available yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CouponsSection = () => {
    const [timeLeft, setTimeLeft] = useState({ hours: 48, minutes: 0, seconds: 0 });
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Simple countdown logic for demo purposes
        const targetDate = new Date();
        targetDate.setHours(targetDate.getHours() + 48);

        const timer = setInterval(() => {
            const now = new Date();
            const difference = targetDate - now;

            if (difference > 0) {
                setTimeLeft({
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText("SAVE20");
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <div className="section-container coupons-section animate-fade-in">
            <div className="section-header">
                <div className="header-info">
                    <h2>Coupons & Rewards</h2>
                    <p className="subtitle">Unlock exclusive premium savings</p>
                </div>
            </div>
            
            <div className="rewards-dashboard">
                <div className="reward-points-card">
                    <div className="points-icon"><Crown size={32} /></div>
                    <div className="points-details">
                        <span className="label">Total Reward Points</span>
                        <strong className="value">450 <span className="pts">pts</span></strong>
                    </div>
                </div>

                <h3 className="coupons-subhead">Available Deals</h3>
                
                <div className="coupon-grid-premium">
                    <div className="coupon-card-luxury">
                        <div className="coupon-discount-zone">
                            <span className="discount-amount">20%</span>
                            <span className="discount-type">OFF</span>
                        </div>
                        <div className="coupon-details-zone">
                            <strong className="promo-code">SAVE20</strong>
                            <p className="promo-desc">Get 20% OFF on your next elite purchase.</p>
                            
                            <div className="promo-timer">
                                <Clock size={14} />
                                <span>Expires in:</span>
                                <div className="timer-pill">
                                    {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                                </div>
                            </div>
                        </div>
                        <div className="coupon-action-zone">
                            <button className={`btn-copy-luxury ${copied ? 'copied' : ''}`} onClick={handleCopy}>
                                {copied ? <><CheckCircle2 size={16} /> COPIED</> : 'COPY CODE'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReturnsSection = () => {
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [confirmCancel, setConfirmCancel] = useState(null);
    const [returnsList, setReturnsList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRefunds = async () => {
            try {
                // Fetch orders and filter for those that need refund tracking
                // (Cancelled and Paid, or any that have isRefunded true)
                const res = await API.get('/orders/myorders');
                if (res.data.success) {
                    const refunds = res.data.data.filter(order => 
                        (order.status === 'Cancelled' && order.isPaid) || order.isRefunded
                    ).map(order => ({
                        id: `REF-${order._id.substring(order._id.length - 4).toUpperCase()}`,
                        orderId: `#${order._id.substring(0, 8).toUpperCase()}`,
                        date: new Date(order.updatedAt).toLocaleDateString(),
                        status: order.isRefunded ? 'Refunded' : 'Processing',
                        refundAmount: `₹${order.totalPrice.toLocaleString()}`,
                        refundProof: order.refundProof,
                        refundTransactionId: order.refundTransactionId,
                        trackingLog: order.trackingLog,
                        product: {
                            name: order.orderItems[0]?.name || 'Multiple Items',
                            image: order.orderItems[0]?.image || '',
                            count: order.orderItems.length
                        },
                        originalOrder: order // Keep reference
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

    const handleCancelReturn = async () => {
        // For cancelled orders, "Cancel Return" doesn't make much sense if the order is already cancelled,
        // but if it's an actual 'Return' model, we would call that API.
        // For now, let's keep it simple as the user focused on tracking.
        setConfirmCancel(null);
    };

    return (
        <div className="section-container returns-section animate-fade-in">
            <div className="section-header">
                <h2>Returns & Refunds</h2>
                <button className="help-link"><Search size={14} /> Return Policy</button>
            </div>
            
            <div className="returns-list">
                {returnsList.length > 0 ? (
                    returnsList.map(item => (
                        <div key={item.id} className={`return-item-card ${item.status.toLowerCase()}`}>
                            <div className="return-main">
                                <div className="return-prod-img">
                                    <img src={item.product.image} alt={item.product.name} />
                                </div>
                                <div className="return-details">
                                    <div className="return-meta">
                                        <span className="return-id">{item.id}</span>
                                        <span className="dot">•</span>
                                        <span className="return-date">{item.date}</span>
                                    </div>
                                    <h4>{item.product.name} {item.product.count > 1 ? `(+${item.product.count - 1} more)` : ''}</h4>
                                    <div className="order-ref">Order ID: {item.orderId}</div>
                                </div>
                                <div className="return-status-area">
                                    <div className={`status-pill ${item.status.toLowerCase()}`}>
                                        {item.status === 'Refunded' ? <CheckCircle size={14} /> : 
                                         item.status === 'Cancelled' ? <X size={14} /> : <Clock size={14} />}
                                        {item.status}
                                    </div>
                                    <div className="refund-val">{item.status === 'Cancelled' ? '—' : item.refundAmount}</div>
                                </div>
                            </div>
                            
                            {item.status !== 'Cancelled' && (
                                <div className="return-stepper">
                                    <div className={`step ${item.status === 'Processing' || item.status === 'Refunded' ? 'done' : ''}`}>
                                        <div className="dot"></div>
                                        <span>Requested</span>
                                    </div>
                                    <div className={`line ${item.status === 'Refunded' ? 'done' : ''}`}></div>
                                    <div className={`step ${item.status === 'Refunded' ? 'done' : ''}`}>
                                        <div className="dot"></div>
                                        <span>Pick up</span>
                                    </div>
                                    <div className={`line ${item.status === 'Refunded' ? 'done' : ''}`}></div>
                                    <div className={`step ${item.status === 'Refunded' ? 'done' : ''}`}>
                                        <div className="dot"></div>
                                        <span>Refunded</span>
                                    </div>
                                </div>
                            )}

                            <div className="return-footer">
                                <button className="outline-btn-sm" onClick={() => setSelectedReturn(item)}>View Details</button>
                                {item.status === 'Processing' && (
                                    <button className="text-btn red" onClick={() => setConfirmCancel(item)}>Cancel Return</button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state placeholder">
                        <RotateCcw size={48} />
                        <p>No active return requests.</p>
                    </div>
                )}
            </div>

            {selectedReturn && (
                <ReturnDetailsModal 
                    item={selectedReturn} 
                    onClose={() => setSelectedReturn(null)}
                    onCancel={() => setConfirmCancel(selectedReturn)}
                />
            )}

            {confirmCancel && (
                <div className="modal-overlay" onClick={() => setConfirmCancel(null)}>
                    <div className="account-modal confirm-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Confirm Cancellation</h3>
                            <button className="close-modal" onClick={() => setConfirmCancel(null)}><X size={20} /></button>
                        </div>
                        <div className="modal-body text-center">
                            <AlertCircle size={48} color="#ef4444" className="margin-auto" />
                            <h4 className="mt-20">Are you sure?</h4>
                            <p className="mt-10">This will cancel your return request for <strong>{confirmCancel.product.name}</strong>. This action cannot be undone.</p>
                        </div>
                        <div className="modal-footer flex-col">
                            <button className="save-btn full-width" onClick={() => handleCancelReturn()}>Yes, Cancel Request</button>
                            <button className="cancel-btn full-width mt-10" onClick={() => setConfirmCancel(null)}>Keep Return Request</button>
                        </div>
                    </div>
                </div>
            )}
            {loading && <div className="section-loading"><Loader className="spin" /></div>}
        </div>
    );
};

const ReturnDetailsModal = ({ item, onClose, onCancel }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="account-modal return-detail-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Return Details</h3>
                    <button className="close-modal" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="modal-body">
                    <div className="rd-header">
                        <div className="rd-id">Return ID: <strong>{item.id}</strong></div>
                        <div className={`status-badge ${item.status.toLowerCase()}`}>{item.status}</div>
                    </div>

                    <div className="rd-product">
                        <img src={item.product.image} alt={item.product.name} />
                        <div className="rd-prod-info">
                            <h4>{item.product.name}</h4>
                            <p>Order ID: {item.orderId}</p>
                            <div className="refund-amount">Refund Amount: <span>{item.status === 'Cancelled' ? '—' : item.refundAmount}</span></div>
                        </div>
                    </div>

                    {item.status !== 'Cancelled' ? (
                        <div className="rd-timeline">
                            {item.trackingLog ? (
                                item.trackingLog.slice().reverse().map((log, i) => (
                                    <div key={i} className={`time-item ${i === 0 ? 'active' : 'done'}`}>
                                        <div className="time-icon"><Check size={14} /></div>
                                        <div className="time-info">
                                            <strong>{log.status}</strong>
                                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                                            <p>{log.message}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="time-item done">
                                    <div className="time-icon"><Check size={14} /></div>
                                    <div className="time-info">
                                        <strong>Return Requested</strong>
                                        <span>{item.date} • 10:30 AM</span>
                                        <p>Your request has been received and is being processed.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="cancelled-notice">
                            <AlertCircle size={20} />
                            <p>This return request has been cancelled by the user. No further actions are required.</p>
                        </div>
                    )}

                    {item.refundProof && (
                        <div className="od-section refund-proof-section">
                            <h4>Refund confirmation</h4>
                            <div className="refund-proof-card">
                                <div className="proof-image">
                                    <img src={item.refundProof} alt="Refund Proof" onClick={() => window.open(item.refundProof, '_blank')} />
                                </div>
                                <div className="proof-details">
                                    <p>Your refund has been processed successfully.</p>
                                    <div className="tx-id">Transaction ID: <strong>{item.refundTransactionId || 'N/A'}</strong></div>
                                    <span className="notice">Click image to view full receipt</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="modal-footer flex-gap">
                    {item.status === 'Processing' && (
                        <button className="text-btn red-border" onClick={onCancel}>Cancel Return</button>
                    )}
                    <button className="cancel-btn full-flex" onClick={onClose}>Close Window</button>
                </div>
            </div>
        </div>
    );
};

const NotificationsSection = () => {
    const notifications = [
        {
            id: 1,
            type: 'shipping',
            title: 'Order Shipped!',
            message: 'Your order #ORD1025 has been shipped and is on its way.',
            time: '2 hours ago',
            icon: <Truck size={16} />
        },
        {
            id: 2,
            type: 'promo',
            title: 'Special Discount',
            message: 'New coupon available for you: SAVE20. Use it now!',
            time: 'Yesterday',
            icon: <Gift size={16} />
        },
        {
            id: 3,
            type: 'account',
            title: 'Security Alert',
            message: 'Your password was successfully updated.',
            time: '2 days ago',
            icon: <Lock size={16} />
        }
    ];

    return (
        <div className="section-container notify-section animate-fade-in">
            <div className="section-header">
                <h2>Notifications</h2>
                <button className="text-btn">Mark all as read</button>
            </div>
            <div className="notify-list">
                {notifications.map(n => (
                    <div key={n.id} className={`notify-item ${n.type}`}>
                        <div className="ni-icon">{n.icon}</div>
                        <div className="ni-content">
                            <div className="ni-header">
                                <strong>{n.title}</strong>
                                <span>{n.time}</span>
                            </div>
                            <p>{n.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SupportSection = () => (
    <div className="section-container support-section animate-fade-in">
        <div className="section-header">
            <h2>Help & Support</h2>
        </div>
        <div className="support-grid">
            <div className="support-card" onClick={() => window.location.href='/support'}>
                <div className="sc-icon chat"><Headphones size={24} /></div>
                <div className="sc-info">
                    <h4>Chat with Support</h4>
                    <p>Get live assistance for your queries</p>
                </div>
                <ChevronRight size={18} className="sc-arrow" />
            </div>
            <div className="support-card">
                <div className="sc-icon faq"><Search size={24} /></div>
                <div className="sc-info">
                    <h4>FAQs</h4>
                    <p>Browse through frequently asked questions</p>
                </div>
                <ChevronRight size={18} className="sc-arrow" />
            </div>
            <div className="support-card email-card">
                <div className="sc-icon mail"><Mail size={24} /></div>
                <div className="sc-info">
                    <h4>Contact Us</h4>
                    <p>support@panditfashion.com</p>
                </div>
                <div className="sc-action"><button className="btn-sm-red">Send Email</button></div>
            </div>
        </div>
        
        <div className="support-footer">
            <p>Our support team is available Mon-Fri, 9AM-6PM IST.</p>
        </div>
    </div>
);

export default MyAccount;
