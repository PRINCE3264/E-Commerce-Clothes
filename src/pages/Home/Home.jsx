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
    ShoppingCart,
    Plus,
    Minus
} from 'lucide-react';
import './Home.css';
import './Home_CartModal.css';

const Home = ({ onAddToCart, onToggleWishlist, wishlist = [] }) => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessage, setChatMessage] = useState("");
    const [messages, setMessages] = useState([
        { text: "Hello! How can I help you today?", sender: "bot" }
    ]);

    // Modal States
    const [wishlistPopup, setWishlistPopup] = useState(null); // { product, visible }
    const [quickView, setQuickView] = useState(null); // { product, visible }
    const [selectedSize, setSelectedSize] = useState('M'); // For Quick View
    const [selectedSizes, setSelectedSizes] = useState({}); // New: Store selected sizes for each product card
    const [quantity, setQuantity] = useState(1);
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        // Show welcome popup only once per session
        const hasShownWelcome = sessionStorage.getItem('hasShownWelcome');

        if (!hasShownWelcome) {
            // Show popup immediately
            setShowWelcome(true);
            sessionStorage.setItem('hasShownWelcome', 'true');

            // Auto Close after 3 seconds of showing
            const closeTimer = setTimeout(() => {
                setShowWelcome(false);
            }, 3000);

            return () => clearTimeout(closeTimer);
        }
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

    const featuredProducts = [
        {
            id: 1001,
            title: "Floral Silk Gown",
            category: "Women's Fashion",
            price: 120.00,
            image: "https://clothsvilla.com/cdn/shop/files/blue-elegant-party-wear-gown-long-koti-set-with-embroidery-and-sequins_4_871x.jpg?v=1736416701",
            badge: "New",
            rating: 5,
            reviews: 15,
            colors: ["#ff6b6b", "#6bcb77", "#4d96ff"],
            sizes: ["S", "M", "L", "XL"]
        },
        {
            id: 1002,
            title: "Golden Mesh Watch",
            category: "Accessories",
            price: 85.00,
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnzwqvJ6EymwOKjR5j_4p6qMz7hRfmEaOa2Q&s",
            badge: "Trending",
            rating: 5,
            reviews: 104,
            colors: ["#ffd700", "#c0c0c0"],
            sizes: ["One Size"]
        },
        {
            id: 1003,
            title: "Urban Denim Jacket",
            category: "Men's Fashion",
            price: 89.00,
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWIuO8VNqEKpxrZs9qWDquO6pRUdz-36h2ew&s",
            rating: 4,
            reviews: 34,
            colors: ["#3498db", "#2c3e50"],
            sizes: ["M", "L", "XL", "XXL"]
        },
        {
            id: 1004,
            title: "Rugged Outdoor Adventure Boots",
            category: "Footwear",
            price: 155.00,
            originalPrice: 201.50,
            image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1974&auto=format&fit=crop",
            badge: "Sale",
            rating: 4.5,
            reviews: 42,
            colors: ["#5d4037", "#1a1a1a"],
            sizes: ["9", "10", "11"]
        },
        {
            id: 1005,
            title: "Little Explorer Denim Set",
            category: "Kids Fashion",
            price: 1450.00,
            originalPrice: 1800.00,
            image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1978&auto=format&fit=crop",
            badge: "New",
            rating: 4.8,
            reviews: 18,
            colors: ["#89CFF0", "#F5F5DC"],
            sizes: ["2-3Y", "4-5Y", "6-7Y"]
        },
        {
            id: 1006,
            title: "Men's Premium Essential Tee",
            category: "Men's Fashion",
            price: 25.99,
            image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2000&auto=format&fit=crop",
            badge: "Classic",
            rating: 4.5,
            reviews: 128,
            colors: ["#ffffff", "#000000", "#333333"],
            sizes: ["S", "M", "L", "XL"]
        }
    ];

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

    useEffect(() => {
        const timer = setInterval(nextSlide, 3000);
        return () => clearInterval(timer);
    }, []);

    const handleSendMessage = () => {
        if (!chatMessage.trim()) return;
        setMessages([...messages, { text: chatMessage, sender: "user" }]);
        setChatMessage("");
        setTimeout(() => {
            setMessages((prev) => [...prev, { text: "I'm processing your request. One moment...", sender: "bot" }]);
        }, 1000);
    };

    const handleAddToCart = (product) => {
        // Map 'title' to 'name' for consistency with global cart system
        const productWithStandardName = { ...product, name: product.title || product.name };
        if (onAddToCart) onAddToCart(productWithStandardName);
    };

    const handleWishlist = (product) => {
        setWishlistPopup(product);
        if (onToggleWishlist) onToggleWishlist(product);
        setTimeout(() => setWishlistPopup(null), 3000);
    };

    const handleOpenQuickView = (product) => {
        setQuickView(product);
        setQuantity(1);
        setSelectedSize(product.sizes[0]);
    };

    const handleSizeSelect = (productId, size) => {
        setSelectedSizes(prev => ({ ...prev, [productId]: size }));
    };

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
                        <h2>Why Choose Khushi Fashion</h2>
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
                                    <a href="/products?category=men" className="btn-category">Explore Now <ArrowRight size={16} /></a>
                                </div>
                            </div>
                        </div>
                        <div className="category-card">
                            <div className="category-image" style={{ backgroundImage: "url('https://www.shutterstock.com/image-photo/pretty-blonde-woman-smiling-camera-260nw-1927533401.jpg')" }}></div>
                            <div className="category-overlay">
                                <div className="category-content-reveal">
                                    <span className="category-count">85+ Items</span>
                                    <h3>Women's Boutique</h3>
                                    <a href="/products?category=women" className="btn-category">Explore Now <ArrowRight size={16} /></a>
                                </div>
                            </div>
                        </div>
                        <div className="category-card">
                            <div className="category-image" style={{ backgroundImage: "url('https://www.ocregister.com/wp-content/uploads/migration/l7c/l7cypv-b78678426z.120100818101637000gt8pk1vu.1.jpg?w=620')" }}></div>
                            <div className="category-overlay">
                                <div className="category-content-reveal">
                                    <span className="category-count">50+ Items</span>
                                    <h3>Kids Collection</h3>
                                    <a href="/products?category=kids" className="btn-category">Explore Now <ArrowRight size={16} /></a>
                                </div>
                            </div>
                        </div>
                        <div className="category-card">
                            <div className="category-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=2000&auto=format&fit=crop')" }}></div>
                            <div className="category-overlay">
                                <div className="category-content-reveal">
                                    <span className="category-count">40+ Items</span>
                                    <h3>Accessories</h3>
                                    <a href="/products?category=accessories" className="btn-category">Explore Now <ArrowRight size={16} /></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="products-section section-padding">
                <div className="container">
                    <div className="section-header centered">
                        <h2>Featured Products</h2>
                        <p>Discover our best-selling items</p>
                    </div>
                    <div className="products-grid">
                        {featuredProducts.map((product) => (
                            <div className="product-card" key={product.id}>
                                <div className="product-image" style={{ backgroundImage: `url(${product.image})` }}>
                                    <div className="product-actions">
                                        <button className="action-btn heart-btn" title="Add to Wishlist" onClick={() => handleWishlist(product)}>
                                            <Heart
                                                size={18}
                                                fill={wishlist.find(item => item.id === product.id) ? "#ff7675" : "none"}
                                                color={wishlist.find(item => item.id === product.id) ? "#ff7675" : "currentColor"}
                                            />
                                        </button>
                                        <button className="action-btn cart-btn" title="Add to Cart" onClick={() => handleAddToCart(product)}><ShoppingCart size={18} /></button>
                                        <button className="action-btn" title="Quick View" onClick={() => handleOpenQuickView(product)}><Eye size={18} /></button>
                                    </div>
                                    {product.badge && <span className={`product-badge ${product.badge.toLowerCase()}`}>{product.badge}</span>}
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
                                    <h4 className="product-title">{product.title || product.name}</h4>
                                    <div className="product-price">
                                        <span className="current-price">₹{product.price.toFixed(2)}</span>
                                        {product.originalPrice && <span className="old-price">₹{product.originalPrice.toFixed(2)}</span>}
                                    </div>
                                    {product.sizes && (
                                        <div className="product-sizes-selector" style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                                            {product.sizes.map(size => (
                                                <button
                                                    key={size}
                                                    onClick={(e) => { e.preventDefault(); handleSizeSelect(product.id, size); }}
                                                    style={{
                                                        padding: '6px 10px',
                                                        border: `1px solid ${selectedSizes[product.id] === size ? '#1e3a5f' : '#e2e8f0'}`,
                                                        borderRadius: '6px',
                                                        background: selectedSizes[product.id] === size ? '#1e3a5f' : 'white',
                                                        color: selectedSizes[product.id] === size ? 'white' : '#64748b',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600',
                                                        transition: 'all 0.2s ease',
                                                        boxShadow: selectedSizes[product.id] === size ? '0 2px 5px rgba(30, 58, 95, 0.2)' : 'none'
                                                    }}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        className="btn-add-to-cart"
                                        onClick={() => {
                                            const sizeToAdd = selectedSizes[product.id] || (product.sizes ? product.sizes[0] : null);
                                            handleAddToCart({ ...product, size: sizeToAdd });
                                        }}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="centered mt-5">
                        <a href="/products" className="btn-view-all">View All Products</a>
                    </div>
                </div>
            </section>

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
                            <strong className="wish-product-name">{wishlistPopup.name || wishlistPopup.title}</strong> has been added to your favorites. You can access it anytime from your profile.
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

            {/* Quick View Modal */}
            {quickView && (
                <div className="quickview-modal-overlay" onClick={() => setQuickView(null)}>
                    <div className="quickview-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-quickview" onClick={() => setQuickView(null)}><X size={24} /></button>
                        <div className="qv-layout">
                            <div className="qv-image" style={{ backgroundImage: `url(${quickView.image})` }}></div>
                            <div className="qv-details">
                                <span className="qv-category">{quickView.category || "Men's Wear"}</span>
                                <h2 className="qv-title">{quickView.title}</h2>

                                <div className="qv-price">
                                    ₹{quickView.price.toFixed(2)}
                                    <span className="stock-pill">In Stock</span>
                                </div>

                                <div className="qv-rating">
                                    <Star size={18} fill="#f59e0b" stroke="none" />
                                    <Star size={18} fill="#f59e0b" stroke="none" />
                                    <Star size={18} fill="#f59e0b" stroke="none" />
                                    <Star size={18} fill="#f59e0b" stroke="none" />
                                    <Star size={18} fill="none" stroke="#f59e0b" />
                                    <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>({quickView.reviews || 4.6} Rating)</span>
                                </div>

                                <p className="qv-desc">Experience premium quality with our {quickView.title}. Crafted from high-grade materials, this piece offers both style and unparalleled comfort for everyday luxury.</p>

                                <div className="qv-options">
                                    <div className="option-group">
                                        <label>Available Sizes</label>
                                        <div className="size-btns">
                                            {quickView.sizes.map(size => (
                                                <button
                                                    key={size}
                                                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                                                    onClick={() => setSelectedSize(size)}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="qv-actions">
                                    {/* Quantity hidden via CSS for this design */}
                                    <div className="quantity-selector">
                                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={16} /></button>
                                        <span>{quantity}</span>
                                        <button onClick={() => setQuantity(q => q + 1)}><Plus size={16} /></button>
                                    </div>

                                    <button className="qv-add-btn" onClick={() => { handleAddToCart(quickView); setQuickView(null); }}>
                                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '5px', borderRadius: '4px', display: 'flex' }}>
                                            <ShoppingCart size={18} />
                                        </div>
                                        Add to Shopping Bag
                                    </button>

                                    <button
                                        className="action-btn qv-wish-btn"
                                        onClick={() => handleWishlist(quickView)}
                                    >
                                        <Heart
                                            size={22}
                                            fill={wishlist.find(item => item.id === quickView.id) ? "#ef4444" : "#ef4444"}
                                            color="#ef4444"
                                        />
                                    </button>
                                </div>
                            </div>
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
