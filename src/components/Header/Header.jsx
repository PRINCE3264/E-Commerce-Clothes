import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, ChevronDown, UserCircle, ShoppingCart, Heart, User, LogOut, Package, CreditCard } from 'lucide-react';
import API from '../../utils/api';
import './Header.css';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=c0392b&color=fff&size=80&bold=true&name=';

const Header = ({ toggleSidebar, cartCount, wishlistCount, userData, handleLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [searchPreview, setSearchPreview] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    /* Fetch dynamic categories for navigation */
    useEffect(() => {
        let isMounted = true;
        const fetchCats = async () => {
            try {
                const res = await API.get('/categories');
                if (res.data.success && isMounted) setCategories(res.data.data);
            } catch (err) {
                console.error('Error fetching navigation categories:', err);
            }
        };
        fetchCats();
        return () => { isMounted = false; };
    }, []);

    /* Close dropdown when clicking outside */
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const getAvatarSrc = () => {
        if (userData?.avatar) return userData.avatar;
        const nameForAvatar = userData?.name || 'User';
        return `${DEFAULT_AVATAR}${encodeURIComponent(nameForAvatar)}`;
    };

    return (
        <header className="main-header">
            {/* Promotion Bar */}
            <div className="promotion-bar">
                <div className="container">
                    Premium Boutique Collection | Global Shipping Available 🌐
                </div>
            </div>

            <div className="header-top">
                {/* Left: Brand */}
                <div className="header-brand-section">
                    <button className="menu-trigger" onClick={toggleSidebar} title="Global Menu">
                        <Menu size={24} />
                    </button>
                    <Link to="/" className="site-logo">
                        <span className="logo-main">Pandit</span>
                        <span className="logo-sub">Fashion</span>
                    </Link>
                </div>

                {/* Center: Navigation */}
                <nav className="main-nav">
                    <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
                    <Link to="/about" className={`nav-item ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
                    <div className="nav-item has-dropdown highlight">
                        <span>Products</span>
                        <ChevronDown size={14} />
                        <div className="nav-dropdown-menu">
                            {categories.length > 0 ? (
                                categories.map(cat => (
                                    <Link key={cat._id} to={`/products?category=${cat.name}`}>
                                        {cat.name}
                                    </Link>
                                ))
                            ) : (
                                <>
                                    <Link to="/products?category=Men's Wear">Men's Collection</Link>
                                    <Link to="/products?category=Women's Wear">Women's Collection</Link>
                                    <Link to="/products?category=Kids Wear">Kid's Collection</Link>
                                </>
                            )}
                            <div className="dropdown-divider"></div>
                            <Link to="/products" className="all-products-link">Explore All Products</Link>
                        </div>
                    </div>
                    <Link to="/blog" className="nav-item">Blog</Link>
                    <Link to="/contact" className="nav-item">Contact</Link>
                </nav>

                {/* Right: Controls */}
                <div className="header-controls">
                    <div className="search-bar-wrapper">
                        <form 
                            className="hdr-search-form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                const query = e.target.search.value;
                                if (query) {
                                    navigate(`/products?search=${encodeURIComponent(query)}`);
                                    setSearchPreview([]);
                                }
                            }}
                        >
                            <input 
                                name="search" 
                                type="text" 
                                placeholder="Search our catalog..." 
                                autoComplete="off"
                                onChange={async (e) => {
                                    const val = e.target.value;
                                    if (val.length > 2) {
                                        try {
                                            const res = await API.get(`/products?search=${val}`);
                                            if (res.data.success) setSearchPreview(res.data.data.slice(0, 5));
                                        } catch (err) { console.error(err); }
                                    } else {
                                        setSearchPreview([]);
                                    }
                                }}
                            />
                            <button className="search-btn" type="submit">
                                <Search size={18} />
                            </button>

                            {/* Search Preview Dropdown */}
                            {searchPreview.length > 0 && (
                                <div className="search-preview-dropdown">
                                    {searchPreview.map(p => (
                                        <div 
                                            key={p._id} 
                                            className="preview-item"
                                            onClick={() => {
                                                navigate(`/product/${p._id}`);
                                                setSearchPreview([]);
                                            }}
                                        >
                                            <img src={p.image} alt={p.name} />
                                            <div className="preview-details">
                                                <p className="preview-name">{p.name}</p>
                                                <p className="preview-price">₹{p.price.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="preview-footer" onClick={() => navigate('/products')}>
                                        View All Results
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    <div className="control-icons">
                        <Link to="/wishlist" className="control-icon-btn">
                            <Heart size={26} />
                            {wishlistCount > 0 && <span className="cart-badge wishlist-badge-color">{wishlistCount}</span>}
                        </Link>

                        <div className="cart-control-group">
                            <Link to="/cart" className="control-icon-btn">
                                <ShoppingCart size={28} />
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </Link>
                        </div>

                        {/* ── User Button: Avatar or Login ── */}
                        {userData ? (
                            <div className="hdr-user-wrap" ref={dropdownRef}>
                                <button
                                    className="hdr-user-btn"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    title={userData.name}
                                >
                                    <img
                                        src={getAvatarSrc()}
                                        alt={userData.name}
                                        className="hdr-user-avatar"
                                    />
                                    <div className="hdr-user-info">
                                        <span className="hdr-user-name">{(userData.name || 'User').split(' ')[0]}</span>
                                        <span className="hdr-user-email">{userData.email || 'No Email'}</span>
                                    </div>
                                    <ChevronDown size={14} className={`hdr-chevron ${dropdownOpen ? 'open' : ''}`} />
                                </button>

                                {dropdownOpen && (
                                    <div className="hdr-user-dropdown">
                                        <div className="hdr-dropdown-header">
                                            <img src={getAvatarSrc()} alt={userData.name} className="hdr-drop-avatar" />
                                            <div>
                                                <p className="hdr-drop-name">{userData.name || 'User'}</p>
                                                <p className="hdr-drop-email">{userData.email || ''}</p>
                                            </div>
                                        </div>
                                        <div className="hdr-dropdown-divider" />
                                        <Link to="/profile" className="hdr-drop-item" onClick={() => setDropdownOpen(false)}>
                                            <User size={16} /> My Account
                                        </Link>
                                        <Link to="/my-orders" className="hdr-drop-item" onClick={() => setDropdownOpen(false)}>
                                            <Package size={16} /> My Orders
                                        </Link>
                                        <Link to="/mypayments" className="hdr-drop-item" onClick={() => setDropdownOpen(false)}>
                                            <CreditCard size={16} /> My Payments
                                        </Link>
                                        <div className="hdr-dropdown-divider" />
                                        <button className="hdr-drop-item hdr-drop-logout" onClick={() => { handleLogout(); setDropdownOpen(false); }}>
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="auth-button-pill">
                                <UserCircle size={20} />
                                <span>Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
