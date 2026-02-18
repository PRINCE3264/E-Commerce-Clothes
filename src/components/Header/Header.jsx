import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Menu, ChevronDown, UserCircle, ShoppingCart, Heart } from 'lucide-react';
import './Header.css';

const Header = ({ toggleSidebar, cartCount, wishlistCount }) => {
    const location = useLocation();

    return (
        <header className="main-header">
            {/* Promotion Bar (Blue Theme) */}
            <div className="promotion-bar">
                <div className="container">
                    Premium Boutique Collection | Global Shipping Available 🌐
                </div>
            </div>

            <div className="header-top">
                {/* Left: Brand Identity */}
                <div className="header-brand-section">
                    <button className="menu-trigger" onClick={toggleSidebar} title="Global Menu">
                        <Menu size={24} />
                    </button>
                    <Link to="/" className="site-logo">
                        <span className="logo-main">Pandit</span>
                        <span className="logo-sub">Fashion</span>
                    </Link>
                </div>

                {/* Center: Strategic Navigation */}
                <nav className="main-nav">
                    <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
                    <Link to="/about" className={`nav-item ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
                    <div className="nav-item has-dropdown highlight">
                        <span>Products</span>
                        <ChevronDown size={14} />
                        <div className="nav-dropdown-menu">
                            <Link to="/products?category=men">Men's Collection</Link>
                            <Link to="/products?category=women">Women's Collection</Link>
                            <Link to="/products?category=kids">Kid's Collection</Link>
                            <Link to="/products?category=Accessories">Accessories</Link>
                            <Link to="/products?category=Footwear">Footwear</Link>
                            <div className="dropdown-divider"></div>
                            <Link to="/products" className="all-products-link">Explore All Products</Link>
                        </div>
                    </div>
                    <Link to="/blog" className="nav-item"> Blog</Link>
                    <Link to="/contact" className="nav-item">Contact</Link>
                </nav>

                {/* Right: Premium Controls */}
                <div className="header-controls">
                    <div className="search-bar-wrapper">
                        <input type="text" placeholder="Search our catalog..." />
                        <button className="search-btn">
                            <Search size={20} />
                        </button>
                    </div>

                    <div className="control-icons">
                        <Link to="/wishlist" className="control-icon-btn">
                            <Heart size={26} />
                            {wishlistCount > 0 && <span className="cart-badge wishlist-badge-color">{wishlistCount}</span>}
                        </Link>
                        <Link to="/cart" className="control-icon-btn">
                            <ShoppingCart size={26} />
                            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                        </Link>
                        <Link to="/login" className="auth-button-pill">
                            <UserCircle size={20} />
                            <span>Login</span>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
