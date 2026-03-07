import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, Star } from 'lucide-react';
import '../../pages/Products/Products.css';

/**
 * Shared ProductCard — uses exact same CSS classes as Products.jsx
 * so cards are pixel-perfect identical on all pages.
 */
const ProductCard = ({ product, wishlist = [], onToggleWishlist, onQuickView }) => {
    const navigate = useNavigate();
    const isWishlisted = wishlist.some(w => w._id === product._id);

    const handleWishlist = (e) => {
        e.stopPropagation();
        if (onToggleWishlist) onToggleWishlist(product);
    };

    const handleQuick = (e) => {
        e.stopPropagation();
        if (onQuickView) onQuickView(product);
    };

    return (
        <div className="product-card">
            <div
                className="product-image"
                style={{ backgroundImage: `url(${product.image})`, cursor: 'pointer' }}
                onClick={() => navigate(`/product/${product._id}`)}
            >
                <div className="product-actions">
                    <button className="action-btn" onClick={handleWishlist} title="Add to Wishlist">
                        <Heart
                            size={18}
                            fill={isWishlisted ? '#ef4444' : 'none'}
                            color={isWishlisted ? '#ef4444' : 'currentColor'}
                        />
                    </button>
                    <button className="action-btn" onClick={handleQuick} title="Quick View">
                        <Eye size={18} />
                    </button>
                </div>

                {/* High Priority Badge logic */}
                {product.stock <= 0 ? (
                    <span className="product-badge out-of-stock">Sold Out</span>
                ) : product.isBestSeller ? (
                    <span className="product-badge best-seller">BEST SELLER</span>
                ) : product.isNewArrival ? (
                    <span className="product-badge new-arrival">NEW ARRIVAL</span>
                ) : product.badge ? (
                    <span className={`product-badge ${product.badge.toLowerCase()}`}>{product.badge}</span>
                ) : null}
            </div>

            <div className="product-info">
                <span className="product-category-label">{product.category}</span>
                <h4 className="product-title">{product.name}</h4>
                <div className="product-price">
                    <span className="current-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
                    {product.oldPrice && (
                        <span className="old-price">₹{Number(product.oldPrice).toLocaleString('en-IN')}</span>
                    )}
                </div>
                <div className="product-rating">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={14}
                            fill={i < Math.floor(product.rating || 0) ? 'currentColor' : 'none'}
                            color={i < Math.floor(product.rating || 0) ? 'currentColor' : '#ccc'}
                        />
                    ))}
                    <span className="rating-count">({product.rating || 0})</span>
                </div>
                <button
                    className="add-to-cart-btn"
                    onClick={() => navigate(`/product/${product._id}`)}
                >
                    <Eye size={20} />
                    <span>VIEW DETAILS</span>
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
