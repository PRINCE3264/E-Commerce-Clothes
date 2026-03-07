import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    Calendar, 
    User, 
    ChevronLeft, 
    Share2, 
    MessageCircle, 
    Bookmark, 
    Clock, 
    Tag,
    ArrowRight,
    Search,
    Facebook,
    Twitter,
    Instagram,
    Send
} from 'lucide-react';
import API from '../../utils/api';
import './BlogDetails.css';

const BlogDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentPosts, setRecentPosts] = useState([]);

    useEffect(() => {
        const fetchBlogDetails = async () => {
            try {
                const res = await API.get(`/blogs/${id}`);
                if (res.data.success) {
                    setBlog(res.data.data);
                }
                
                // Fetch recent posts for sidebar
                const recentRes = await API.get('/blogs');
                if (recentRes.data.success) {
                    setRecentPosts(recentRes.data.data.filter(p => p._id !== id).slice(0, 3));
                }
                
                setLoading(false);
            } catch (err) {
                console.error("Error fetching blog details:", err);
                setLoading(false);
            }
        };

        fetchBlogDetails();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return (
            <div className="blog-details-loading">
                <div className="spinner"></div>
                <p>Curating your story...</p>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="blog-not-found container">
                <h2>Story Not Found</h2>
                <p>The shared link might be expired or the article was archived.</p>
                <Link to="/blog" className="btn-return">Return to Editorial</Link>
            </div>
        );
    }

    return (
        <div className="blog-details-page">
            {/* Minimal Header */}
            <div className="blog-nav-sticky">
                <div className="container">
                    <div className="nav-inner">
                        <button className="back-btn" onClick={() => navigate('/blog')}>
                            <ChevronLeft size={20} /> BACK TO EDITORIAL
                        </button>
                        <div className="nav-share-actions">
                            <button className="nav-icon-btn"><Bookmark size={18} /></button>
                            <button className="nav-icon-btn"><Share2 size={18} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Header */}
            <header className="story-header container">
                <div className="story-top-meta">
                    <span className="story-category">{blog.category}</span>
                    <span className="story-read-time"><Clock size={14} /> 6 min read</span>
                </div>
                <h1 className="story-title">{blog.title}</h1>
                <div className="story-author-meta">
                    <div className="author-info">
                        <div className="author-avatar">
                            {blog.author.charAt(0)}
                        </div>
                        <div className="author-details">
                            <span className="author-name">By {blog.author}</span>
                            <span className="publish-date"><Calendar size={12} /> {new Date(blog.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                    </div>
                    <div className="social-shares">
                        <Facebook size={18} />
                        <Twitter size={18} />
                        <Instagram size={18} />
                    </div>
                </div>
            </header>

            {/* Main Image */}
            <div className="story-hero-image container">
                <img src={blog.image || 'https://images.unsplash.com/photo-1445205170230-053b830c6039?q=80&w=1200'} alt={blog.title} />
            </div>

            {/* content Grid */}
            <div className="story-content-grid container">
                <main className="story-main">
                    <p className="story-excerpt">{blog.excerpt}</p>
                    <div className="story-body" dangerouslySetInnerHTML={{ __html: blog.content }}>
                    </div>
                    
                    <footer className="story-footer">
                        <div className="story-tags">
                            <span><Tag size={14} /> FASHION</span>
                            <span>TRENDS</span>
                            <span>2026</span>
                        </div>
                        <div className="story-actions">
                            <button className="action-btn-large"><MessageCircle size={20} /> 12 Comments</button>
                            <button className="action-btn-large"><Share2 size={20} /> Share Article</button>
                        </div>
                    </footer>
                </main>

                <aside className="story-sidebar">
                    <div className="sidebar-widget search-widget">
                        <div className="widget-search">
                            <input type="text" placeholder="Search insights..." />
                            <Search size={18} />
                        </div>
                    </div>

                    <div className="sidebar-widget recent-widget">
                        <h3>Recent Stories</h3>
                        <div className="recent-posts-list">
                            {recentPosts.map(post => (
                                <Link to={`/blog/${post._id}`} key={post._id} className="recent-post-card">
                                    <div className="rp-img">
                                        <img src={post.image} alt={post.title} />
                                    </div>
                                    <div className="rp-info">
                                        <h4>{post.title}</h4>
                                        <span>{new Date(post.date).toLocaleDateString()}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="sidebar-widget promo-widget">
                        <div className="promo-box">
                            <span>Spring Collection</span>
                            <h4>The Art of Minimalist Style</h4>
                            <button onClick={() => navigate('/products')}>SHOP NOW <ArrowRight size={14} /></button>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Related Stories */}
             {/* <section className="related-stories section-padding">
                <div className="container">
                    <div className="section-header">
                        <h2>More From <span className="txt-accent">Pandit</span></h2>
                    </div>
                    <div className="related-grid">
                        {recentPosts.map(post => (
                            <div className="related-card" key={post._id} onClick={() => navigate(`/blog/${post._id}`)}>
                                <div className="rc-img">
                                    <img src={post.image} alt={post.title} />
                                </div>
                                <div className="rc-content">
                                    <h3>{post.title}</h3>
                                    <button>READ STORY <ArrowRight size={14}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        
            <section className="blog-newsletter container">
                <div className="n-box">
                    <div className="n-content">
                        <h2>Join The <span className="txt-accent">Elite</span></h2>
                        <p>Subscribe to our editorial newsletter for exclusive style guides and early access to collection drops.</p>
                        <div className="n-form">
                            <input type="email" placeholder="Enter your email" />
                            <button><Send size={18} /> JOIN NOW</button>
                        </div>
                    </div>
                </div>
            </section>  */}
        </div>
    );
};

export default BlogDetails;
