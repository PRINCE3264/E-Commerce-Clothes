import React from 'react';
import { Link } from 'react-router-dom';
import {
    X, User, Heart, ShoppingBag, CreditCard,
    CheckSquare, Truck, Star, Power, ChevronRight,
    Crown, Home, Info, LayoutList, BookOpen, Phone, LogIn, MessageSquare
} from 'lucide-react';
import './Sidebar.css';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=c0392b&color=fff&size=120&bold=true&name=';

const Sidebar = ({ isOpen, toggleSidebar, userData, handleLogout }) => {
    
    const handleSignOut = () => {
        handleLogout();
        toggleSidebar();
    };

    const getAvatarSrc = () => {
        if (userData?.avatar) return userData.avatar;
        const nameForAvatar = userData?.name || 'User';
        return `${DEFAULT_AVATAR}${encodeURIComponent(nameForAvatar)}`;
    };

    const latestOrderId = localStorage.getItem('pf_last_order_id') || '69ac07c5cbf16865b7e979a5';

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={toggleSidebar}></div>
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

                {/* ── User Profile Header ── */}
                <div className="sidebar-user-header">
                    <div className="user-info-wrapper">
                        {userData ? (
                            <>
                                <div className="user-avatar">
                                    <img src={getAvatarSrc()} alt={userData.name} />
                                </div>
                                <div className="user-details">
                                    <h3>{userData.name}</h3>
                                    <p>{userData.email}</p>
                                    <div className="premium-badge">
                                        <Crown size={12} fill="currentColor" />
                                        <span>PREMIUM MEMBER</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="sidebar-guest">
                                <div className="user-avatar guest-avatar">
                                    <User size={32} color="#94a3b8" />
                                </div>
                                <div className="user-details">
                                    <h3>Welcome!</h3>
                                    <p>Please login to access your profile</p>
                                    <Link to="/login" className="sidebar-login-btn" onClick={toggleSidebar}>
                                        <LogIn size={14} /> Sign In
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                    <button className="sidebar-close-btn" onClick={toggleSidebar}>
                        <X size={20} />
                    </button>
                </div>

                {/* ── Scrollable Content ── */}
                <div className="sidebar-scroll-content">

                    {/* Main Navigation (mobile) */}
                    <div className="sidebar-section mobile-only-nav">
                        <h4 className="section-label">MAIN NAVIGATION</h4>
                        <ul className="sidebar-links">
                            {[
                                { to: '/', icon: <Home size={20} />, label: 'Home' },
                                { to: '/about', icon: <Info size={20} />, label: 'About' },
                                { to: '/products', icon: <LayoutList size={20} />, label: 'Products' },
                                { to: '/blog', icon: <BookOpen size={20} />, label: 'Blog' },
                                { to: '/contact', icon: <Phone size={20} />, label: 'Contact' },
                            ].map(({ to, icon, label }) => (
                                <li key={to}>
                                    <Link to={to} className="sidebar-link" onClick={toggleSidebar}>
                                        <div className="link-icon-bg">{icon}</div>
                                        <span className="link-text">{label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Personal */}
                    <div className="sidebar-section">
                        <h4 className="section-label">PERSONAL SELECTION</h4>
                        <ul className="sidebar-links">
                            <li>
                                <Link to="/profile" className="sidebar-link" onClick={toggleSidebar}>
                                    <div className="link-icon-bg"><User size={20} /></div>
                                    <span className="link-text">My Profile</span>
                                    <ChevronRight size={16} className="chevron" />
                                </Link>
                            </li>
                            <li>
                                <Link to="/wishlist" className="sidebar-link" onClick={toggleSidebar}>
                                    <div className="link-icon-bg"><Heart size={20} /></div>
                                    <span className="link-text">My Wishlist</span>
                                    <span className="new-badge">NEW</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Shopping */}
                    <div className="sidebar-section">
                        <h4 className="section-label">SHOPPING ACTIVITY</h4>
                        <ul className="sidebar-links">
                            {[
                                { to: '/my-orders',       icon: <ShoppingBag size={20} />, label: 'My Orders' },
                                { to: `/payment?orderId=${latestOrderId}`, icon: <CreditCard size={20} />, label: 'Confirm Payment' },
                                { to: '/checkout',     icon: <CheckSquare size={20} />, label: 'Checkout' },
                                { to: '/mypayments',   icon: <CreditCard size={20} />,  label: 'Payments Details' },
                                { to: '/arrivals',     icon: <Truck size={20} />,       label: 'Arrivals' },
                                { to: '/best-products',icon: <Star size={20} />,        label: 'Best Products' },
                            ].map(({ to, icon, label }) => (
                                <li key={to}>
                                    <Link to={to} className="sidebar-link" onClick={toggleSidebar}>
                                        <div className="link-icon-bg">{icon}</div>
                                        <span className="link-text">{label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="sidebar-section">
                        <h4 className="section-label">SUPPORT & HELP</h4>
                        <ul className="sidebar-links">
                            <li>
                                <Link to="/support" className="sidebar-link" onClick={toggleSidebar}>
                                    <div className="link-icon-bg"><MessageSquare size={20} /></div>
                                    <span className="link-text">Live Support</span>
                                    <span className="live-status-dot"></span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* ── Footer: Sign Out ── */}
                <div className="sidebar-footer">
                    {userData ? (
                        <button className="sign-out-btn" onClick={handleSignOut}>
                            <Power size={18} />
                            <span>SIGN OUT</span>
                        </button>
                    ) : (
                        <Link to="/login" className="sign-out-btn sign-in-btn" onClick={toggleSidebar}>
                            <LogIn size={18} />
                            <span>SIGN IN</span>
                        </Link>
                    )}
                </div>

            </aside>
        </>
    );
};

export default Sidebar;
