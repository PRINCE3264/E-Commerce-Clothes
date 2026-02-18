import React, { useState } from 'react';
import { Search, Calendar, User, ArrowRight, MessageCircle, Share2, Filter, ChevronDown, Zap } from 'lucide-react';
import './Blog.css';

const Blog = () => {
    const [activeCategory, setActiveCategory] = useState('All Stories');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['All Stories', 'Fashion', 'News', 'Lifestyle', 'Trends'];

    const posts = [
        {
            id: 1,
            title: "The Resurrection of Vintage Silhouettes",
            excerpt: "Exploring how 1950s tailoring is making a bold comeback in modern high-fashion circles with a contemporary twist.",
            category: "Fashion",
            date: "March 15, 2026",
            author: "Sarah Madison",
            image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: 2,
            title: "Sustainable Fabrics: The Future of Luxury",
            excerpt: "How eco-conscious materials are redefining what it means to be premium in the world of high-end fashion design.",
            category: "News",
            date: "March 12, 2026",
            author: "David Chen",
            image: "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: 3,
            title: "Summer Palette: Deep Oceans & Desert Sands",
            excerpt: "Discover the curated color palette that will dominate the upcoming resort collections and street style trends.",
            category: "Lifestyle",
            date: "March 08, 2026",
            author: "Michael Ross",
            image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: 4,
            title: "The Art of Minimalist Accessorizing",
            excerpt: "Less is more: A masterclass in choosing the perfect single statement piece to elevate your architectural look.",
            category: "Trends",
            date: "March 05, 2026",
            author: "Emma Stone",
            image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: 5,
            title: "Boutique Store Openings: Surat & Mumbai",
            excerpt: "Pandit Fashion expands its physical presence with two new flagship locations featuring immersive shopping experiences.",
            category: "News",
            date: "March 01, 2026",
            author: "Admin",
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000"
        },
        {
            id: 6,
            title: "Red Carpet Highlights: Modern Classics",
            excerpt: "An analysis of the most influential garments from recent award galas and how they translate to wearable boutique fashion.",
            category: "Fashion",
            date: "Feb 25, 2026",
            author: "Sarah Madison",
            image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=2000&auto=format&fit=crop"
        }
    ];

    const filteredPosts = posts.filter(post => {
        const matchesCategory = activeCategory === 'All Stories' || post.category === activeCategory;
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="blog-page">
            {/* Hero Section */}
            <section className="blog-hero">
                <div className="hero-overlay"></div>
                <div className="container">
                    <div className="hero-content centered">
                        <span className="hero-badge">Curated Insights</span>
                        <h1 className="blog-title">Pandit <span className="txt-accent">Editorial</span></h1>
                        <p className="blog-subtitle">Latest news, fashion trends, and lifestyle updates from our elite editors.</p>
                    </div>
                </div>
            </section>

            {/* Search & Filter Section */}
            <div className="filter-container">
                <div className="container">
                    <div className="filter-box">
                        <div className="search-wrapper">
                            <Search size={20} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search articles, trends, news..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="category-scroll">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Blog Grid */}
            <section className="blog-grid-section section-padding">
                <div className="container">
                    <div className="blog-grid">
                        {filteredPosts.map((post, index) => (
                            <article className={`blog-card anim-delay-${(index % 3) + 1}`} key={post.id}>
                                <div className="blog-img-wrapper">
                                    <img src={post.image} alt={post.title} />
                                    <span className="blog-badge">{post.category}</span>
                                    <div className="blog-img-overlay">
                                        <button className="img-action-btn"><Share2 size={18} /></button>
                                    </div>
                                </div>
                                <div className="blog-content">
                                    <div className="blog-meta">
                                        <span className="meta-item"><Calendar size={14} /> {post.date}</span>
                                        <span className="meta-item"><User size={14} /> By {post.author}</span>
                                    </div>
                                    <h2 className="blog-post-title">{post.title}</h2>
                                    <p className="blog-excerpt">{post.excerpt}</p>
                                    <button className="read-more-btn">
                                        Continue Reading <ArrowRight size={16} />
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>

                    {filteredPosts.length === 0 && (
                        <div className="no-results">
                            <h3>No articles found matching your criteria.</h3>
                            <button className="reset-btn" onClick={() => { setActiveCategory('All Stories'); setSearchQuery(''); }}>Reset Filters</button>
                        </div>
                    )}
                </div>
            </section>

            {/* Newsletter Section */}


        </div>
    );
};

export default Blog;
