import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
    Filter,
    ChevronDown,
    LayoutGrid,
    List,
    Heart,
    Eye,
    Star,
    ArrowRight,
    Search,
    X,
    ShoppingCart,
    Plus,
    RefreshCcw
} from 'lucide-react';
import QuickViewModal from '../../components/Modals/QuickViewModal';
import API from '../../utils/api';
import './Products.css';
import '../Home/Home_CartModal.css';

const Products = ({ onAddToCart, onToggleWishlist, wishlist }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlCategory = searchParams.get('category');
    const urlSearch = searchParams.get('search');

    const [activeCategory, setActiveCategory] = useState('All');
    const [priceRange, setPriceRange] = useState(10000); // Default to high value to show all
    const [searchQuery, setSearchQuery] = useState('');
    const [searchPreview, setSearchPreview] = useState([]);

    useEffect(() => {
        if (urlSearch) {
            setSearchQuery(urlSearch);
        }
    }, [urlSearch]);
    const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
    const [wishlistProduct, setWishlistProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quickView, setQuickView] = useState(null);

    useEffect(() => {
        if (urlCategory) {
            const lowCaseUrl = urlCategory.toLowerCase();
            const mapped = {
                'men': 'Men\'s Wear',
                'women': 'Women\'s Wear',
                'kids': 'Kids Wear',
                'accessories': 'Accessories',
                'footwear': 'Footwear',
                'shoes': 'Footwear'
            };

            // 1. Check if it's a short handle from the map
            // 2. OR use the urlCategory directly (useful if Header sends "Men's Wear")
            const resolved = mapped[lowCaseUrl] || urlCategory;
            
            // Try to find a casing match in our current products list if possible
            // but for now setting it directly is better than 'All'
            setActiveCategory(resolved);
        } else {
            setActiveCategory('All');
        }
    }, [urlCategory, products]);

    // Fetch Products from DB
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await API.get('/products');
                if (res.data.success) {
                    setProducts(res.data.data);
                }
            } catch (err) {
                console.error("Products: Error fetching data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(product => {
        const categoryMatch = activeCategory === 'All' || 
            (product.category && product.category.toLowerCase() === activeCategory.toLowerCase());
        const priceMatch = product.price <= priceRange;
        // Check both p.name (mongo) and p.title (legacy)
        const nameToSearch = product.name || '';
        const searchMatch = nameToSearch.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase());
        return categoryMatch && priceMatch && searchMatch;
    });


    const handleAddToWishlist = (e, product) => {
        e.stopPropagation();
        setWishlistProduct(product);
        setIsWishlistModalOpen(true);
        if (onToggleWishlist) onToggleWishlist(product);
        setTimeout(() => setIsWishlistModalOpen(false), 3000);
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
                            <input
                                type="text"
                                placeholder="Search for your favorite styles..."
                                value={searchQuery}
                                autoComplete="off"
                                onChange={async (e) => {
                                    const val = e.target.value;
                                    setSearchQuery(val);
                                    if (val.length > 2) {
                                        try {
                                            const res = await API.get(`/products?search=${val}`);
                                            if (res.data.success) {
                                                setSearchPreview(res.data.data.slice(0, 5));
                                                // If we had a direct search preview state here
                                            }
                                        } catch (err) { console.error(err); }
                                    } else {
                                        setSearchPreview([]);
                                    }
                                }}
                            />
                            {searchQuery && (
                                <button className="clear-search" onClick={() => { setSearchQuery(''); setSearchPreview([]); }}>
                                    <X size={16} />
                                </button>
                            )}
                            <button className="luxury-search-btn">
                                <Search size={20} />
                            </button>

                            {/* Reuse Search Preview Dropdown on Products Page */}
                            {searchPreview.length > 0 && (
                                <div className="search-preview-dropdown pdp-search-preview">
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
                                </div>
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
                        {loading ? (
                            <div className="loading-state">
                                <Plus className="animate-spin" size={40} />
                                <p>Syncing with Fashion Core...</p>
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <div key={product._id} className="product-card">
                                    <div 
                                        className="product-image" 
                                        style={{ backgroundImage: `url(${product.image})`, cursor: 'pointer' }}
                                        onClick={() => navigate(`/product/${product._id}`)}
                                    >
                                        <div className="product-actions">
                                            <button className="action-btn" onClick={(e) => handleAddToWishlist(e, product)} title="Add to Wishlist">
                                                <Heart
                                                    size={18}
                                                    fill={wishlist.find(item => item._id === product._id) ? "#ef4444" : "none"}
                                                    color={wishlist.find(item => item._id === product._id) ? "#ef4444" : "currentColor"}
                                                />
                                            </button>
                                            <button className="action-btn" onClick={(e) => { e.stopPropagation(); setQuickView(product); }} title="Quick View"><Eye size={18} /></button>
                                        </div>
                                        {product.stock <= 0 ? (
                                            <span className={`product-badge out-of-stock`}>Sold Out</span>
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
                                            {product.oldPrice && <span className="old-price">₹{Number(product.oldPrice).toLocaleString('en-IN')}</span>}
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

                                        <button
                                            className="add-to-cart-btn"
                                            onClick={() => navigate(`/product/${product._id}`)}
                                        >
                                            <Eye size={20} />
                                            <span>VIEW DETAILS</span>
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
                                    setPriceRange(10000);
                                }}>Clear All Filters</button>
                            </div>
                        )}
                    </div>
                    
                    {quickView && (
                        <QuickViewModal 
                            product={quickView}
                            onClose={() => setQuickView(null)}
                            onAddToCart={onAddToCart}
                            onToggleWishlist={onToggleWishlist}
                            isWishlisted={wishlist.some(item => item._id === quickView._id)}
                        />
                    )}
                </div>
            </div>

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

