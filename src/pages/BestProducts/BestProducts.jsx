import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Star, Flame } from 'lucide-react';
import API from '../../utils/api';
import QuickViewModal from '../../components/Modals/QuickViewModal';
import ProductCard from '../../components/ProductCard/ProductCard';
import './BestProducts.css';
/* ProductCard imports Products.css for card styles */

const BestProducts = ({ onAddToCart, onToggleWishlist, wishlist = [] }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('best-sellers');
    const [quickView, setQuickView] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await API.get('/products');
                if (res.data.success) {
                    const all = Array.isArray(res.data.data) ? res.data.data : res.data.data?.products || [];
                    setProducts(all);
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const TABS = [
        { id: 'best-sellers',  label: 'Best Sellers',   icon: <Flame size={15}/> },
        { id: 'top-rated',     label: 'Top Rated',      icon: <Star size={15}/> },
        { id: 'most-reviewed', label: 'Most Reviewed',   icon: <Trophy size={15}/> },
    ];

    const getDisplayed = () => {
        const list = [...products];
        if (activeTab === 'best-sellers') {
            const best = list.filter(p => p.isBestSeller);
            return best.length > 0 ? best : list.sort((a, b) => (b.numSales || 0) - (a.numSales || 0)).slice(0, 24);
        }
        if (activeTab === 'top-rated')     return list.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 24);
        if (activeTab === 'most-reviewed') return list.sort((a, b) => (b.numReviews || 0) - (a.numReviews || 0)).slice(0, 24);
        return list;
    };

    const displayed = getDisplayed();

    return (
        <div className="best-page">
            {/* Hero */}
            <div className="best-hero">
                <div className="best-hero-inner">
                    <div className="best-hero-label"><Trophy size={14}/> Customer Favourites</div>
                    <h1>Best Products</h1>
                    <p>Our most loved, most rated, and most talked-about pieces — chosen by our community.</p>
                    <div className="best-breadcrumb">
                        <Link to="/">Home</Link> <span>/</span> <span>Best Products</span>
                    </div>
                </div>
                <div className="best-hero-accent"></div>
            </div>

            {/* Tabs */}
            <div className="best-tabs-bar">
                <div className="best-tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            className={`best-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="best-container">
                {loading ? (
                    <div className="best-loading">
                        <div className="best-spinner"></div>
                        <p>Loading top products...</p>
                    </div>
                ) : (
                    /* Reuse Products grid class for identical layout */
                    <div className="products-listing-grid">
                        {displayed.map(product => (
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

export default BestProducts;
