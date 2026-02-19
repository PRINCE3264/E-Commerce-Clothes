import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowLeft, Star, X, CheckCircle, AlertCircle, Eye, Plus } from 'lucide-react';
import './Wishlist.css';
import './Wishlist_ProductCard.css';

const Wishlist = ({ wishlistItems = [], onRemoveFromWishlist, onAddToCart, onToggleWishlist }) => {
    const navigate = useNavigate();
    const [addedProduct, setAddedProduct] = useState(null);
    const [deletingProduct, setDeletingProduct] = useState(null);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [selectedSizes, setSelectedSizes] = useState({});

    const handleSizeSelect = (itemId, size) => {
        setSelectedSizes(prev => ({ ...prev, [itemId]: size }));
    };

    const handleMoveToCart = (item) => {
        if (onAddToCart) {
            onAddToCart(item);
            onRemoveFromWishlist(item); // This will now correctly trigger the global confirmation OR direct removal via App.jsx logic
        }
    };

    const confirmDelete = (item) => {
        if (onToggleWishlist) {
            onToggleWishlist(item);
        } else {
            onRemoveFromWishlist(item);
        }
    };

    return (
        <div className="wishlist-page">
            <div className="wishlist-hero">
                <div className="hero-pattern"></div>
                <div className="container">
                    <div className="breadcrumb-premium">
                        <Link to="/">Home</Link>
                        <span className="sep">/</span>
                        <span className="current">My Wishlist</span>
                    </div>
                    <div className="wish-hero-content">
                        <div className="title-area">
                            <h1 className="premium-glitch-text">Vault of Favorites</h1>
                            <div className="wish-stats">
                                <span className="stat-pill">{wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'} Saved</span>
                                <span className="stat-dot"></span>
                                <span className="stat-context">Exclusive Selection</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container main-content-wish">
                {wishlistItems.length > 0 ? (
                    <div className="wishlist-grid-premium">
                        {wishlistItems.map((item) => (
                            <div key={item.id} className="product-card">
                                <div className="product-image" style={{ backgroundImage: `url(${item.image})` }}>
                                    <div className="product-actions">
                                        <button
                                            className="action-btn delete-btn"
                                            title="Remove from Wishlist"
                                            onClick={() => confirmDelete(item)}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <button className="action-btn" title="Quick View" onClick={() => setQuickViewProduct(item)}>
                                            <Eye size={18} />
                                        </button>
                                    </div>
                                    {item.price > 100 && <span className="premium-tag">ESSENTIAL</span>}
                                </div>

                                <div className="product-info">
                                    <div className="product-meta-row">
                                        <span className="product-category-label">{item.category}</span>
                                        <div className="product-rating-compact">
                                            <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                            <span className="rating-value">{item.rating || 4.5}</span>
                                        </div>
                                    </div>

                                    <h4 className="product-title">{item.name}</h4>

                                    <div className="product-price">
                                        ₹{item.price.toFixed(2)}
                                    </div>

                                    {(item.size || item.sizes) && (
                                        <div className="product-sizes-selector" style={{ marginTop: '10px', marginBottom: '15px', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', marginRight: '8px' }}>Sizes:</span>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                {(item.size || item.sizes).map(size => (
                                                    <button
                                                        key={size}
                                                        onClick={(e) => { e.preventDefault(); handleSizeSelect(item.id, size); }}
                                                        style={{
                                                            padding: '4px 8px',
                                                            border: `1px solid ${selectedSizes[item.id] === size ? '#1e3a5f' : '#e2e8f0'}`,
                                                            borderRadius: '4px',
                                                            background: selectedSizes[item.id] === size ? '#1e3a5f' : 'white',
                                                            color: selectedSizes[item.id] === size ? 'white' : '#64748b',
                                                            cursor: 'pointer',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '600',
                                                            transition: 'all 0.2s ease',
                                                            minWidth: '32px'
                                                        }}
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        className="btn-add-to-cart"
                                        onClick={() => {
                                            const sizeToAdd = selectedSizes[item.id] || (item.size || item.sizes ? (item.size || item.sizes)[0] : null);
                                            handleMoveToCart({ ...item, size: sizeToAdd });
                                        }}
                                    >
                                        <Plus size={18} className="btn-plus-icon" />
                                        <ShoppingBag size={20} />
                                        <span>ADD TO CART</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-vault-state">
                        <div className="vault-circle">
                            <Heart size={60} strokeWidth={1.5} className="pulse-heart" />
                        </div>
                        <h2 className="empty-title-elite">Your vault is empty</h2>
                        <p className="empty-desc-elite">
                            Curate your personal collection of style.
                            Start exploring our latest arrivals to fill your vault.
                        </p>
                        <button className="btn-browse-elite" onClick={() => navigate('/products')}>
                            BROWSE COLLECTIONS
                        </button>
                    </div>
                )}
            </div>

            {/* Advance Level Quick View Modal */}
            {quickViewProduct && (
                <div className="quickview-advance-overlay" onClick={() => setQuickViewProduct(null)}>
                    <div className="quickview-advance-box animate-wow" onClick={e => e.stopPropagation()}>
                        <button className="qv-advance-close" onClick={() => setQuickViewProduct(null)}>
                            <X size={24} />
                        </button>

                        <div className="qv-advance-layout">
                            <div className="qv-advance-image-zone">
                                <img src={quickViewProduct.image} alt={quickViewProduct.name} />
                                <div className="image-accent-glow"></div>
                            </div>

                            <div className="qv-advance-info-zone">
                                <div className="qv-header-tags">
                                    <span className="qv-tag-premium">{quickViewProduct.category}</span>
                                    <div className="qv-rating-stars">
                                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                        <span>{quickViewProduct.rating || '4.8'}</span>
                                    </div>
                                </div>

                                <h2 className="qv-title-advance">{quickViewProduct.name}</h2>
                                <div className="qv-price-advance">₹{quickViewProduct.price.toFixed(2)}</div>

                                <div className="qv-description-premium">
                                    <p>Experience unparalleled quality with our curated selection. This piece represents the pinnacle of modern design and artisanal craftsmanship.</p>
                                </div>

                                <div className="qv-feature-list">
                                    <div className="qv-feature">
                                        <div className="feat-dot"></div>
                                        <span>Premium Fabric & Materials</span>
                                    </div>
                                    <div className="qv-feature">
                                        <div className="feat-dot"></div>
                                        <span>Precision Tailored Fit</span>
                                    </div>
                                </div>

                                <div className="qv-action-grid">
                                    <button
                                        className="btn-qv-cart"
                                        onClick={() => {
                                            handleMoveToCart(quickViewProduct);
                                            setQuickViewProduct(null);
                                        }}
                                    >
                                        <ShoppingBag size={20} />
                                        ADD TO BAG
                                    </button>
                                    <button
                                        className="btn-qv-details"
                                        onClick={() => navigate(`/product/${quickViewProduct.id}`)}
                                    >
                                        FULL DETAILS
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Wishlist;
