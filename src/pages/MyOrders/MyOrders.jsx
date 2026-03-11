import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Package, 
    Truck, 
    CheckCircle, 
    Clock, 
    CreditCard, 
    ChevronRight, 
    Search,
    AlertCircle,
    Loader,
    ShoppingBag
} from 'lucide-react';
import API from '../../utils/api';
import Swal from 'sweetalert2';
import './MyOrders.css';

const MyOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const handleCancel = async (orderId, isPaid) => {
        const text = isPaid 
            ? "This order is prepaid. Your refund will be processed within 24 hours of cancellation." 
            : "Are you sure you want to cancel this order?";

        const result = await Swal.fire({
            title: 'Cancel Order?',
            text: text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, cancel it!',
            cancelButtonText: 'No, keep it',
            background: '#ffffff',
            borderRadius: '15px'
        });

        if (result.isConfirmed) {
            try {
                const res = await API.put(`/orders/${orderId}/cancel`);
                if (res.data.success) {
                    Swal.fire({
                        title: 'Cancelled!',
                        text: res.data.message,
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false,
                        borderRadius: '15px'
                    });
                    fetchOrders();
                }
            } catch (err) {
                Swal.fire({
                    title: 'Error!',
                    text: err.response?.data?.message || 'Failed to cancel order',
                    icon: 'error',
                    borderRadius: '15px'
                });
            }
        }
    };

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

    if (loading) return (
        <div className="orders-loading">
            <Loader size={48} className="spin" />
            <p>Retrieving your premium orders...</p>
        </div>
    );

    return (
        <div className="premium-orders-page-standalone animate-fade-in">
            <div className="premium-orders-header">
                <div className="header-meta">
                    <h1>Your Orders</h1>
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

            <div className="premium-orders-list container">
                {orders.length === 0 ? (
                    <div className="empty-state">
                        <Package size={48} />
                        <p>You haven't placed any orders yet.</p>
                        <Link to="/products" className="start-shopping-btn">Explore Collection</Link>
                    </div>
                ) : (
                    filteredOrders.map((order, idx) => (
                        <div key={order._id} className="premium-order-card animate-slide-up" style={{animationDelay: `${idx * 0.1}s`}}>
                            <div className="premium-card-header">
                                <div className="meta-grid">
                                    <div className="meta-col">
                                        <span className="label">ORDER PLACED</span>
                                        <span className="value">
                                            {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            <span className="time-sub"> at {new Date(order.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                        </span>
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
                                    <Link to={`/order/${order._id}`} className="text-link-btn">View Order Details</Link>
                                </div>
                            </div>

                            <div className="premium-card-body">
                                <div className="delivery-row">
                                    <div className={`status-pill ${order.status.toLowerCase() === 'cancelled' ? 'cancelled' : ''}`}>
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
                                    Track Package <ChevronRight size={18} />
                                </button>
                                
                                {(order.status === 'Processing' || order.status === 'Shipped') && (
                                    <button 
                                        className="cancel-btn-lite"
                                        onClick={() => handleCancel(order._id, order.isPaid)}
                                    >
                                        Cancel Order
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyOrders;
