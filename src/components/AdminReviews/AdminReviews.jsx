import React, { useState, useEffect } from 'react';
import { Star, Search, Trash2, MessageSquare, Filter, Package, User, Calendar, ExternalLink, Check, AlertCircle } from 'lucide-react';
import API from '../../utils/api';
import './AdminReviews.css';

const AdminReviews = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'details'

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await API.get('/admin/products');
            if (res.data.success) {
                // Filter products that have reviews
                setProducts(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching admin products", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async (productId, reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
            const res = await API.delete(`/products/${productId}/reviews/${reviewId}`);
            if (res.data.success) {
                // Refresh data
                if (selectedProduct && selectedProduct._id === productId) {
                    const updatedProd = await API.get(`/products/${productId}?view=admin`);
                    if (updatedProd.data.success) {
                        setSelectedProduct(updatedProd.data.data);
                    }
                }
                fetchProducts();
            }
        } catch (err) {
            alert(err.response?.data?.message || "Error deleting review");
        }
    };

    const handleApproveReview = async (productId, reviewId) => {
        try {
            const res = await API.put(`/products/${productId}/reviews/${reviewId}/approve`);
            if (res.data.success) {
                // Refresh data
                if (selectedProduct && selectedProduct._id === productId) {
                    const updatedProd = await API.get(`/products/${productId}?view=admin`);
                    if (updatedProd.data.success) {
                        setSelectedProduct(updatedProd.data.data);
                    }
                }
                fetchProducts();
            }
        } catch (err) {
            alert(err.response?.data?.message || "Error approving review");
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    ).filter(p => p.reviews && p.reviews.length > 0);

    const openProductReviews = (product) => {
        setSelectedProduct(product);
        setViewMode('details');
    };

    if (loading && products.length === 0) {
        return (
            <div className="admin-reviews-loading">
                <div className="admin-spinner"></div>
                <p>Loading member feedback...</p>
            </div>
        );
    }

    return (
        <div className="admin-reviews-page">
            <div className="admin-reviews-header">
                <div className="header-left">
                    <h2>Member Reviews</h2>
                    <p>Manage product feedback and member ratings</p>
                </div>
                {viewMode === 'details' && (
                    <button className="back-btn" onClick={() => setViewMode('list')}>
                        Back to List
                    </button>
                )}
            </div>

            {viewMode === 'list' ? (
                <div className="reviews-list-container">
                    <div className="reviews-controls">
                        <div className="search-wrap">
                            <Search size={18} />
                            <input 
                                type="text" 
                                placeholder="Search products with reviews..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="products-reviews-grid">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <div key={product._id} className="product-review-card" onClick={() => openProductReviews(product)}>
                                    <div className="p-img">
                                        <img src={product.image} alt={product.name} />
                                    </div>
                                    <div className="p-info">
                                        <h4>{product.name}</h4>
                                        <div className="p-stats">
                                            <div className="stat-item">
                                                <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                                <span>{(product.rating || 0).toFixed(1)}</span>
                                            </div>
                                            <div className="stat-item">
                                                <MessageSquare size={14} />
                                                <span>{product.reviews.length} Total</span>
                                            </div>
                                            {product.numReviews < product.reviews.length && (
                                                <div className="stat-item pending">
                                                    <AlertCircle size={14} color="#ef4444" />
                                                    <span style={{color: '#ef4444'}}>{product.reviews.length - product.numReviews} Pending</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="view-arrow">
                                        <ExternalLink size={20} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-reviews-empty">
                                <MessageSquare size={48} />
                                <p>{searchTerm ? "No products found matching your search." : "No product reviews have been posted yet."}</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="review-details-container">
                    <div className="product-context">
                        <img src={selectedProduct.image} alt={selectedProduct.name} />
                        <div className="context-text">
                            <h3>{selectedProduct.name}</h3>
                            <div className="avg-rating">
                                <div className="stars">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} fill={i < Math.floor(selectedProduct.rating) ? "#f59e0b" : "none"} color={i < Math.floor(selectedProduct.rating) ? "#f59e0b" : "#e2e8f0"} />
                                    ))}
                                </div>
                                <span>{(selectedProduct.rating || 0).toFixed(1)} Avg Rating</span>
                            </div>
                        </div>
                    </div>

                    <div className="reviews-table-wrapper">
                        <table className="admin-reviews-table">
                            <thead>
                                <tr>
                                    <th>Member</th>
                                    <th>Rating</th>
                                    <th>Comment</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedProduct.reviews && selectedProduct.reviews.map(rev => (
                                    <tr key={rev._id}>
                                        <td>
                                            <div className="user-cell">
                                                {rev.avatar ? (
                                                    <img src={rev.avatar} alt={rev.name} className="user-initial" style={{ objectFit: 'cover' }} />
                                                ) : (
                                                    <div className="user-initial">{rev.name?.[0]}</div>
                                                )}
                                                <span>{rev.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="rating-cell">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} fill={i < rev.rating ? "#f59e0b" : "none"} color={i < rev.rating ? "#f59e0b" : "#e2e8f0"} />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="comment-cell">
                                            <p>{rev.comment}</p>
                                        </td>
                                        <td>{new Date(rev.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`status-badge ${rev.isApproved ? 'approved' : 'pending'}`}>
                                                {rev.isApproved ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-btns">
                                                {!rev.isApproved && (
                                                    <button className="approve-btn" title="Approve Review" onClick={() => handleApproveReview(selectedProduct._id, rev._id)}>
                                                        <Check size={18} />
                                                    </button>
                                                )}
                                                <button className="del-btn" title="Delete Review" onClick={() => handleDeleteReview(selectedProduct._id, rev._id)}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReviews;
