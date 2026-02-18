import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
    Filter,
    ChevronDown,
    LayoutGrid,
    List,
    ShoppingBag,
    Heart,
    Eye,
    Star,
    X,
    ShoppingCart,
    Search
} from 'lucide-react';
import productsData from '../../data/products.json';
import './Products.css';
import '../Home/Home_CartModal.css';

const Products = ({ onAddToCart, onToggleWishlist, wishlist }) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const urlCategory = searchParams.get('category');

    const [activeCategory, setActiveCategory] = useState('All');
    const [priceRange, setPriceRange] = useState(300);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [cartProduct, setCartProduct] = useState(null);
    const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
    const [wishlistProduct, setWishlistProduct] = useState(null);
    const [selectedSizes, setSelectedSizes] = useState({}); // New: Store selected sizes for each product card

    const categories = ['All', 'Men\'s Wear', 'Women\'s Wear', 'Kids Wear', 'Accessories', 'Footwear'];

    useEffect(() => {
        if (urlCategory) {
            const mapped = {
                'men': 'Men\'s Wear',
                'women': 'Women\'s Wear',
                'kids': 'Kids Wear',
                'accessories': 'Accessories',
                'footwear': 'Footwear'
            };
            setActiveCategory(mapped[urlCategory.toLowerCase()] || 'All');
        } else {
            setActiveCategory('All');
        }
    }, [urlCategory]);

    const filteredProducts = productsData.filter(product => {
        const categoryMatch = activeCategory === 'All' || product.category === activeCategory;
        const priceMatch = product.price <= priceRange;
        const searchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase());
        return categoryMatch && priceMatch && searchMatch;
    });


    const handleAddToCart = (e, product) => {
        e.stopPropagation();
        setCartProduct(product);
        setIsCartModalOpen(true);
        if (onAddToCart) onAddToCart(product);
        setTimeout(() => setIsCartModalOpen(false), 3000);
    };

    const handleAddToWishlist = (e, product) => {
        e.stopPropagation();
        setWishlistProduct(product);
        setIsWishlistModalOpen(true);
        if (onToggleWishlist) onToggleWishlist(product);
        setTimeout(() => setIsWishlistModalOpen(false), 3000);
    };

    const handleSizeSelect = (productId, size) => {
        setSelectedSizes(prev => ({ ...prev, [productId]: size }));
    };

    return (
        <div className="products-page">
            {/* Products Hero/Breadcrumb */}
            <div className="products-page-header">
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">Home</Link> / <span>All Products</span>
                    </div>
                    <h1 className="page-title">Explore Our Collection</h1>

                    <div className="amazing-search-container">
                        <div className="luxury-search-box">
                            <Search className="search-icon-anim" size={20} />
                            <input
                                type="text"
                                placeholder="Search for your favorite styles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button className="clear-search" onClick={() => setSearchQuery('')}>
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <div className="search-hints">
                            Try: "Premium", "Silk", "Men's Wear"
                        </div>
                    </div>
                </div>
            </div>

            <div className="container product-layout-wrapper no-sidebar">

                <div className="products-main">


                    <div className="products-listing-grid">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <div key={product.id} className="product-card">
                                    <div className="product-image" style={{ backgroundImage: `url(${product.image})` }}>
                                        <div className="product-actions">
                                            <button className="action-btn" onClick={(e) => handleAddToWishlist(e, product)} title="Add to Wishlist">
                                                <Heart
                                                    size={18}
                                                    fill={wishlist.find(item => item.id === product.id) ? "#ef4444" : "none"}
                                                    color={wishlist.find(item => item.id === product.id) ? "#ef4444" : "currentColor"}
                                                />
                                            </button>
                                            <button className="action-btn" onClick={() => setSelectedProduct(product)} title="Quick View"><Eye size={18} /></button>
                                        </div>
                                        {product.id % 5 === 0 && <span className="product-badge sale">Sale</span>}
                                        {product.id % 7 === 0 && <span className="product-badge hot">Hot</span>}
                                    </div>
                                    <div className="product-info">
                                        <span className="product-category-label">{product.category}</span>
                                        <h4 className="product-title">{product.name}</h4>
                                        <div className="product-price">
                                            <span className="current-price">₹{product.price.toFixed(2)}</span>
                                            {product.id % 5 === 0 && <span className="old-price">₹{(product.price * 1.3).toFixed(2)}</span>}
                                        </div>
                                        <div className="product-rating">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={14}
                                                    fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                                                    color={i < Math.floor(product.rating) ? "currentColor" : "#ccc"}
                                                />
                                            ))}
                                            <span className="rating-count">({product.rating})</span>
                                        </div>
                                        <div className="product-sizes-selector" style={{ marginTop: '10px', marginBottom: '15px', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', marginRight: '8px' }}>Sizes:</span>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                {product.size.map(size => (
                                                    <button
                                                        key={size}
                                                        onClick={(e) => { e.preventDefault(); handleSizeSelect(product.id, size); }}
                                                        style={{
                                                            padding: '4px 8px',
                                                            border: `1px solid ${selectedSizes[product.id] === size ? '#1e3a5f' : '#e2e8f0'}`,
                                                            borderRadius: '4px',
                                                            background: selectedSizes[product.id] === size ? '#1e3a5f' : 'white',
                                                            color: selectedSizes[product.id] === size ? 'white' : '#64748b',
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
                                        <button
                                            className="add-to-cart-btn"
                                            onClick={(e) => {
                                                const sizeToAdd = selectedSizes[product.id] || (product.size ? product.size[0] : null);
                                                handleAddToCart(e, { ...product, size: sizeToAdd });
                                            }}
                                        >
                                            <ShoppingBag size={18} />
                                            <span>Add to Bag</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-results-state">
                                <Search size={60} />
                                <h3>No matching products found</h3>
                                <p>Try adjusting your search or filters to find what you're looking for.</p>
                                <button className="clear-filters-btn" onClick={() => {
                                    setSearchQuery('');
                                    setActiveCategory('All');
                                    setPriceRange(200);
                                }}>Clear All Filters</button>
                            </div>
                        )}
                    </div>


                </div>
            </div>

            {/* Quick View Modal */}
            {selectedProduct && (
                <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="modal-content product-detail-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedProduct(null)}><X /></button>
                        <div className="modal-grid">
                            <div className="modal-image">
                                <img src={selectedProduct.image} alt={selectedProduct.name} />
                            </div>
                            <div className="modal-info">
                                <span className="modal-category">{selectedProduct.category}</span>
                                <h2 className="modal-title">{selectedProduct.name}</h2>
                                <div className="modal-price">
                                    <span className="price-tag">₹{selectedProduct.price.toFixed(2)}</span>
                                    <span className="stock-status">In Stock</span>
                                </div>
                                <div className="modal-rating">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} fill={i < Math.floor(selectedProduct.rating) ? "#f59e0b" : "none"} color="#f59e0b" />
                                    ))}
                                    <span>({selectedProduct.rating} Rating)</span>
                                </div>
                                <p className="modal-desc">
                                    Experience premium quality with our {selectedProduct.name}. Crafted from high-grade materials,
                                    this piece offers both style and unparalleled comfort for everyday luxury.
                                </p>
                                <div className="modal-options">
                                    <div className="option-group">
                                        <label>Available Sizes</label>
                                        <div className="size-btns">
                                            {selectedProduct.size.map(s => <button key={s} className="size-btn">{s}</button>)}
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button className="modal-add-btn" onClick={(e) => handleAddToCart(e, selectedProduct)}>
                                        <ShoppingBag size={20} />
                                        Add to Shopping Bag
                                    </button>
                                    <button className="modal-wish-btn" onClick={(e) => handleAddToWishlist(e, selectedProduct)}>
                                        <Heart
                                            size={20}
                                            fill={wishlist.find(item => item.id === selectedProduct.id) ? "#ef4444" : "none"}
                                            color={wishlist.find(item => item.id === selectedProduct.id) ? "#ef4444" : "currentColor"}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Ultra-Premium Advanced Level Success Modal */}
            {isCartModalOpen && (
                <div className="luxury-popup-container-advance">
                    <div className="advance-success-modal animate-wow">
                        <div className="modal-glass-base"></div>
                        <button className="advance-close" onClick={() => setIsCartModalOpen(false)}>
                            <X size={20} />
                        </button>

                        <div className="advance-modal-body">
                            <div className="vibrant-success-zone">
                                <div className="success-lottie-emulation">
                                    <svg viewBox="0 0 52 52" className="checkmark-svg">
                                        <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                                        <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                                    </svg>
                                </div>
                                <h2 className="glam-title">Excellent Choice!</h2>
                                <p className="glam-subtitle">Your selection has been moved to your shopping bag.</p>
                            </div>

                            {cartProduct && (
                                <div className="added-item-display">
                                    <div className="item-glow-back"></div>
                                    <div className="item-image-premium">
                                        <img src={cartProduct.image} alt={cartProduct.name} />
                                    </div>
                                    <div className="item-brief-info">
                                        <span className="ib-category">{cartProduct.category}</span>
                                        <h4 className="ib-name">{cartProduct.name}</h4>
                                        <p className="ib-price">₹{cartProduct.price.toFixed(2)}</p>
                                    </div>
                                </div>
                            )}

                            <div className="advance-actions">
                                <button className="btn-checkout-luxury" onClick={() => navigate('/cart')}>
                                    CHECKOUT NOW
                                </button>
                                <button className="btn-continue-styling" onClick={() => setIsCartModalOpen(false)}>
                                    CONTINUE SHOPPING
                                </button>
                            </div>
                        </div>
                        <div className="cart-progress-bar"></div>
                    </div>
                </div>
            )}

            {/* Premium Red Wishlist Modal */}
            {isWishlistModalOpen && (
                <div className="wishlist-popup-overlay" onClick={() => setIsWishlistModalOpen(false)}>
                    <div className="wishlist-red-modal animate-scale-in" onClick={e => e.stopPropagation()}>
                        <button className="wish-close-btn" onClick={() => setIsWishlistModalOpen(false)}>
                            <X size={20} />
                        </button>

                        <div className="wish-red-icon-area">
                            <div className="pulse-red-circle">
                                <Heart size={42} fill="#ef4444" color="#ef4444" />
                            </div>
                            <div className="mini-star-badge">
                                <Star size={10} fill="white" color="white" />
                            </div>
                        </div>

                        <h2 className="wish-red-title">Saved to Wishlist!</h2>

                        <p className="wish-red-desc">
                            <strong className="wish-product-name">{wishlistProduct?.name}</strong> has been added to your favorites. You can access it anytime from your profile.
                        </p>

                        <div className="wish-red-actions">
                            <button className="btn-view-wishlist-red" onClick={() => navigate('/wishlist')}>
                                View My Wishlist
                            </button>
                            <button className="btn-continue-browsing-red" onClick={() => setIsWishlistModalOpen(false)}>
                                Continue Browsing
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
