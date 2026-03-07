import React, { useState, useEffect, useMemo } from 'react';
import API from '../../utils/api';
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    FileText, 
    Calendar, 
    User,
    CheckCircle,
    Clock,
    Image as ImageIcon,
    ExternalLink,
    Upload,
    Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const AdminBlog = () => {
    // Blog Posts initialization
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPosts = async () => {
        try {
            const res = await API.get('/blogs');
            setPosts(res.data.data);
        } catch (err) {
            console.error("Error fetching blogs", err);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
             const res = await API.get('/blogs');
             if(isMounted) setPosts(res.data.data);
        }
        load().catch(() => {});
        return () => { isMounted = false; };
    }, []);

    const filteredPosts = useMemo(() => {
        return posts.filter(post => 
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.author.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [posts, searchTerm]);

    const handleOpenForm = async (post = null) => {
        const isEdit = !!post;
        
        const result = await MySwal.fire({
            title: isEdit ? 'Sync Article Intelligence' : 'Compose New Draft',
            width: '1000px',
            padding: '2.5rem',
            showCancelButton: true,
            confirmButtonText: isEdit ? 'Apply Updates' : 'Publish Asset',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#f8fafc',
            allowOutsideClick: false,
            allowEscapeKey: false,
            buttonsStyling: false,
            customClass: {
                popup: 'b-extreme-swal-blue',
                confirmButton: 'b-swal-confirm-btn-blue',
                cancelButton: 'b-swal-cancel-btn-blue'
            },
            cancelButtonText: 'Discard',
            html: (
                <div className="swal-custom-form b-advanced-layout-blue">
                    <div className="b-form-grid-2">
                        {/* Section 1: Editorial Core */}
                        <div className="b-swal-sec">
                            <div className="b-sec-head-blue"><FileText size={16}/> 1. Content</div>
                            <div className="swal-input-group">
                                <label>Article Headline</label>
                                <input id="swal-blog-title" className="swal2-input" defaultValue={post?.title || ''} placeholder="Headline..." />
                            </div>
                            <div className="swal-input-group">
                                <label>Brief Excerpt</label>
                                <textarea id="swal-blog-excerpt" className="swal2-textarea compact" defaultValue={post?.excerpt || ''} placeholder="Meta description..."></textarea>
                            </div>
                            <div className="swal-input-group">
                                <label>Full Story Content (HTML Supported)</label>
                                <textarea id="swal-blog-content" className="swal2-textarea" style={{height: '250px !important'}} defaultValue={post?.content || ''} placeholder="Full story details..."></textarea>
                            </div>
                            <div className="v-stat-row">
                                <div className="mini-group">
                                    <label>Category</label>
                                    <select id="swal-blog-category" className="swal2-select" defaultValue={post?.category || 'Fashion'}>
                                        <option value="Fashion">Fashion</option>
                                        <option value="Lifestyle">Lifestyle</option>
                                        <option value="Tech">Tech</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Metadata & Logics */}
                        <div className="b-swal-sec no-border">
                            <div className="b-sec-head-blue"><User size={16}/> 2. Protocol</div>
                            <div className="v-stat-row">
                                <div className="swal-input-group">
                                    <label>Strategic Author</label>
                                    <input id="swal-blog-author" className="swal2-input" defaultValue={post?.author || 'Admin User'} placeholder="Author ID" />
                                </div>
                                <div className="swal-input-group">
                                    <label>Release Date</label>
                                    <input id="swal-blog-date" type="date" className="swal2-input" defaultValue={post?.date ? new Date(post.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} />
                                </div>
                            </div>
                            <div className="swal-input-group">
                                <label>CDN Source URI (Image URL)</label>
                                <input id="swal-blog-image" className="swal2-input" defaultValue={post?.image || ''} placeholder="https://..." onInput={(e) => {
                                    const previewImg = document.getElementById('swal-b-preview');
                                    if(previewImg) previewImg.src = e.target.value || 'https://via.placeholder.com/150?text=No+Cover';
                                }} />
                            </div>
                            <div className="swal-input-group b-upload-zone-mini">
                                <label>Or Upload Featured Image</label>
                                <div className="b-file-selector-wrapper">
                                    <input 
                                        type="file" 
                                        id="swal-blog-file" 
                                        accept="image/*" 
                                        style={{ display: 'none' }} 
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;

                                            const formData = new FormData();
                                            formData.append('image', file);
                                            
                                            const previewImg = document.getElementById('swal-b-preview');
                                            const statusText = document.getElementById('swal-upload-status');
                                            if(statusText) statusText.innerText = "Processing upload...";

                                            try {
                                                const res = await API.post('/upload', formData, {
                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                });
                                                if(res.data.success) {
                                                    const imgPath = `http://127.0.0.1:8000${res.data.path}`;
                                                    document.getElementById('swal-blog-image').value = imgPath;
                                                    if(previewImg) previewImg.src = imgPath;
                                                    if(statusText) statusText.innerText = "Upload Complete!";
                                                }
                                            } catch (err) {
                                                console.error("Upload failed", err);
                                                if(statusText) statusText.innerText = "Upload Failed: " + (err.response?.data?.message || err.message);
                                            }
                                        }}
                                    />
                                    <button 
                                        type="button" 
                                        className="b-btn-upload-trigger"
                                        onClick={() => document.getElementById('swal-blog-file').click()}
                                    >
                                        <Upload size={16} /> Choose File
                                    </button>
                                    <span id="swal-upload-status" className="b-upload-status">No file chosen</span>
                                </div>
                            </div>
                            <div className="b-iris-viewport mt-10">
                                <img id="swal-b-preview" src={post?.image || 'https://via.placeholder.com/150?text=No+Cover'} alt="Cover Preview" />
                            </div>
                            <div className="swal-input-group">
                                <label>Live Status</label>
                                <select id="swal-blog-status" className="swal2-select" defaultValue={post?.status || 'Published'}>
                                    <option value="Published">Published Asset</option>
                                    <option value="Draft">Internal Draft</option>
                                    <option value="Archived">Archive State</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            ),
            preConfirm: () => {
                const title = document.getElementById('swal-blog-title').value;
                const author = document.getElementById('swal-blog-author').value;
                const excerpt = document.getElementById('swal-blog-excerpt').value;
                const content = document.getElementById('swal-blog-content').value;
                const image = document.getElementById('swal-blog-image').value;
                const status = document.getElementById('swal-blog-status').value;
                const date = document.getElementById('swal-blog-date').value;
                const category = document.getElementById('swal-blog-category').value;

                if (!title || !author || !content) {
                    Swal.showValidationMessage('Headline, Author, and Content are mandatory.');
                    return false;
                }

                return { title, author, excerpt, content, image, status, date, category };
            }
        });

        const { value: formValues, isDismissed } = result;

        if (isDismissed) {
            MySwal.fire({
                icon: 'info',
                title: 'Changes Discarded',
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
            return;
        }

        if (formValues) {
            try {
                if (isEdit) {
                    await API.put(`/blogs/${post._id}`, formValues);
                    MySwal.fire({ icon: 'success', title: 'Intelligence Synced', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
                } else {
                    await API.post('/blogs', formValues);
                    MySwal.fire({ icon: 'success', title: 'Asset Published', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
                }
                fetchPosts();
            } catch (err) {
                console.error(err);
                MySwal.fire('Error', 'Failed to save article.', 'error');
            }
        }
    };

    const handleDelete = (post) => {
        MySwal.fire({
            title: 'Discard Article?',
            text: `Are you sure you want to delete "${post.title}"? This cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, Delete Post',
            cancelButtonText: 'Discard',
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await API.delete(`/blogs/${post._id}`);
                    fetchPosts();
                    MySwal.fire({ icon: 'success', title: 'Removed', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
                } catch {
                    MySwal.fire('Error', 'Failed to delete post.', 'error');
                }
            }
        });
    };

    return (
        <div className="admin-blog-container">
            <div className="admin-panel fade-in">
                <div className="panel-header">
                    <div className="header-left">
                        <h3>Content Strategy</h3>
                        <span className="count-tag-luxury">{filteredPosts.length} Articles</span>
                    </div>
                    <button className="btn-primary" onClick={() => handleOpenForm()}>
                        <Plus size={18} /> New Article
                    </button>
                </div>

                {/* Sub-Header / Filters */}
                <div className="admin-filters-bar mt-20">
                    <div className="search-wrapper modern">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search by title or author..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="blog-stats-brief">
                        <FileText size={16} />
                        <span>Manage your brand's editorial content</span>
                    </div>
                </div>

                <div className="table-responsive mt-30">
                    <table className="admin-table luxury-styled-table">
                        <thead>
                            <tr>
                                <th>Article Title</th>
                                <th>Author Details</th>
                                <th>Category</th>
                                <th>Publication Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPosts.length > 0 ? (
                                filteredPosts.map(post => (
                                    <tr key={post._id}>
                                        <td className="blog-title-cell">
                                            <div className="blog-preview-info">
                                                <div className="blog-thumb">
                                                    {post.image ? <img src={post.image} alt="" /> : <ImageIcon size={16} />}
                                                </div>
                                                <div className="blog-text-info">
                                                    <span className="b-title">{post.title}</span>
                                                    <span className="b-excerpt">{post.excerpt?.slice(0, 40)}...</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="blog-author-cell">
                                            <div className="author-info">
                                                <User size={14} />
                                                <span>{post.author}</span>
                                            </div>
                                        </td>
                                        <td><span className="blog-tag-inline">{post.category}</span></td>
                                        <td className="blog-date-cell">
                                            <div className="date-info">
                                                <Calendar size={14} />
                                                <span>{new Date(post.date).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`post-status-badge ${post.status.toLowerCase()}`}>
                                                {post.status === 'Published' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                                {post.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="blog-actions-bar">
                                                <button className="btn-circle-action edit" onClick={() => handleOpenForm(post)} title="Edit Article">
                                                    <Edit size={16} />
                                                </button>
                                                <button className="btn-circle-action delete" onClick={() => handleDelete(post)} title="Delete Article">
                                                    <Trash2 size={16} />
                                                </button>
                                                <button className="btn-circle-action view" title="View Source">
                                                    <ExternalLink size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="empty-results-area">
                                        <div className="no-blog-content">
                                            <FileText size={60} />
                                            <h4>No editorial content found</h4>
                                            <p>Try refining your search or start a new collection.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .admin-blog-container { padding: 0; }

                .count-tag-luxury {
                    background: #f0fdf4;
                    color: #166534;
                    padding: 4px 14px;
                    border-radius: 50px;
                    font-size: 0.8rem;
                    font-weight: 800;
                    margin-left: 15px;
                    border: 1px solid #bbf7d0;
                }

                .blog-stats-brief {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 20px;
                    background: #f8fafc;
                    border-radius: 12px;
                    color: #64748b;
                    font-size: 0.85rem;
                    font-weight: 600;
                    border: 1px solid #f1f5f9;
                }

                /* Table Styles */
                .blog-title-cell { min-width: 320px; }
                .blog-preview-info { display: flex; align-items: center; gap: 15px; }
                .blog-thumb {
                    width: 45px;
                    height: 45px;
                    border-radius: 10px;
                    overflow: hidden;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #e2e8f0;
                }
                .blog-thumb img { width: 100%; height: 100%; object-fit: cover; }
                .b-title { display: block; font-weight: 700; color: #1e293b; font-size: 0.95rem; }
                .b-excerpt { font-size: 0.75rem; color: #94a3b8; }

                .author-info, .date-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #64748b;
                    font-weight: 500;
                    font-size: 0.9rem;
                }

                .blog-tag-inline {
                    background: #eff6ff;
                    color: #3b82f6;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 700;
                }

                .post-status-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    border-radius: 50px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    width: fit-content;
                }
                .post-status-badge.published { background: #dcfce7; color: #16a34a; }
                .post-status-badge.draft { background: #fef3c7; color: #b45309; }
                .post-status-badge.archived { background: #f1f5f9; color: #475569; }

                .blog-actions-bar { display: flex; gap: 8px; }
                .btn-circle-action {
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-circle-action.edit { background: #f1f5f9; color: #64748b; }
                .btn-circle-action.edit:hover { background: #3b82f6; color: white; transform: translateY(-3px); }
                .btn-circle-action.delete { background: #f1f5f9; color: #64748b; }
                .btn-circle-action.delete:hover { background: #ef4444; color: white; transform: translateY(-3px); }
                .btn-circle-action.view { background: #f8fafc; color: #cbd5e1; }

                /* Advance Blue Blog Swal Pop CSS */
                .b-extreme-swal-blue { border-radius: 20px !important; overflow: hidden !important; animation: b-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes b-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                .b-advanced-layout-blue { text-align: left; }
                .b-form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
                .b-swal-sec { padding: 0 15px; border-right: 1px solid #f1f5f9; }
                .b-sec-head-blue { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #3b82f6; margin-bottom: 20px; border-bottom: 2px solid #eff6ff; padding-bottom: 8px; display: flex; align-items: center; gap: 8px; letter-spacing: 0.5px; }
                
                .swal-input-group label { font-size: 0.75rem !important; font-weight: 700 !important; color: #64748b !important; margin-bottom: 4px !important; display: block; }
                .swal2-input, .swal2-select, .swal2-textarea { height: 38px !important; font-size: 0.85rem !important; margin: 0 0 12px 0 !important; border-radius: 8px !important; background-color: #fcfdfe !important; border: 1px solid #e2e8f0 !important; transition: border-color 0.2s; }
                .swal2-input:focus, .swal2-select:focus, .swal2-textarea:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important; }
                .swal2-textarea.compact { height: 80px !important; padding: 10px !important; line-height: 1.4 !important; }

                .v-stat-row { display: grid; grid-template-columns: 1fr; gap: 10px; }
                .mini-group label { font-size: 0.7rem !important; font-weight: 800 !important; color: #94a3b8 !important; }

                .b-iris-viewport { margin-top: 10px; width: 100%; height: 160px; background: #f8fafc; border: 2px dashed #dbeafe; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
                .b-iris-viewport img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
                .b-iris-viewport:hover img { transform: scale(1.05); }
                .b-compliance-text { font-size: 0.65rem; color: #94a3b8; font-weight: 500; margin-top: 10px; text-align: center; line-height: 1.3; }

                .b-swal-confirm-btn-blue { padding: 10px 25px !important; font-size: 0.9rem !important; font-weight: 800 !important; border-radius: 10px !important; background: #3b82f6 !important; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2) !important; }
                .b-swal-cancel-btn-blue { padding: 10px 25px !important; font-size: 0.85rem !important; font-weight: 700 !important; border-radius: 10px !important; color: #64748b !important; }

                .b-upload-zone-mini { margin-top: 15px; background: #fdfdfd; padding: 12px; border: 1px dashed #e2e8f0; border-radius: 10px; }
                .b-file-selector-wrapper { display: flex; align-items: center; gap: 12px; margin-top: 8px; }
                .b-btn-upload-trigger { display: flex; align-items: center; gap: 8px; background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 6px 14px; border-radius: 6px; font-weight: 800; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; }
                .b-btn-upload-trigger:hover { background: #dbeafe; }
                .b-upload-status { font-size: 0.7rem; color: #94a3b8; font-weight: 600; }
            `}</style>
        </div>
    );
};

export default AdminBlog;
