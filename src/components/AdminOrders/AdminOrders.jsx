import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Eye, 
    Truck, 
    PackageOpen,
    MapPin,
    Hash,
    CheckCircle,
    AlertCircle,
    CreditCard
} from 'lucide-react';
import API from '../../utils/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import './AdminOrders.css';

const MySwal = withReactContent(Swal);

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const response = await API.get('/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (err) {
            console.error("Admin orders fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const viewOrder = (order) => {
        const orderIdShort = order._id.substring(order._id.length - 12).toUpperCase();
        
        let productsHtml = order.orderItems.map(item => `
            <div class="swal-order-item">
                <img src="${item.image}" alt="${item.name}" />
                <div class="soi-meta">
                    <p class="soi-name">${item.name}</p>
                    <p class="soi-variants">${item.size} • ${item.color} • Qty: ${item.quantity}</p>
                </div>
                <div class="soi-price">₹${item.price.toLocaleString()}</div>
            </div>
        `).join('');

        MySwal.fire({
            title: '',
            html: `
                <div class="sov-wrap">
                    <div class="sov-top-bar">
                        <div class="sov-top-left">
                            <div class="sov-order-id">#${orderIdShort}</div>
                            <div class="sov-order-label">Order Details</div>
                        </div>
                        <div class="sov-status-tag ${order.isPaid ? 'sov-paid' : 'sov-unpaid'}">
                            ${order.isPaid ? '✓ Paid' : '✗ Unpaid'}
                        </div>
                    </div>

                    <div class="sov-body">
                        <div class="sov-left">
                            <div class="sov-section-label">ITEMS (${order.orderItems.length})</div>
                            <div class="sov-items-list">
                                ${productsHtml}
                            </div>
                            <div class="sov-price-summary">
                                <div class="sov-price-row"><span>Subtotal</span><span>₹${order.itemsPrice.toLocaleString()}</span></div>
                                <div class="sov-price-row"><span>Shipping</span><span>₹${order.shippingPrice}</span></div>
                                <div class="sov-price-row sov-total"><span>Total</span><span>₹${order.totalPrice.toLocaleString()}</span></div>
                            </div>
                        </div>

                        <div class="sov-right">
                            <div class="sov-info-block">
                                <div class="sov-info-title">SHIPPING</div>
                                <div class="sov-info-name">${order.user?.name || 'Guest'}</div>
                                <div class="sov-info-line">${order.shippingAddress.address}</div>
                                <div class="sov-info-line">${order.shippingAddress.city}, ${order.shippingAddress.postalCode}</div>
                                <div class="sov-info-line">📞 ${order.shippingAddress.phone}</div>
                            </div>
                            <div class="sov-info-block">
                                <div class="sov-info-title">PAYMENT</div>
                                <div class="sov-info-line">Method: <b>${order.paymentMethod}</b></div>
                                <div class="sov-info-line">Status: <span class="${order.isPaid ? 'sov-val-paid' : 'sov-val-due'}">${order.isPaid ? 'Paid' : 'Unpaid'}</span></div>
                                ${order.isPaid ? `<div class="sov-txn">TXN: ${order.razorpayPaymentId || order.stripePaymentIntentId || order.paymentResult?.id || 'N/A'}</div>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `,
            showCloseButton: true,
            showConfirmButton: false,
            width: '780px',
            padding: '0',
            background: '#ffffff',
            customClass: {
                popup: 'clean-order-swal',
                closeButton: 'clean-order-close'
            }
        });
    };

    const updateOrderStatus = (order) => {
        MySwal.fire({
            title: 'Update Logistics Node',
            html: `
                <div class="swal-update-form">
                    <p style="text-align:left; color:#64748b; font-size:0.9rem; margin-top:-10px; margin-bottom:20px;">
                        Adjusting transit state for Order #${order._id.slice(-6).toUpperCase()}
                    </p>
                    <div class="su-input-group">
                        <label>Transit State</label>
                        <select id="swal-transit-status" class="su-select" aria-label="Status">
                            <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                            <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="Out for Delivery" ${order.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                            <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                    <div class="su-input-group">
                        <label>System Broadcast Message</label>
                        <input id="swal-transit-msg" type="text" class="su-input" placeholder="e.g. Cleared automated sorting facility..." />
                    </div>
                    <div class="su-input-group">
                        <label>Geographic Node Override (Optional)</label>
                        <input id="swal-transit-loc" type="text" class="su-input" placeholder="e.g. Distribution Center, Mumbai" />
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Push Update',
            cancelButtonText: 'Abort',
            width: '450px',
            padding: '2.5rem',
            customClass: {
                popup: 'luxury-admin-swal',
                confirmButton: 'b-swal-confirm-btn-blue',
                cancelButton: 'b-swal-cancel-btn-blue'
            },
            preConfirm: () => {
                return {
                    status: document.getElementById('swal-transit-status').value,
                    message: document.getElementById('swal-transit-msg').value,
                    location: document.getElementById('swal-transit-loc').value
                };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('admin_token');
                    await API.put(`/orders/${order._id}/status`, result.value, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Logistics Updated',
                        text: 'The customer data node has been successfully synchronized.',
                        timer: 2500,
                        showConfirmButton: false,
                        toast: true,
                        position: 'top-end'
                    });
                    fetchOrders();
                } catch {
                    Swal.fire('Error', 'Broadcast payload rejected.', 'error');
                }
            }
        });
    };

    const filteredOrders = orders.filter(o => 
        o._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (o.user?.name && o.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="admin-loading">
            <PackageOpen size={32} className="pf-spin" color="#3b82f6" />
            <p style={{ marginTop: '15px', color: '#64748b', fontWeight: 600 }}>Syncing Master Logistics Database...</p>
        </div>
    );

    return (
        <div className="admin-orders-page animate-fade-in">
            <div className="ao-header-premium">
                <div className="aoh-left">
                    <div className="aoh-icon-container">
                        <PackageOpen size={28} />
                    </div>
                    <div>
                        <h2>Logistics Command</h2>
                        <p>Track global shipments, process payment states, and manage fulfillment.</p>
                    </div>
                </div>
                <div className="aoh-right">
                    <div className="ao-search-box">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Scan by Order ID or Name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="table-responsive glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <table className="admin-table v-modern-grid ao-table">
                    <thead>
                        <tr>
                            <th>Node Reference</th>
                            <th>Customer Identity</th>
                            <th>Valuation</th>
                            <th>Payment State</th>
                            <th>Logistics Vector</th>
                            <th>Action Overlay</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr><td colSpan="6" style={{textAlign: 'center', padding: '60px', color: '#94a3b8', fontWeight: 600}}>No active fulfillment tasks found in the grid.</td></tr>
                        ) : (
                            filteredOrders.map(order => (
                                <tr key={order._id} className="v-row-interactive">
                                    <td className="font-bold">
                                        <div className="ao-id-chip">#{order._id.substring(order._id.length - 6).toUpperCase()}</div>
                                        <div className="ao-timestamp">{new Date(order.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td>
                                        <div className="ao-user-block">
                                            <span className="ao-username">{order.user?.name || 'Guest User'}</span>
                                            <span className="ao-userloc"><MapPin size={10}/> {order.shippingAddress.city}</span>
                                        </div>
                                    </td>
                                    <td className="font-bold" style={{ fontSize: '1.05rem', color: '#1e293b' }}>
                                        ₹{order.totalPrice.toLocaleString()}
                                    </td>
                                    <td>
                                        <div className="ao-pay-block">
                                            <span className={`method-badge ${order.isPaid ? 'paid' : 'unpaid'}`}>
                                                <CreditCard size={12}/> {order.paymentMethod === 'ONLINE' ? 'Gateway' : order.paymentMethod}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ao-status ${order.status.replace(/\s+/g, '-').toLowerCase()}`}>
                                            <div className="s-indicator"></div>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="ao-action-set">
                                            <button className="btn-icon btn-view-pro" onClick={() => viewOrder(order)} title="View Order">
                                                <Eye size={17}/>
                                            </button>
                                            <button className="btn-icon btn-update-pro" onClick={() => updateOrderStatus(order)} title="Update Status">
                                                <Truck size={17}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrders;
