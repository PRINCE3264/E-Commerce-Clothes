import React from 'react';
import { Link } from 'react-router-dom';
import {
    X,
    User,
    Heart,
    ShoppingBag,
    CreditCard,
    CheckSquare,
    Truck,
    Star,
    Power,
    ChevronRight,
    Crown
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar, wishlistItems = [], onToggleWishlist }) => {
    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={toggleSidebar}></div>
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* User Profile Header */}
                <div className="sidebar-user-header">
                    <div className="user-info-wrapper">
                        <div className="user-avatar">
                            <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop" alt="User" />
                        </div>
                        <div className="user-details">
                            <h3>Prince</h3>
                            <p>admin45@.com</p>
                            <div className="premium-badge">
                                <Crown size={12} fill="currentColor" />
                                <span>PREMIUM MEMBER</span>
                            </div>
                        </div>
                    </div>
                    <button className="sidebar-close-btn" onClick={toggleSidebar}>

                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="sidebar-scroll-content">
                    <div className="sidebar-section">
                        <h4 className="section-label">PERSONAL SELECTION</h4>
                        <ul className="sidebar-links">
                            <li>
                                <Link to="/profile" className="sidebar-link" onClick={toggleSidebar}>
                                    <div className="link-icon-bg">
                                        <User size={20} />
                                    </div>
                                    <span className="link-text">My Profile</span>
                                    <ChevronRight size={16} className="chevron" />
                                </Link>
                            </li>
                            <li>
                                <Link to="/wishlist" className="sidebar-link" onClick={toggleSidebar}>
                                    <div className="link-icon-bg">
                                        <Heart size={20} />
                                    </div>
                                    <span className="link-text">My Wishlist</span>
                                    <span className="new-badge">NEW</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="sidebar-section">
                        <h4 className="section-label">SHOPPING ACTIVITY</h4>
                        <ul className="sidebar-links">
                            <li>
                                <Link to="/orders" className="sidebar-link" onClick={toggleSidebar}>
                                    <div className="link-icon-bg">
                                        <ShoppingBag size={20} />
                                    </div>
                                    <span className="link-text">My Orders</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/checkout" className="sidebar-link" onClick={toggleSidebar}>
                                    <div className="link-icon-bg">
                                        <CheckSquare size={20} />
                                    </div>
                                    <span className="link-text">Checkout</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/payment" className="sidebar-link" onClick={toggleSidebar}>
                                    <div className="link-icon-bg">
                                        <CreditCard size={20} />
                                    </div>
                                    <span className="link-text">Payment Details</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/arrivals" className="sidebar-link" onClick={toggleSidebar}>
                                    <div className="link-icon-bg">
                                        <Truck size={20} />
                                    </div>
                                    <span className="link-text">Arrivals</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/best-products" className="sidebar-link" onClick={toggleSidebar}>
                                    <div className="link-icon-bg">
                                        <Star size={20} />
                                    </div>
                                    <span className="link-text">Best Products</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Sidebar Footer */}
                <div className="sidebar-footer">
                    <button className="sign-out-btn">
                        <Power size={18} />
                        <span>SIGN OUT</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
