import React, { useState } from 'react';
import {
    User,
    Package,
    Heart,
    Settings,
    MapPin,
    Bell,
    ShieldCheck,
    LogOut,
    Camera,
    ChevronRight,
    CreditCard,
    ShoppingBag
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const user = {
        name: "Prince Vidyarthi",
        email: "prince@example.com",
        phone: "+91 98765 43210",
        joinDate: "March 2024",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop",
        address: "123 Boutique Street, Mumbai, India"
    };

    const orders = [
        { id: "#PF-8821", date: "Feb 15, 2024", total: 120.00, status: "Delivered", items: 2 },
        { id: "#PF-8744", date: "Jan 28, 2024", total: 85.50, status: "Shipped", items: 1 },
        { id: "#PF-8612", date: "Jan 10, 2024", total: 210.00, status: "Delivered", items: 4 }
    ];

    return (
        <div className="profile-page">
            <div className="container">
                <div className="profile-layout">
                    {/* Left Sidebar */}
                    <aside className="profile-sidebar">
                        <div className="user-profile-card">
                            <div className="avatar-wrapper">
                                <img src={user.avatar} alt={user.name} />
                                <button className="edit-avatar"><Camera size={16} /></button>
                            </div>
                            <h2 className="user-display-name">{user.name}</h2>
                            <p className="user-membership">Premium Member</p>
                            <span className="join-badge">Member since {user.joinDate}</span>
                        </div>

                        <nav className="profile-nav">
                            <button
                                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                            >
                                <User size={20} /> Overview
                            </button>
                            <button
                                className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                                onClick={() => setActiveTab('orders')}
                            >
                                <Package size={20} /> My Orders
                            </button>
                            <button
                                className={`nav-link ${activeTab === 'wishlist' ? 'active' : ''}`}
                                onClick={() => setActiveTab('wishlist')}
                            >
                                <Heart size={20} /> Wishlist
                            </button>
                            <button
                                className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                                onClick={() => setActiveTab('settings')}
                            >
                                <Settings size={20} /> Account Settings
                            </button>
                            <div className="nav-divider"></div>
                            <button className="nav-link logout-btn">
                                <LogOut size={20} /> Sign Out
                            </button>
                        </nav>
                    </aside>

                    {/* Main Content Area */}
                    <main className="profile-main">
                        {activeTab === 'overview' && (
                            <div className="tab-fade-in">
                                <h1 className="tab-title">Account Overview</h1>

                                <div className="stats-cards-grid">
                                    <div className="p-stat-card blue">
                                        <div className="stat-icon"><ShoppingBag size={24} /></div>
                                        <div className="stat-info">
                                            <h3>12</h3>
                                            <p>Total Orders</p>
                                        </div>
                                    </div>
                                    <div className="p-stat-card cyan">
                                        <div className="stat-icon"><Heart size={24} /></div>
                                        <div className="stat-info">
                                            <h3>24</h3>
                                            <p>Saved Items</p>
                                        </div>
                                    </div>
                                    <div className="p-stat-card slate">
                                        <div className="stat-icon"><CreditCard size={24} /></div>
                                        <div className="stat-info">
                                            <h3>₹1,240</h3>
                                            <p>Spent Total</p>
                                        </div>
                                    </div>
                                </div>

                                <section className="overview-section mt-5">
                                    <div className="section-header">
                                        <h2>Recent Orders</h2>
                                        <button onClick={() => setActiveTab('orders')}>View All</button>
                                    </div>
                                    <div className="recent-orders-list">
                                        {orders.map(order => (
                                            <div key={order.id} className="quick-order-card">
                                                <div className="order-main">
                                                    <span className="order-id">{order.id}</span>
                                                    <span className="order-date">{order.date}</span>
                                                </div>
                                                <div className="order-details">
                                                    <span className="order-price">₹{order.total.toFixed(2)}</span>
                                                    <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
                                                </div>
                                                <ChevronRight size={18} className="arrow" />
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="overview-section mt-5">
                                    <div className="section-header">
                                        <h2>Security & Preferences</h2>
                                    </div>
                                    <div className="preferences-grid">
                                        <div className="pref-item">
                                            <div className="pref-icon"><Bell size={20} /></div>
                                            <div className="pref-content">
                                                <h4>Notifications</h4>
                                                <p>Manage how we reach you</p>
                                            </div>
                                            <div className="toggle-switch active"></div>
                                        </div>
                                        <div className="pref-item">
                                            <div className="pref-icon"><ShieldCheck size={20} /></div>
                                            <div className="pref-content">
                                                <h4>2FA Security</h4>
                                                <p>Extra layer of protection</p>
                                            </div>
                                            <div className="toggle-switch"></div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="tab-fade-in">
                                <h1 className="tab-title">Order History</h1>
                                <div className="orders-full-list">
                                    {orders.map(order => (
                                        <div key={order.id} className="order-full-card">
                                            <div className="of-header">
                                                <div>
                                                    <span className="of-id">Order {order.id}</span>
                                                    <span className="of-date">{order.date}</span>
                                                </div>
                                                <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                                            </div>
                                            <div className="of-body">
                                                <div className="of-info">
                                                    <p>{order.items} premium items included</p>
                                                    <span className="of-total">Total: ₹{order.total.toFixed(2)}</span>
                                                </div>
                                                <div className="of-actions">
                                                    <button className="btn-track">Track Package</button>
                                                    <button className="btn-details">Details</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="tab-fade-in">
                                <h1 className="tab-title">Account Settings</h1>
                                <form className="settings-form">
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <input type="text" defaultValue={user.name} />
                                        </div>
                                        <div className="form-group">
                                            <label>Email Address</label>
                                            <input type="email" defaultValue={user.email} />
                                        </div>
                                        <div className="form-group">
                                            <label>Phone Number</label>
                                            <input type="text" defaultValue={user.phone} />
                                        </div>
                                        <div className="form-group">
                                            <label>Default Address</label>
                                            <input type="text" defaultValue={user.address} />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn-save-settings">Save Changes</button>
                                </form>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Profile;
