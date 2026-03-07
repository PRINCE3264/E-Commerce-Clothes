import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, ArrowRight, MessageCircle, Share2, Filter, ChevronDown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import './Blog.css';

const Blog = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('All Stories');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['All Stories', 'Fashion', 'News', 'Lifestyle', 'Trends'];

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchBlogs = async () => {
            try {
                const res = await API.get('/blogs');
                if (isMounted) {
                    // Only show published posts to regular users
                    setPosts(res.data.data.filter(p => p.status === 'Published'));
                    setLoading(false);
                }
            } catch (err) {
                console.error("Failed to fetch blogs:", err);
                if (isMounted) setLoading(false);
            }
        };
        fetchBlogs();
        return () => { isMounted = false; };
    }, []);

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
                        {loading ? (
                            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '50px', fontSize: '1.2rem'}}>Loading articles...</div>
                        ) : filteredPosts.map((post, index) => (
                            <article className={`blog-card anim-delay-${(index % 3) + 1}`} key={post._id}>
                                <div className="blog-img-wrapper">
                                    <img src={post.image || 'https://images.unsplash.com/photo-1445205170230-053b830c6039?q=80&w=800'} alt={post.title} />
                                    <span className="blog-badge">{post.category}</span>
                                    <div className="blog-img-overlay">
                                        <button className="img-action-btn"><Share2 size={18} /></button>
                                    </div>
                                </div>
                                <div className="blog-content">
                                    <div className="blog-meta">
                                        <span className="meta-item"><Calendar size={14} /> {new Date(post.date).toLocaleDateString()}</span>
                                        <span className="meta-item"><User size={14} /> By {post.author}</span>
                                    </div>
                                    <h2 className="blog-post-title">{post.title}</h2>
                                    <p className="blog-excerpt">{post.excerpt}</p>
                                    <button 
                                        className="read-more-btn"
                                        onClick={() => navigate(`/blog/${post._id}`)}
                                    >
                                        Continue Reading <ArrowRight size={16} />
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>

                    {!loading && filteredPosts.length === 0 && (
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
