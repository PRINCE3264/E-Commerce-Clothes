import React, { useState } from 'react';
import { X, Star, ShoppingBag, Heart, Plus, Minus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './QuickViewModal.css';

const QuickViewModal = ({ product, onClose, onAddToCart, onToggleWishlist, isWishlisted }) => {
    const navigate = useNavigate();
    const [selectedSize, setSelectedSize] = useState(product.size?.[0] || 'M');
    const [selectedColor, setSelectedColor] = useState(product.color?.[0] || 'Black');

    if (!product) return null;

    return (
        <div className="qv-overlay" onClick={onClose}>
            <div className="qv-modal animate-scale-in" onClick={e => e.stopPropagation()}>
                <button className="qv-close-btn" onClick={onClose}><X size={24} /></button>
                
                <div className="qv-content-layout">
                    {/* Left: Interactive Image Area */}
                    <div className="qv-image-side">
                        <div className="qv-main-img" style={{ backgroundImage: `url(${product.image})` }}>
                            <div className="qv-img-badge">{product.category}</div>
                        </div>
                    </div>

                    {/* Right: Premium Details */}
                    <div className="qv-details-side">
                        <header className="qv-header">
                            <h2 className="qv-title">{product.name}</h2>
                            <div className="qv-rating-row">
                                <div className="stars">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            size={16} 
                                            fill={i < Math.floor(product.rating || 4.5) ? "#f59e0b" : "none"} 
                                            color={i < Math.floor(product.rating || 4.5) ? "#f59e0b" : "#e2e8f0"} 
                                        />
                                    ))}
                                </div>
                                <span className="rating-text">({product.rating || 4.5} Rating)</span>
                            </div>
                        </header>

                        <div className="qv-price-block">
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px' }}>
                                <span className="qv-current-price">₹{product.price.toLocaleString()}</span>
                                {product.oldPrice && <span className="qv-old-price">₹{product.oldPrice.toLocaleString()}</span>}
                            </div>
                            <div className={`qv-stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </div>
                        </div>

                        <p className="qv-description-short">
                            {product.description || "A premium fashion asset curated for your lifestyle. Experience the peak of comfort and style."}
                        </p>

                        <div className="qv-selectors">
                            <div className="selector-item">
                                <label>Available Sizes</label>
                                <div className="qv-size-grid">
                                    {(product.size || ['S', 'M', 'L', 'XL']).map(s => (
                                        <button 
                                            key={s} 
                                            className={`qv-size-chip ${selectedSize === s ? 'active' : ''}`}
                                            onClick={() => setSelectedSize(s)}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="selector-item">
                                <label>Available Colors</label>
                                <div className="qv-color-dots">
                                    {(product.color || ['Black', 'Navy', 'Olive']).map(c => (
                                        <button 
                                            key={c}
                                            className={`qv-color-dot ${selectedColor === c ? 'active' : ''}`}
                                            style={{ backgroundColor: c.toLowerCase() === 'white' ? '#f8fafc' : c.toLowerCase() }}
                                            onClick={() => setSelectedColor(c)}
                                            title={c}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="qv-actions">
                            <button 
                                className="qv-btn-cart"
                                onClick={() => {
                                    onAddToCart({ ...product, size: selectedSize, color: selectedColor, quantity: 1 });
                                    onClose();
                                }}
                                disabled={product.stock <= 0}
                                style={product.stock <= 0 ? { opacity: 0.6, cursor: 'not-allowed', background: '#64748b' } : {}}
                            >
                                <ShoppingBag size={20} />
                                {product.stock > 0 ? 'ADD TO BAG' : 'OUT OF STOCK'}
                            </button>
                            <button 
                                className={`qv-btn-wish ${isWishlisted ? 'active' : ''}`}
                                onClick={() => onToggleWishlist(product)}
                            >
                                <Heart size={22} fill={isWishlisted ? "currentColor" : "none"} />
                            </button>
                        </div>

                        <button 
                            className="qv-full-page-link"
                            onClick={() => {
                                onClose();
                                navigate(`/product/${product._id}`);
                            }}
                        >
                            View Full Product Specifications <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickViewModal;
