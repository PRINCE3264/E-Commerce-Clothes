import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import API from '../../utils/api';
import QuickViewModal from '../../components/Modals/QuickViewModal';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Arrivals.css';
/* ProductCard imports Products.css for card styles */

const Arrivals = ({ onAddToCart, onToggleWishlist, wishlist = [] }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quickView, setQuickView] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await API.get('/products');
                if (res.data.success) {
                    const all = Array.isArray(res.data.data) ? res.data.data : res.data.data?.products || [];
                    
                    // Prioritize isNewArrival flag, then fall back to recent products
                    const explicitlyNew = all.filter(p => p.isNewArrival);
                    let sorted;
                    
                    if (explicitlyNew.length > 0) {
                        sorted = explicitlyNew;
                    } else {
                        sorted = [...all].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 24);
                    }
                    setProducts(sorted);
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    return (
        <div className="arrivals-page">
            {/* Hero */}
            <div className="arr-hero">
                <div className="arr-hero-content">
                    <div className="arr-badge"><Sparkles size={14} /> New Season</div>
                    <h1>New Arrivals</h1>
                    <p>Discover the freshest styles just landed in our collection. Be the first to wear what's new.</p>
                    <div className="arr-breadcrumb">
                        <Link to="/">Home</Link> <span>/</span> <span>New Arrivals</span>
                    </div>
                </div>
                <div className="arr-hero-deco">
                    <div className="arr-deco-ring ring-1"></div>
                    <div className="arr-deco-ring ring-2"></div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="arr-container">
                <div className="arr-section-top">
                    <h2>Latest Drops <span className="arr-count">{products.length} Items</span></h2>
                    <p>Handpicked new additions — updated regularly.</p>
                </div>

                {loading ? (
                    <div className="arr-loading">
                        <div className="arr-spinner"></div>
                        <p>Loading new arrivals...</p>
                    </div>
                ) : (
                    /* Reuse Products grid class for identical layout */
                    <div className="products-listing-grid">
                        {products.map(product => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                wishlist={wishlist}
                                onToggleWishlist={onToggleWishlist}
                                onQuickView={(p) => setQuickView(p)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {quickView && (
                <QuickViewModal
                    product={quickView}
                    onClose={() => setQuickView(null)}
                    onAddToCart={onAddToCart}
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={wishlist.some(w => w._id === quickView._id)}
                />
            )}
        </div>
    );
};

export default Arrivals;
