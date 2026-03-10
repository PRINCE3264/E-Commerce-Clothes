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
        <div className="my-orders-page">
            <div className="container">
                <div className="orders-header">
                    <div className="header-content">
                        <h1>Your Orders</h1>
                        <p>Manage and track all your luxury purchases in one place.</p>
                    </div>
                    <div className="orders-search">
                        <Search size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by Order ID or Product..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="empty-orders-card animate-pop-in">
                        <div className="empty-icon">
                            <ShoppingBag size={60} />
                        </div>
                        <h2>No orders found</h2>
                        <p>It seems you haven't placed any orders yet. Start exploring our premium collection.</p>
                        <Link to="/products" className="start-shopping-btn">Explore Collection</Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {filteredOrders.map((order, idx) => (
                            <div key={order._id} className="order-card glass-panel animate-slide-up" style={{animationDelay: `${idx * 0.1}s`}}>
                                <div className="order-card-header">
                                    <div className="order-main-meta">
                                        <div className="meta-item">
                                            <span className="label">ORDER PLACED</span>
                                            <span className="value">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="label">TOTAL</span>
                                            <span className="value">₹{order.totalPrice.toLocaleString()}</span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="label">SHIP TO</span>
                                            <span className="value user-name">{order.shippingAddress.city}</span>
                                        </div>
                                    </div>
                                    <div className="order-id-meta">
                                        <span className="label">ORDER # {order._id.toUpperCase()}</span>
                                        <div className="order-actions-top">
                                            <Link to={`/order/${order._id}`} className="view-details-link">View Order Details</Link>
                                        </div>
                                    </div>
                                </div>

                                <div className="order-card-body">
                                    <div className="order-delivery-status">
                                        <div className="status-badge">
                                            {getStatusIcon(order.status)}
                                            <span>{order.status}</span>
                                        </div>
                                        <span className="payment-status">
                                            <CreditCard size={14} /> 
                                            {order.isPaid ? 'Paid' : (order.paymentMethod === 'COD' ? 'Pay on Delivery' : 'Payment Pending')}
                                        </span>
                                    </div>

                                    <div className="order-products-preview">
                                        {order.orderItems.map((item, i) => (
                                            <div key={i} className="prod-preview-item">
                                                <div className="prod-img">
                                                    <img src={item.image} alt={item.name} />
                                                </div>
                                                <div className="prod-info">
                                                    <h5>{item.name}</h5>
                                                    <p>Qty: {item.quantity} • {item.size}</p>
                                                    <span className="prod-price">₹{item.price.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="order-card-footer">
                                    <button 
                                        className="track-pkg-btn"
                                        onClick={() => navigate(`/order/${order._id}`)}
                                    >
                                        Track Package <ChevronRight size={18} />
                                    </button>
                                    
                                    {(order.status === 'Processing' || order.status === 'Shipped') && (
                                        <button 
                                            className="cancel-order-btn-sm"
                                            onClick={() => handleCancel(order._id, order.isPaid)}
                                        >
                                            Cancel Order
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {filteredOrders.length === 0 && (
                            <div className="no-results-message">
                                <AlertCircle size={40} />
                                <p>No orders matched your search term.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
