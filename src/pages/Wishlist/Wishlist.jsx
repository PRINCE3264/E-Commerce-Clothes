import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowLeft, Star, X, CheckCircle, AlertCircle, Eye, Plus } from 'lucide-react';
import './Wishlist.css';
import './Wishlist_ProductCard.css';
import ProductCard from '../../components/ProductCard/ProductCard';
import QuickViewModal from '../../components/Modals/QuickViewModal';
import '../Products/Products.css';

const Wishlist = ({ wishlistItems = [], onRemoveFromWishlist, onToggleWishlist, onAddToCart }) => {
    const navigate = useNavigate();
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    useEffect(() => {
        if (!localStorage.getItem('auth_token')) {
            navigate('/login?redirect=/wishlist');
        }
    }, [navigate]);

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
                    <div className="products-grid">
                        {wishlistItems.map((item) => (
                            <ProductCard 
                                key={item._id} 
                                product={item} 
                                wishlist={wishlistItems}
                                onRemove={() => confirmDelete(item)}
                                onQuickView={setQuickViewProduct}
                                isWishlistPage={true}
                            />
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

            {/* Standard Quick View Modal for UI Consistency */}
            {quickViewProduct && (
                <QuickViewModal 
                    product={quickViewProduct}
                    onClose={() => setQuickViewProduct(null)}
                    onAddToCart={onAddToCart}
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={true} // Since it's the wishlist page, we know it's wishlisted
                />
            )}
        </div>
    );
};

export default Wishlist;