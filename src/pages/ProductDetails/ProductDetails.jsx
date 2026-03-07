import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Star, ShieldCheck, Truck, RefreshCcw, ArrowLeft, Plus, Minus, Share2 } from 'lucide-react';
import API from '../../utils/api';
import './ProductDetails.css';

const ProductDetails = ({ onAddToCart, onToggleWishlist, wishlist }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState('');
    const [selectionError, setSelectionError] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState('');

    const loggedInUser = (() => {
        try { return JSON.parse(localStorage.getItem('user')) || null; }
        catch { return null; }
    })();

    const getColorName = (val) => {
        if (!val) return '';
        const lowerVal = val.toLowerCase().trim();
        const colorMap = {
            '#2d6acd': 'Ocean Blue',
            '#ff0000': 'Red',
            '#0000ff': 'Blue',
            '#00ff00': 'Green',
            '#000000': 'Black',
            '#ffffff': 'White',
            '#f59e0b': 'Amber',
            '#ef4444': 'Crimson Red',
            '#3b82f6': 'Royal Blue',
            '#10b981': 'Emerald Green',
            '#6366f1': 'Indigo',
            '#a855f7': 'Purple',
            '#ec4899': 'Pink',
            '#f43f5e': 'Rose',
            '#f97316': 'Orange',
            '#71717a': 'Zinc Grey',
            '#000': 'Black',
            '#fff': 'White'
        };
        return colorMap[lowerVal] || val;
    };

    const isHex = (val) => /^#[0-9A-F]{3,6}$/i.test(val);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch targeted single product
                const resProd = await API.get(`/products/${id}`);
                let foundProduct = null;
                if (resProd.data.success) {
                    foundProduct = resProd.data.data;
                    if (isMounted) {
                        setProduct(foundProduct);
                        setMainImage(foundProduct.image);
                    }
                }
                
                // Fetch dynamic variants
                const resVars = await API.get('/variants');
                if (resVars.data.success && foundProduct && isMounted) {
                    const prodVariants = resVars.data.data.filter(v => v.productId === id && v.status !== 'Out of Stock');
                    setVariants(prodVariants);
                    if (prodVariants.length > 0) {
                        handleVariantSelect(prodVariants[0]);
                    }
                }
            } catch (err) {
                console.error("Error fetching product details", err);
            } finally {
                if(isMounted) setLoading(false);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, [id]);

    const handleVariantSelect = (v) => {
        setSelectedVariant(v);
        // Reset manual selections when variant is picked if they are mutually exclusive in logic
        setSelectedSize('');
        setSelectedColor('');
        setSelectionError('');
        if (v.image) setMainImage(v.image);
    };

    const handleAddToCart = () => {
        setSelectionError('');
        
        // Validation logic
        if (variants.length > 0 && !selectedVariant) {
            setSelectionError('Please select a specific variant configuration.');
            return;
        }

        if (variants.length === 0) {
            if (product.size?.length > 0 && !selectedSize) {
                setSelectionError('Please choose your preferred size.');
                return;
            }
            if (product.color?.length > 0 && !selectedColor) {
                setSelectionError('Please choose your preferred color.');
                return;
            }
        }

        // Execution
        onAddToCart({ 
            ...product, 
            price: displayPrice,
            selectedVariant: selectedVariant ? selectedVariant : null,
            size: selectedVariant ? undefined : (selectedSize || undefined),
            color: selectedVariant ? undefined : (selectedColor || undefined),
            quantity 
        });
    };

    const submitReview = async (e) => {
        e.preventDefault();
        setReviewError('');
        
        if (!localStorage.getItem('auth_token')) {
            setReviewError('Please login to write a review');
            return;
        }

        if (!reviewComment.trim()) {
            setReviewError('Please add a comment');
            return;
        }

        setSubmittingReview(true);
        try {
            const res = await API.post(`/products/${id}/reviews`, {
                rating: reviewRating,
                comment: reviewComment
            });

            if (res.data.success) {
                setReviewComment('');
                setReviewRating(5);
                // Refresh product data to see new review
                const updatedProd = await API.get(`/products/${id}`);
                if (updatedProd.data.success) setProduct(updatedProd.data.data);
                
                // Alert success
                alert('Thank you for your review!');
            }
        } catch (err) {
            setReviewError(err.response?.data?.message || 'Error submitting review');
        } finally {
            setSubmittingReview(false);
        }
    };

    // Calculate dynamic price based on variant priceMod
    const displayPrice = product ? (product.price + (selectedVariant?.priceMod || 0)) : 0;
    const isOutOfStock = selectedVariant ? selectedVariant.stock <= 0 : (product ? product.stock <= 0 : true);

    const isWishlisted = product ? wishlist.some(item => item._id === product._id) : false;

    if (loading) {
        return (
            <div className="pd-loading-container">
                <div className="pd-loader-glam"></div>
                <p>Curating details for you...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="pd-error-container">
                <ArrowLeft onClick={() => navigate(-1)} className="back-to-shop" />
                <h2>Oops! Design Not Found</h2>
                <p>The collection you are looking for has moved or no longer exists.</p>
                <button onClick={() => navigate('/products')}>BROWSE COLLECTIONS</button>
            </div>
        );
    }

    return (
        <div className="pd-page">
            <div className="container">
                <div className="breadcrumb-elite">
                    <span onClick={() => navigate('/')}>Home</span>
                    <span className="sep">/</span>
                    <span onClick={() => navigate('/products')}>Collections</span>
                    <span className="sep">/</span>
                    <span className="current">{product.name}</span>
                </div>

                <div className="pd-layout">
                    {/* Left: Image Gallery */}
                    <div className="pd-gallery-section">
                        <div className="pd-main-img-box">
                            <img src={mainImage} alt={product.name} className="animate-zoom-in" />
                            <div className="gallery-accents">
                                <div className="accent-glow"></div>
                            </div>
                        </div>
                        {/* Custom thumbnails if we had multiple images, currently showing the one we have */}
                        <div className="pd-thumbs-row">
                            <div className="thumb active" onClick={() => setMainImage(product.image)}>
                                <img src={product.image} alt="Thumbnail" />
                            </div>
                        </div>
                    </div>

                    {/* Right: Info Section */}
                    <div className="pd-info-section">
                        <div className="pd-header">
                            <div className="pd-badges-row" style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                {product.isBestSeller && <span className="p-badge seller">BEST SELLER</span>}
                                {product.isNewArrival && <span className="p-badge arrival">NEW ARRIVAL</span>}
                            </div>
                            <span className="pd-category-tag">{product.category}</span>
                            <h1 className="pd-name-vibrant">{product.name}</h1>
                            <div className="pd-rating-row">
                                <div className="stars">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} fill={i < Math.floor(product.rating || 0) ? "#f59e0b" : "none"} color={i < Math.floor(product.rating || 0) ? "#f59e0b" : "#e2e8f0"} />
                                    ))}
                                </div>
                                <span className="rating-val">{(product.rating || 0).toFixed(1)}</span>
                                <span className="sep">|</span>
                                <span className="review-count">{product.numReviews || 0} Verified Reviews</span>
                            </div>
                        </div>

                        <div className="pd-price-row">
                            <div className="price-group">
                                <span className="pd-current-price">₹{displayPrice.toLocaleString()}</span>
                                {product.oldPrice && <span className="pd-old-price">₹{product.oldPrice.toLocaleString()}</span>}
                                <span className="pd-tax-note">Incl. all taxes</span>
                            </div>
                            <div className={`stock-badge ${!isOutOfStock ? 'in-stock' : 'out-of-stock'}`}>
                                {!isOutOfStock ? 'In Stock' : 'Out of Stock'}
                            </div>
                        </div>

                        <div className="pd-description">
                            <p>{product.description}</p>
                        </div>

                        <div className="pd-selectors">
                            {/* Dynamic Variants Representation */}
                            {variants.length > 0 && (
                                <div className="selector-group">
                                    <div className="label-row">
                                        <label>Select Variant: <span style={{fontWeight: '700', color: '#10b981'}}>{getColorName(selectedVariant?.value)}</span></label>
                                    </div>
                                    <div className="size-grid">
                                        {variants.map(v => (
                                            <button
                                                key={v._id}
                                                className={`size-btn variant-btn-flex ${selectedVariant?._id === v._id ? 'active' : ''}`}
                                                onClick={() => handleVariantSelect(v)}
                                            >
                                                {isHex(v.value) && (
                                                    <span className="var-color-dot" style={{ background: v.value }}></span>
                                                )}
                                                <span className="var-btn-text">{getColorName(v.value)}</span>
                                                {v.priceMod > 0 && <span className="var-price-tag">+₹{v.priceMod}</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Fallback to generic sizes if NO variants found from database */}
                            {variants.length === 0 && product.size && product.size.length > 0 && (
                                <div className="selector-group">
                                    <div className="label-row">
                                        <label>Select Size: <span style={{color: '#3b82f6'}}>{selectedSize}</span></label>
                                    </div>
                                    <div className="size-grid">
                                        {product.size.map(s => (
                                            <button 
                                                key={s} 
                                                className={`size-btn ${selectedSize === s ? 'active' : ''}`}
                                                onClick={() => { setSelectedSize(s); setSelectionError(''); }}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Color Selection if available in base product */}
                            {variants.length === 0 && product.color && product.color.length > 0 && (
                                <div className="selector-group">
                                    <div className="label-row">
                                        <label>Select Color: <span style={{color: '#3b82f6'}}>{getColorName(selectedColor)}</span></label>
                                    </div>
                                    <div className="color-dots">
                                        {product.color.map(c => (
                                            <button 
                                                key={c}
                                                className={`color-dot-btn ${selectedColor === c ? 'active' : ''}`}
                                                style={{ backgroundColor: c.toLowerCase() }}
                                                onClick={() => { setSelectedColor(c); setSelectionError(''); }}
                                                title={c}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Error Display */}
                            {selectionError && (
                                <div className="pd-selection-error animate-wow">
                                    <p>{selectionError}</p>
                                </div>
                            )}

                            {/* Quantity */}
                            <div className="selector-group">
                                <label>Quantity</label>
                                <div className="quantity-box-elite">
                                    <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))}><Minus size={18}/></button>
                                    <span>{quantity}</span>
                                    <button onClick={() => setQuantity(prev => prev + 1)}><Plus size={18}/></button>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pd-actions">
                            <button
                                className="pd-btn-primary"
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                style={isOutOfStock ? { opacity: 0.6, cursor: 'not-allowed', background: '#64748b' } : {}}
                            >
                                <ShoppingBag size={20} />
                                {!isOutOfStock ? 'ADD TO SHOPPING BAG' : 'OUT OF STOCK'}
                            </button>
                            <button
                                className={`pd-btn-wish ${isWishlisted ? 'active' : ''}`}
                                onClick={() => onToggleWishlist(product)}
                                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                            >
                                <Heart size={24} fill={isWishlisted ? "currentColor" : "none"} />
                            </button>
                            <button className="pd-btn-share"><Share2 size={20}/></button>
                        </div>

                        {/* Trust Badges */}
                        <div className="pd-trust-row">
                            <div className="trust-item">
                                <Truck size={20} />
                                <span>Free Shipping Over ₹2,999</span>
                            </div>
                            <div className="trust-item">
                                <RefreshCcw size={20} />
                                <span>30-Day Effortless Returns</span>
                            </div>
                            <div className="trust-item">
                                <ShieldCheck size={20} />
                                <span>Genuine Fashion Core Asset</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="pd-reviews-section animate-slide-up">
                    <div className="section-header-elite">
                        <h2>Member Reviews <span className="rev-badge">{product.numReviews || 0}</span></h2>
                        <div className="sec-divider"></div>
                    </div>

                    <div className="reviews-grid-elite">
                        {/* Write Column */}
                        <div className="rev-write-col">
                            <div className="rev-glass-card">
                                <h3>Write a Review</h3>
                                <p>How was your experience with this piece?</p>
                                
                                {localStorage.getItem('auth_token') ? (
                                    <div className="rev-active-user-badge">
                                        <div className="tiny-avatar">{loggedInUser?.name?.[0]?.toUpperCase()}</div>
                                        <span>Reviewing as <strong>{loggedInUser?.name}</strong></span>
                                    </div>
                                ) : null}
                                
                                {localStorage.getItem('auth_token') ? (
                                    <form onSubmit={submitReview} className="rev-form-elite">
                                        <div className="rev-stars-input">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button 
                                                    key={star} 
                                                    type="button" 
                                                    className={reviewRating >= star ? 'active' : ''}
                                                    onClick={() => setReviewRating(star)}
                                                >
                                                    <Star size={24} fill={reviewRating >= star ? "#f59e0b" : "none"} color={reviewRating >= star ? "#f59e0b" : "#cbd5e1"} />
                                                </button>
                                            ))}
                                        </div>
                                        <div className="rev-input-group">
                                            <textarea 
                                                placeholder="Describe the fit, quality, or style..."
                                                value={reviewComment}
                                                onChange={(e) => setReviewComment(e.target.value)}
                                                required
                                            ></textarea>
                                        </div>
                                        {reviewError && <p className="rev-err-msg">{reviewError}</p>}
                                        <button type="submit" className="pd-btn-primary rev-submit" disabled={submittingReview}>
                                            {submittingReview ? 'POSTING...' : 'SUBMIT REVIEW'}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="rev-login-prompt">
                                        <p>Please sign in to share your feedback with the community.</p>
                                        <button className="pd-btn-primary" onClick={() => navigate('/login')}>SIGN IN</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* List Column */}
                        <div className="rev-list-col">
                            {product.reviews && product.reviews.length > 0 ? (
                                <div className="rev-scroll-area">
                                    {product.reviews.map((rev, idx) => (
                                        <div key={rev._id || idx} className="rev-card-elite">
                                            <div className="rev-card-header">
                                                <div className="rev-user-profile">
                                                    {rev.avatar ? (
                                                        <img src={rev.avatar} alt={rev.name} className="rev-avatar-circle" />
                                                    ) : (
                                                        <div className="rev-avatar-circle">{rev.name?.[0]?.toUpperCase() || 'U'}</div>
                                                    )}
                                                    <div className="rev-user-details">
                                                        <span className="rev-user-name">{rev.name}</span>
                                                        <span className="rev-user-date">{new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                                <div className="rev-card-stars">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} fill={i < rev.rating ? "#f59e0b" : "none"} color={i < rev.rating ? "#f59e0b" : "#e2e8f0"} />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="rev-content">
                                                <p>{rev.comment}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rev-empty-state">
                                    <div className="empty-icon-wrap">
                                        <Star size={48} color="#e2e8f0" />
                                    </div>
                                    <p>No reviews yet. Be the first to share your experience!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
