import React from 'react';
import { Link } from 'react-router-dom';
import {
    Trash2,
    Plus,
    Minus,
    ShoppingBag,
    ArrowRight,
    ShieldCheck,
    Truck,
    RefreshCcw
} from 'lucide-react';
import './Cart.css';

const Cart = ({ cartItems = [], onRemoveItem, onUpdateQuantity }) => {
    // Note: We use the cartItems prop passed from App.jsx for live data

    const subtotal = (cartItems || []).reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
    const shipping = 0.00; // Free shipping
    const total = subtotal + shipping;

    return (
        <div className="cart-page">
            {/* Header Section */}
            <div className="cart-header">
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">Home</Link> / <span>Your Shopping Bag</span>
                    </div>
                    <h1 className="cart-title">Shopping Bag <span className="item-count">({cartItems.length} items)</span></h1>
                </div>
            </div>

            <div className="container cart-layout-wrapper">
                {cartItems.length > 0 ? (
                    <div className="cart-grid">
                        {/* Left Side: Items List */}
                        <div className="cart-items-column">
                            <div className="cart-items-list">
                                {cartItems.map((item, index) => (
                                    <div key={item.cartId} className="cart-item-card" style={{ animationDelay: `${index * 0.1}s` }}>
                                        <div className="item-image-box">
                                            <img src={item.image} alt={item.name} />
                                        </div>
                                        <div className="item-details">
                                            <div className="item-main-info">
                                                <span className="item-cat">{item.category}</span>
                                                <h3 className="item-name">{item.name || item.title}</h3>
                                                <div className="item-meta">
                                                    <span>Size: <strong>{Array.isArray(item.size) ? item.size[0] : (item.size || 'M')}</strong></span>
                                                    <span>Color: <strong>{item.color || 'Default'}</strong></span>
                                                </div>
                                            </div>
                                            <div className="item-actions-row">
                                                <div className="quantity-ctrl">
                                                    <button onClick={() => onUpdateQuantity(item.cartId, -1)} disabled={item.quantity <= 1}><Minus size={16} /></button>
                                                    <span>{item.quantity || 1}</span>
                                                    <button onClick={() => onUpdateQuantity(item.cartId, 1)}><Plus size={16} /></button>
                                                </div>
                                                <div className="item-price-block">
                                                    <span className="unit-price">₹{item.price.toFixed(2)}</span>
                                                    <span className="total-price">₹{(item.price * (item.quantity || 1)).toFixed(2)}</span>
                                                </div>
                                                <button className="remove-btn" onClick={() => onRemoveItem(item.cartId)} title="Remove item">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Cart Features */}
                            <div className="cart-features-grid">
                                <div className="cart-feature">
                                    <div className="cf-icon"><Truck size={24} /></div>
                                    <div className="cf-text">
                                        <h5>Free Shipping</h5>
                                        <p>On all orders over ₹99</p>
                                    </div>
                                </div>
                                <div className="cart-feature">
                                    <div className="cf-icon"><RefreshCcw size={24} /></div>
                                    <div className="cf-text">
                                        <h5>30 Day Returns</h5>
                                        <p>Easy and hassle-free returns</p>
                                    </div>
                                </div>
                                <div className="cart-feature">
                                    <div className="cf-icon"><ShieldCheck size={24} /></div>
                                    <div className="cf-text">
                                        <h5>Secure Checkout</h5>
                                        <p>100% encrypted payment</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Order Summary */}
                        <aside className="cart-summary-column">
                            <div className="summary-card">
                                <h3 className="summary-title">Order Summary</h3>
                                <div className="summary-rows">
                                    <div className="summary-row">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Estimated Shipping</span>
                                        <span className="shipping-tag">FREE</span>
                                    </div>
                                    <div className="promo-code-box">
                                        <input type="text" placeholder="Promo Code" />
                                        <button>Apply</button>
                                    </div>
                                    <div className="summary-total-row">
                                        <span>Estimated Total</span>
                                        <span className="grand-total">₹{total.toFixed(2)}</span>
                                    </div>
                                </div>
                                <button className="checkout-btn">
                                    Proceed to Checkout <ArrowRight size={20} />
                                </button>
                                <div className="payment-icons">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" alt="Paypal" />
                                </div>
                            </div>
                            <div className="continue-shopping">
                                <Link to="/products">Continue Shopping</Link>
                            </div>
                        </aside>
                    </div>
                ) : (
                    <div className="empty-cart-state">
                        <div className="empty-icon-box">
                            <ShoppingBag size={80} />
                        </div>
                        <h2>Your bag is empty</h2>
                        <p>Looks like you haven't added anything to your bag yet. Explore our latest collections and find something you love!</p>
                        <Link to="/products" className="btn-shop-now">Start Shopping</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
