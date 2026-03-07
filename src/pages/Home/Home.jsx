import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Truck,
    RefreshCcw,
    ShieldCheck,
    Headset,
    Heart,
    Eye,
    Star,
    MessageCircle,
    X,
    Send,
    ArrowRight,
    CheckCircle,
    Minus
} from 'lucide-react';
import './Home.css';
import './Home_CartModal.css';
import API from '../../utils/api';


import QuickViewModal from '../../components/Modals/QuickViewModal';

const Home = ({ onAddToCart, onToggleWishlist, wishlist = [] }) => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showWelcome, setShowWelcome] = useState(false);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    
    // UI Feedback States
    const [wishlistPopup, setWishlistPopup] = useState(null);
    const [quickView, setQuickView] = useState(null);

    useEffect(() => {
        // Show welcome popup only once per session
        const hasShownWelcome = sessionStorage.getItem('hasShownWelcome');

        if (!hasShownWelcome) {
            const timer = setTimeout(() => {
                setShowWelcome(true);
                sessionStorage.setItem('hasShownWelcome', 'true');
                
                // Auto Close after 3 seconds
                setTimeout(() => setShowWelcome(false), 3000);
            }, 500); // Small delay to avoid cascading render

            return () => clearTimeout(timer);
        }
    }, []);

    // Fetch Featured Products from DB
    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const res = await API.get('/products');
                if (res.data.success) {
                    const allProducts = res.data.data;
                    const featured = [];
                    const categories = ["Men's Wear", "Women's Wear", "Kids Wear", "Accessories"];
                    
                    // Try to get one from each major category for variety
                    categories.forEach(cat => {
                        const found = allProducts.find(p => p.category === cat);
                        if (found) featured.push(found);
                    });

                    // Fill up to 4 if some categories are missing
                    if (featured.length < 4) {
                        const remaining = allProducts.filter(p => !featured.includes(p));
                        featured.push(...remaining.slice(0, 4 - featured.length));
                    }

                    setFeaturedProducts(featured.slice(0, 4));
                }
            } catch (err) {
                console.error("Home: Error fetching products", err);
                setFeaturedProducts([]);
            }
        };
        fetchFeatured();
    }, []);

    const slides = [
        {
            bg: "https://www.centralembassy.com/wp-content/uploads/layerslider/men/siwilai-banner03-1024x478.jpg",
            title: <><span className="txt-yellow">Men's</span> <span className="txt-cyan">Golden Style </span></>,
            subtitle: <><span className="txt-pink">Authentic</span> <span className="txt-yellow-light">Denim & More</span></>,
            text: "Crafted for comfort and presence. Explore our new season arrivals.",
            link: "/products?category=men",
            btnText: "Shop Men"
        },
        {
            bg: "https://img.freepik.com/premium-photo/young-woman-buying-some-clothes_1368-92859.jpg?semt=ais_hybrid&w=740&q=80",
            title: <><span className="txt-pink">Women's</span> <span className="txt-cyan">Boutique</span></>,
            subtitle: <><span className="txt-yellow">Elevated</span> <span className="txt-yellow-light">Elegance</span></>,
            text: "Discover the perfect blend of style and sophistication in our latest collection.",
            link: "/products?category=women",
            btnText: "Shop Women"
        },
        {
            bg: "https://static.vecteezy.com/system/resources/thumbnails/013/400/398/small/education-concept-with-cartoon-students-vector.jpg",
            title: <><span className="txt-yellow">Kids</span> <span className="txt-pink">Adventures</span></>,
            subtitle: <><span className="txt-cyan">Playful</span> <span className="txt-yellow-light">& Durable</span></>,
            text: "Vibrant colors and comfortable fabrics for your little explorers.",
            link: "/products?category=kids",
            btnText: "Shop Kids"
        },
        {
            bg: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop",
            title: <><span className="txt-cyan">Urban</span> <span className="txt-yellow">Footwear</span></>,
            subtitle: <><span className="txt-pink">Classic</span> <span className="txt-yellow-light">White Essentials</span></>,
            text: "Walk with confidence in our premium leather sneakers and athletic wear.",
            link: "/products?category=shoes",
            btnText: "Shop Shoes"
        },
        {
            bg: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
            title: <><span className="txt-yellow-light">Eco-Friendly</span></>,
            subtitle: <><span className="txt-pink">Sustainable</span> <span className="txt-cyan">Choice</span></>,
            text: "Fashion that cares for the planet. Discover our organic and recycled fabrics.",
            link: "/products?collection=sustainable",
            btnText: "Go Green"
        }
    ];

    useEffect(() => {
        const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
        const timer = setInterval(nextSlide, 3500);
        return () => clearInterval(timer);
    }, [slides.length]);

    const handleWishlist = (product) => {
        setWishlistPopup(product);
        if (onToggleWishlist) onToggleWishlist(product);
        setTimeout(() => setWishlistPopup(null), 3000);
    };

    // Filtered lists for specific sections - DISABLED to keep UI simple
    // const menProducts = featuredProducts.filter(p => p.category === "Men's Wear" || p.category === "Men");
    // const womenProducts = featuredProducts.filter(p => p.category === "Women's Wear" || p.category === "Women");
    // const kidsProducts = featuredProducts.filter(p => p.category === "Kids Wear" || p.category === "Kids");

    const renderProductCard = (product) => (
        <div className="product-card" key={product._id}>
            <div 
                className="product-image" 
                style={{ backgroundImage: `url(${product.image})`, cursor: 'pointer' }}
                onClick={() => navigate(`/product/${product._id}`)}
            >
                <div className="product-actions">
                    <button className="action-btn heart-btn" title="Add to Wishlist" onClick={(e) => { e.stopPropagation(); handleWishlist(product); }}>
                        <Heart
                            size={18}
                            fill={wishlist.find(item => item._id === product._id) ? "#ff7675" : "none"}
                            color={wishlist.find(item => item._id === product._id) ? "#ff7675" : "currentColor"}
                        />
                    </button>
                    <button className="action-btn" title="Quick View" onClick={(e) => { e.stopPropagation(); setQuickView(product); }}><Eye size={18} /></button>
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
                <div className="product-meta-row">
                    <span className="product-category-label">{product.category}</span>
                    <div className="product-rating-compact">
                        <Star
                            size={14}
                            fill="#f59e0b"
                            color="#f59e0b"
                        />
                        <span className="rating-value">{product.rating || 4.5}</span>
                    </div>
                </div>
                <h4 className="product-title">{product.name}</h4>
                <div className="product-price">
                    <span className="current-price">₹{(product.price || 0).toLocaleString('en-IN')}</span>
                    {product.oldPrice && <span className="old-price">₹{product.oldPrice.toLocaleString('en-IN')}</span>}
                </div>

                <button
                    className="btn-add-to-cart"
                    onClick={() => navigate(`/product/${product._id}`)}
                >
                    <Eye size={20} />
                    <span>VIEW DETAILS</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-background-fader">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`hero-bg-layer ${currentSlide === index ? 'active' : ''}`}
                            style={{ backgroundImage: `url(${slide.bg})` }}
                        >
                            <div className="hero-overlay-dark"></div>
                        </div>
                    ))}
                </div>

                <div className="container hero-content-wrapper">
                    <div className="slide-content-left">
                        <h1 className="slide-title">{slides[currentSlide].title}</h1>
                        <h2 className="slide-subtitle">{slides[currentSlide].subtitle}</h2>
                        <p className="slide-text">{slides[currentSlide].text}</p>
                        <a href={slides[currentSlide].link} className="btn-view-all">{slides[currentSlide].btnText}</a>
                    </div>
                </div>

                <div className="slider-dots-left">
                    {slides.map((_, index) => (
                        <span
                            key={index}
                            className={`dot-thin ${currentSlide === index ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        ></span>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section section-padding">
                <div className="container">
                    <div className="section-header centered">
                        <h2>Why Choose Pandit Fashion</h2>
                        <p>We provide the best shopping experience for fashion enthusiasts</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon"><Truck size={32} /></div>
                            <h3>Free Shipping</h3>
                            <p>Free delivery on orders over ₹50</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><RefreshCcw size={32} /></div>
                            <h3>Easy Returns</h3>
                            <p>30-day return policy for all items</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><ShieldCheck size={32} /></div>
                            <h3>Secure Payment</h3>
                            <p>100% secure and encrypted payments</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><Headset size={32} /></div>
                            <h3>24/7 Support</h3>
                            <p>Customer support available anytime</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories-section section-padding bg-light">
                <div className="container">
                    <div className="section-header centered">
                        <h2>Shop By Category</h2>
                        <p>Browse our wide range of clothing categories</p>
                    </div>
                    <div className="categories-grid">
                        <div className="category-card">
                            <div className="category-image" style={{ backgroundImage: "url('https://www.centralembassy.com/wp-content/uploads/layerslider/men/siwilai-banner03-1024x478.jpg')" }}></div>
                            <div className="category-overlay">
                                <div className="category-content-reveal">
                                    <span className="category-count">120+ Items</span>
                                    <h3>Men's Fashion</h3>
                                    <a href="/products?category=Men's Wear" className="btn-category">Explore Now <ArrowRight size={16} /></a>
                                </div>
                            </div>
                        </div>
                        <div className="category-card">
                            <div className="category-image" style={{ backgroundImage: "url('https://www.shutterstock.com/image-photo/pretty-blonde-woman-smiling-camera-260nw-1927533401.jpg')" }}></div>
                            <div className="category-overlay">
                                <div className="category-content-reveal">
                                    <span className="category-count">85+ Items</span>
                                    <h3>Women's Boutique</h3>
                                    <a href="/products?category=Women's Wear" className="btn-category">Explore Now <ArrowRight size={16} /></a>
                                </div>
                            </div>
                        </div>
                        <div className="category-card">
                            <div className="category-image" style={{ backgroundImage: "url('https://www.ocregister.com/wp-content/uploads/migration/l7c/l7cypv-b78678426z.120100818101637000gt8pk1vu.1.jpg?w=620')" }}></div>
                            <div className="category-overlay">
                                <div className="category-content-reveal">
                                    <span className="category-count">50+ Items</span>
                                    <h3>Kids Collection</h3>
                                    <a href="/products?category=Kids Wear" className="btn-category">Explore Now <ArrowRight size={16} /></a>
                                </div>
                            </div>
                        </div>
                        <div className="category-card">
                            <div className="category-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=2000&auto=format&fit=crop')" }}></div>
                            <div className="category-overlay">
                                <div className="category-content-reveal">
                                    <span className="category-count">40+ Items</span>
                                    <h3>Accessories</h3>
                                    <a href="/products?category=Accessories" className="btn-category">Explore Now <ArrowRight size={16} /></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            {/* Quick View Modal */}
            {quickView && (
                <QuickViewModal 
                    product={quickView}
                    onClose={() => setQuickView(null)}
                    onAddToCart={onAddToCart}
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={wishlist.some(item => item._id === quickView._id)}
                />
            )}
            
            {/* Featured Collection Section - Showing only 4 products total as requested */}
            {featuredProducts.length > 0 && (
                <section className="products-section section-padding">
                    <div className="container">
                        <div className="section-header centered">
                            <h2>Featured Collection</h2>
                            <p>Refined styles handpicked for your wardrobe</p>
                        </div>
                        <div className="products-grid">
                            {featuredProducts.map(renderProductCard)}
                        </div>
                        <div className="centered mt-5">
                            <Link to="/products" className="btn-view-all">Explore All Products</Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Ultra-Premium Advanced Level Success Modal REMOVED - Using Mini-Cart Preview */}

            {/* Premium Red Wishlist Modal */}
            {wishlistPopup && (
                <div className="wishlist-popup-overlay">
                    <div className="wishlist-red-modal animate-scale-in">
                        <button className="wish-close-btn" onClick={() => setWishlistPopup(null)}>
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
                            <strong className="wish-product-name">{wishlistPopup.name}</strong> has been added to your favorites. You can access it anytime from your profile.
                        </p>

                        <div className="wish-red-actions">
                            <button className="btn-view-wishlist-red" onClick={() => navigate('/wishlist')}>
                                View My Wishlist
                            </button>
                            <button className="btn-continue-browsing-red" onClick={() => setWishlistPopup(null)}>
                                Continue Browsing
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Testimonials */}
            <section className="testimonials-section section-padding bg-light">
                <div className="container">
                    <div className="section-header centered">
                        <h2>What Our Customers Say</h2>
                        <p>Real reviews from real customers</p>
                    </div>
                    <div className="testimonials-grid">
                        <div className="testimonial-card">
                            <p className="testimonial-text">"The quality of clothes is amazing! Fast shipping and great customer service. Will definitely shop again!"</p>
                            <div className="testimonial-author">
                                <div className="author-avatar">PV</div>
                                <div>
                                    <h5>PRINCE VIDYARTHI</h5>
                                    <span>Fashion Blogger</span>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <p className="testimonial-text">"Best online shopping experience! The clothes fit perfectly and the materials are premium quality. Highly recommended!"</p>
                            <div className="testimonial-author">
                                <div className="author-avatar">MC</div>
                                <div>
                                    <h5>Michael Chen</h5>
                                    <span>Regular Customer</span>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <p className="testimonial-text">"Great variety of styles and sizes. The return policy made it risk-free to try new styles. Love this store!"</p>
                            <div className="testimonial-author">
                                <div className="author-avatar">ED</div>
                                <div>
                                    <h5>Emma Davis</h5>
                                    <span>Fashion Designer</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Welcome Popup - Auto Close */}
            {showWelcome && (
                <div className="cart-popup-overlay">
                    <div className="studio-welcome-modal">
                        <button className="close-welcome-btn" onClick={() => setShowWelcome(false)}>
                            <X size={20} />
                        </button>
                        <div className="welcome-image-top">
                            <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=" alt="Premium Collection" />
                        </div>
                        <div className="welcome-content-bottom">
                            <span className="studio-badge">STUDIO EXCLUSIVE</span>
                            <h2 className="collection-title">Welcome to the Pandit Fashion</h2>
                            <p className="collection-desc">
                                Our latest tailored selections are now curated for your boutique bag.
                                Enjoy complimentary delivery on your first acquisition of the season.
                            </p>
                            <button className="btn-explore-selections" onClick={() => setShowWelcome(false)}>
                                EXPLORE SELECTIONS
                            </button>
                        </div>
                        <div className="popup-loading-bar thinner"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
