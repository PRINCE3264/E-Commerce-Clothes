import React, { useState, useEffect, useMemo } from 'react';
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    Tag, 
    CheckCircle, 
    Info, 
    AlertCircle,
    Eye,
    Loader2
} from 'lucide-react';
import API from '../../utils/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch Categories from API
    const fetchCategories = async () => {
        setLoading(true);
        try {
            // Using a custom config to use admin_token instead of auth_token for this request
            const token = localStorage.getItem('admin_token');
            const res = await API.get('/admin/categories', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setCategories(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
            MySwal.fire({
                icon: 'error',
                title: 'Sync Failed',
                text: 'Could not connect to the categories engine.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const filteredCategories = useMemo(() => {
        return categories.filter(cat => 
            cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm]);

    const handleOpenForm = async (category = null) => {
        const isEdit = !!category;
        
        const result = await MySwal.fire({
            title: isEdit ? 'Edit Category' : 'Create New Category',
            width: '450px',
            padding: '2rem',
            showCancelButton: true,
            confirmButtonText: isEdit ? 'Update Category' : 'Create Category',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#f8fafc',
            cancelButtonText: 'Discard',
            customClass: {
                popup: 'v-extreme-swal-blue',
                confirmButton: 'b-swal-confirm-btn-blue',
                cancelButton: 'b-swal-cancel-btn-blue'
            },
            html: (
                <div className="b-advanced-layout-blue category-popup-redesign">
                    <div className="b-swal-sec no-border">
                        <div className="b-sec-head-blue"><Tag size={14}/> 1. Inventory Label</div>
                        <div className="swal-input-group">
                            <label>Designation (Name)</label>
                            <div className="input-with-icon">
                                <Tag size={16} className="field-icon" />
                                <input id="swal-cat-name" className="swal2-input" defaultValue={category?.name || ''} placeholder="e.g. Athleisure, Winter Collection..." />
                            </div>
                        </div>

                        <div className="swal-input-group">
                            <label>Global Visibility</label>
                            <div className="input-with-icon">
                                <CheckCircle size={16} className="field-icon" />
                                <select id="swal-cat-status" className="swal2-select" defaultValue={category?.status || 'active'}>
                                    <option value="active">Active (Visible to Customers)</option>
                                    <option value="inactive">Inactive (Internal Archive)</option>
                                </select>
                            </div>
                        </div>

                        <div className="b-sec-head-blue mt-20"><Info size={14}/> 2. Collection Abstract</div>
                        <div className="swal-input-group">
                            <label>Detailed Description</label>
                            <textarea id="swal-cat-desc" className="swal2-textarea compact" defaultValue={category?.description || ''} placeholder="Describe the soul of this collection for your customers..."></textarea>
                        </div>
                    </div>
                </div>
            ),
            preConfirm: () => {
                const name = document.getElementById('swal-cat-name').value;
                const description = document.getElementById('swal-cat-desc').value;
                const status = document.getElementById('swal-cat-status').value;

                if (!name) {
                    Swal.showValidationMessage('Name is required');
                    return false;
                }
                if (!description) {
                    Swal.showValidationMessage('Description is required');
                    return false;
                }

                return { name, description, status };
            }
        });

        if (result.isConfirmed) {
            const formValues = result.value;
            try {
                const token = localStorage.getItem('admin_token');
                let res;
                if (isEdit) {
                    res = await API.put(`/admin/categories/${category._id}`, formValues, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } else {
                    res = await API.post('/admin/categories', formValues, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }

                if (res.data.success) {
                    fetchCategories();
                    MySwal.fire({ 
                        icon: 'success', 
                        title: isEdit ? 'Category Updated' : 'Category Created', 
                        timer: 2000, 
                        showConfirmButton: false, 
                        toast: true, 
                        position: 'top-end' 
                    });
                }
            } catch (err) {
                MySwal.fire({
                    icon: 'error',
                    title: 'Action Failed',
                    text: err.response?.data?.message || 'Something went wrong',
                });
            }
        }
    };

    const handleView = (category) => {
        MySwal.fire({
            title: category.name + ' - Collection Details',
            width: '500px',
            padding: '2rem',
            background: '#ffffff',
            customClass: {
                popup: 'v-extreme-swal-blue',
                confirmButton: 'b-swal-confirm-btn-blue'
            },
            confirmButtonText: 'Database Synchronized',
            html: (
                <div className="view-category-details" style={{ textAlign: 'left' }}>
                    <div className="v-label">COLLECTION LABEL</div>
                    <div className="v-val" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>{category.name}</div>
                    
                    <div className="v-label">VISIBILITY STATUS</div>
                    <div className={`status-pill ${category.status}`} style={{ marginBottom: '20px' }}>
                        {category.status === 'active' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                        {category.status.toUpperCase()}
                    </div>
                    
                    <div className="v-label">BLUEPRINT ABSTRACT</div>
                    <div className="v-val" style={{ fontSize: '1rem', fontStyle: 'italic', color: '#64748b' }}>
                        {category.description || 'No detailed abstract provided for this node.'}
                    </div>

                    <div className="v-label">SYSTEM UID</div>
                    <div className="v-val" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{category._id}</div>
                </div>
            )
        });
    };

    const handleDelete = (category) => {
        MySwal.fire({
            title: 'Delete Category?',
            text: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Confirm Disposal',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('admin_token');
                    await API.delete(`/admin/categories/${category._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    fetchCategories();
                    MySwal.fire({ icon: 'info', title: 'Disposed', text: 'Category has been permanently removed.', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
                } catch (err) {
                    MySwal.fire({
                        icon: 'error',
                        title: 'Delete Failed',
                        text: err.response?.data?.message || 'Something went wrong',
                    });
                }
            }
        });
    };

    return (
        <div className="admin-categories-page">
            <div className="admin-panel fade-in">
                <div className="panel-header">
                    <div className="header-left">
                        <h3>Organize Collections</h3>
                        <span className="count-pill">{categories.length} Collections</span>
                    </div>
                    <button className="btn-primary highlight-btn" onClick={() => handleOpenForm()}>
                        <Plus size={18} /> New Collection
                    </button>
                </div>

                <div className="admin-filters-bar mt-20">
                    <div className="search-wrapper modern">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Filter by collection label..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="admin-loading-state">
                        <Loader2 className="animate-spin" size={40} />
                        <p>Synchronizing inventory data...</p>
                    </div>
                ) : (
                    <div className="table-responsive mt-30">
                        <table className="admin-table luxury-table">
                            <thead>
                                <tr>
                                    <th>Collection Name</th>
                                    <th>Description</th>
                                    <th>Global Status</th>
                                    <th>Management Controls</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCategories.length > 0 ? (
                                    filteredCategories.map(cat => (
                                        <tr key={cat._id}>
                                            <td className="cat-label-cell">
                                                <div className="label-wrapper">
                                                    <div className="color-indicator" style={{ background: '#3b82f6' }}></div>
                                                    <div className="label-info">
                                                        <span className="cat-name">{cat.name}</span>
                                                        <span className="cat-sys-id">UID: {cat._id.slice(-6).toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="cat-desc-cell">{cat.description}</td>
                                            <td>
                                                <span className={`status-pill ${cat.status}`}>
                                                    {cat.status === 'active' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                                    {cat.status.charAt(0).toUpperCase() + cat.status.slice(1)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="category-actions">
                                                    <button className="btn-action view" onClick={() => handleView(cat)} title="Inspect Collection">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button className="btn-action edit" onClick={() => handleOpenForm(cat)} title="Edit Node">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="btn-action delete" onClick={() => handleDelete(cat)}>
                                                        <Trash2 size={16} /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="empty-results-cell">
                                            <div className="no-cat-found">
                                                <Tag size={40} />
                                                <p>No matching labels found in your inventory system.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
                .admin-categories-page { padding: 0; }
                .count-pill {
                    background: #fdf2f8; color: #db2777; padding: 5px 15px; border-radius: 50px;
                    font-size: 0.75rem; font-weight: 800; margin-left: 15px; border: 1px solid #fbcfe8;
                }
                .highlight-btn { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border: none; }
                .admin-filters-bar { display: flex; align-items: center; justify-content: space-between; }
                .search-wrapper.modern { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; width: 350px; display: flex; align-items: center; padding: 0 15px; }
                .search-wrapper input { border: none; background: transparent; padding: 12px 10px; outline: none; width: 100%; font-size: 0.95rem; }
                .cat-label-cell { min-width: 250px; }
                .label-wrapper { display: flex; align-items: center; gap: 15px; }
                .color-indicator { width: 12px; height: 12px; border-radius: 4px; }
                .cat-name { display: block; font-weight: 700; color: #1e293b; font-size: 1rem; }
                .cat-sys-id { font-size: 0.75rem; color: #94a3b8; font-weight: 500; }
                .cat-desc-cell { max-width: 300px; color: #64748b; font-style: italic; font-size: 0.9rem; }
                .status-pill { padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 6px; width: fit-content; text-transform: capitalize; }
                .status-pill.active { background: #dcfce7; color: #15803d; }
                .status-pill.inactive { background: #f1f5f9; color: #475569; }
                .category-actions { display: flex; gap: 8px; }
                .btn-action { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: 0.2s; }
                .btn-action.view { background: #eff6ff; color: #3b82f6; }
                .btn-action.view:hover { background: #3b82f6; color: white; transform: translateY(-3px); }
                .btn-action.edit { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }
                .btn-action.edit:hover { background: #1e293b; color: white; transform: translateY(-3px); border-color: #1e293b; }
                .btn-action.delete { background: #fff1f2; color: #e11d48; }
                .btn-action.delete:hover { background: #ef4444; color: white; transform: translateY(-3px); }

                .v-label { font-size: 0.7rem; font-weight: 800; color: #94a3b8; letter-spacing: 1px; margin-bottom: 5px; text-transform: uppercase; }
                .v-val { font-size: 1rem; font-weight: 700; color: #1e293b; margin-bottom: 15px; }
                .empty-results-cell { padding: 60px 0 !important; }
                .no-cat-found { display: flex; flex-direction: column; align-items: center; color: #94a3b8; gap: 15px; }
                .admin-loading-state { display: flex; flex-direction: column; align-items: center; padding: 100px 0; color: #2d5a8e; font-weight: 600; gap: 15px; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }

                /* Category Popup Redesign */
                .category-popup-redesign { text-align: left !important; font-family: 'Inter', sans-serif; }
                .b-sec-head-blue { font-size: 0.9rem; font-weight: 800; color: #1e293b; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }
                .swal-input-group { margin-bottom: 15px; }
                .input-with-icon { position: relative; width: 100%; display: flex; align-items: center; }
                .field-icon { position: absolute; left: 15px; color: #94a3b8; pointer-events: none; transition: color 0.3s; z-index: 10; }
                .swal2-input, .swal2-select, .swal2-textarea { 
                    margin: 0 !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    box-sizing: border-box !important;
                    padding-left: 45px !important; 
                    padding-right: 15px !important;
                    height: 48px !important;
                    border-radius: 10px !important; 
                    background: #f8fafc !important; 
                    border: 1px solid #e2e8f0 !important; 
                    transition: all 0.3s !important;
                    font-size: 0.9rem !important;
                    color: #1e293b !important;
                    text-align: left !important;
                    box-shadow: none !important;
                }
                .swal2-input:focus, .swal2-select:focus, .swal2-textarea:focus {
                    border-color: #3b82f6 !important;
                    background: white !important;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
                }
                .input-with-icon:focus-within .field-icon { color: #3b82f6; }
                .swal2-textarea.compact { padding: 15px 20px !important; border-radius: 12px !important; height: 100px !important; resize: none; }
                .swal-input-group label { 
                    font-size: 0.7rem !important; 
                    font-weight: 800 !important; 
                    color: #64748b !important; 
                    margin-bottom: 8px !important; 
                    display: block; 
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                /* EXTREME RADIUS OVERRIDES */
                .v-extreme-swal-blue { 
                    border-radius: 35px !important; 
                }
                .b-swal-confirm-btn-blue {
                    border-radius: 50px !important;
                    padding: 12px 35px !important;
                }
                .b-swal-cancel-btn-blue {
                    border-radius: 50px !important;
                    padding: 12px 25px !important;
                }
            `}</style>
        </div>
    );
};

export default AdminCategories;
