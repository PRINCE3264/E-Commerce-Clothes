import React, { useState, useEffect, useMemo } from 'react';
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    Eye,
    Image as ImageIcon,
    Filter,
    ArrowUpDown,
    Package,
    IndianRupee,
    Flame,
    Zap,
    Tag,
    Upload,
    Star
} from 'lucide-react';
import API from '../../utils/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const AdminProducts = () => {
    // State management
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [dbCategories, setDbCategories] = useState([]);

    const getColorName = (val) => {
        if (!val) return '';
        if (val.includes(':')) return val.split(':')[0].trim();
        
        const lowerVal = val.toLowerCase().trim();
        const colorMap = {
            '#2d6acd': 'Ocean Blue',
            '#ff0000': 'Red',
            '#0000ff': 'Blue',
            '#00ff00': 'Green',
            '#000000': 'Black',
            '#ffffff': 'White',
            '#f59e0b': 'Amber',
            '#ef4444': 'Red',
            '#3b82f6': 'Blue',
            '#10b981': 'Green',
            '#6366f1': 'Indigo',
            '#a855f7': 'Purple',
            '#71717a': 'Grey',
            '#000': 'Black',
            '#fff': 'White'
        };
        return colorMap[lowerVal] || val;
    };

    const getColorCode = (val) => {
        if (!val) return 'transparent';
        if (val.includes(':')) return val.split(':')[1].trim();
        return val.toLowerCase().trim();
    };

    // Fetch Data from API
    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const headers = { Authorization: `Bearer ${token}` };

            const [prodRes, catRes] = await Promise.all([
                API.get('/admin/products', { headers }),
                API.get('/admin/categories', { headers })
            ]);

            if (prodRes.data.success) setProducts(prodRes.data.data);
            if (catRes.data.success) setDbCategories(catRes.data.data);
        } catch (err) {
            console.error("Failed to fetch admin data", err);
            MySwal.fire({
                icon: 'error',
                title: 'Sync Failed',
                text: 'Could not connect to the database engine.',
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
        fetchData();
    }, []);

    // Categories for filtering
    const categories = useMemo(() => {
        const catNames = dbCategories.map(c => c.name);
        return ['All', ...new Set(catNames)];
    }, [dbCategories]);

    // Filtering and Sorting
    const filteredProducts = useMemo(() => {
        return products
            .filter(p => {
                const name = p.name || p.title || '';
                const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
                return matchesSearch && matchesCategory;
            })
            .sort((a, b) => {
                let comparison = 0;
                const nameA = a.name || a.title || '';
                const nameB = b.name || b.title || '';
                
                if (sortBy === 'price') comparison = a.price - b.price;
                else if (sortBy === 'stock') comparison = (a.stock || 0) - (b.stock || 0);
                else comparison = nameA.localeCompare(nameB);
                
                return sortOrder === 'asc' ? comparison : -comparison;
            });
    }, [products, searchTerm, filterCategory, sortBy, sortOrder]);

    const handleOpenForm = async (product = null) => {
        const isEdit = !!product;
        
        const result = await MySwal.fire({
            title: isEdit ? 'Update Asset: ' + (product.name || product.title) : 'Initialize New Product Node',
            width: '1000px',
            padding: '1.5rem 2rem',
            background: '#ffffff',
            showCancelButton: true,
            confirmButtonText: isEdit ? 'Commit Changes' : 'Propagate to Store',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#f8fafc',
            cancelButtonText: 'Discard',
            allowOutsideClick: false,
            allowEscapeKey: false,
            buttonsStyling: false,
            customClass: {
                popup: 'v-extreme-swal-blue',
                confirmButton: 'b-swal-confirm-btn-blue',
                cancelButton: 'b-swal-cancel-btn-blue'
            },
            html: (
                <div className="b-advanced-layout-blue product-popup-redesign">
                    <div className="b-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        {/* Section 1: Specifications */}
                        <div className="b-swal-sec">
                            <div className="b-sec-head-blue"><Package size={14}/> 1. Inventory Specs</div>
                            <div className="swal-input-group">
                                <label>Protocol Label (Name)</label>
                                <div className="input-with-icon">
                                    <Package size={16} className="field-icon" />
                                    <input id="swal-name" className="swal2-input" defaultValue={product?.name || product?.title || ''} placeholder="SKU Title..." />
                                </div>
                            </div>
                            <div className="swal-input-group">
                                <label>Classification</label>
                                <div className="input-with-icon">
                                    <Filter size={16} className="field-icon" />
                                    <select id="swal-category" className="swal2-select" defaultValue={product?.category || ''}>
                                        <option value="" disabled>Select Classification</option>
                                        {dbCategories.map(cat => (
                                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                                        ))}
                                        {/* Fallback for legacy categories not in DB */}
                                        {product?.category && !dbCategories.some(c => c.name === product.category) && (
                                            <option value={product.category}>{product.category} (Legacy)</option>
                                        )}
                                    </select>
                                </div>
                            </div>
                            <div className="v-stat-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="swal-input-group">
                                    <label>Sale Price (₹)</label>
                                    <div className="input-with-icon">
                                        <IndianRupee size={16} className="field-icon" />
                                        <input id="swal-price" type="number" className="swal2-input" defaultValue={product?.price || ''} placeholder="0.00" />
                                    </div>
                                </div>
                                <div className="swal-input-group">
                                    <label>Old Price / MRP (₹)</label>
                                    <div className="input-with-icon">
                                        <IndianRupee size={16} className="field-icon" />
                                        <input id="swal-old-price" type="number" className="swal2-input" defaultValue={product?.oldPrice || ''} placeholder="0.00 (Optional)" />
                                    </div>
                                </div>
                            </div>
                            <div className="swal-input-group" style={{ marginTop: '15px' }}>
                                <label>Inventory Status</label>
                                <div className="input-with-icon">
                                    <ArrowUpDown size={16} className="field-icon" />
                                    <select id="swal-stock" className="swal2-select" defaultValue={product?.stock > 0 ? (product.stock === 100 ? '100' : '50') : '0'}>
                                        <option value="50">In Stock (Standard)</option>
                                        <option value="100">High Volume (100)</option>
                                        <option value="0">Out of Stock (0)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="swal-input-group">
                                <label>Product Abstract</label>
                                <textarea id="swal-desc" className="swal2-textarea compact" defaultValue={product?.description || ''} placeholder="Architectural details of the garment..." style={{ height: '100px', borderRadius: '15px' }}></textarea>
                            </div>
                            <div className="swal-input-group" style={{ marginTop: '10px' }}>
                                <label>Manual Rating (0-5)</label>
                                <div className="input-with-icon">
                                    <Star size={16} className="field-icon" />
                                    <input id="swal-rating" type="number" step="0.1" min="0" max="5" className="swal2-input" defaultValue={product?.rating || 0} placeholder="5.0" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Technicals */}
                        <div className="b-swal-sec no-border">
                            <div className="b-sec-head-blue"><ImageIcon size={14}/> 2. Metadata & Media</div>
                            <div className="swal-input-group">
                                <label>Source CDN (Image URL)</label>
                                <div className="input-with-icon">
                                    <ImageIcon size={16} className="field-icon" />
                                    <input id="swal-image" className="swal2-input" defaultValue={product?.image || ''} placeholder="https://..." onInput={(e) => {
                                        const previewImg = document.getElementById('swal-p-preview');
                                        if(previewImg) previewImg.src = e.target.value || 'https://placehold.co/150x150?text=No+Preview';
                                    }} />
                                </div>
                            </div>
                            <div className="swal-input-group b-upload-zone-mini">
                                <label>Or Upload Product Image</label>
                                <div className="b-file-selector-wrapper">
                                    <input 
                                        type="file" 
                                        id="swal-product-file" 
                                        accept="image/*" 
                                        style={{ display: 'none' }} 
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;

                                            const formData = new FormData();
                                            formData.append('image', file);
                                            
                                            const previewImg = document.getElementById('swal-p-preview');
                                            const statusText = document.getElementById('swal-upload-status');
                                            if(statusText) statusText.innerText = "Processing upload...";

                                            try {
                                                const res = await API.post('/upload', formData, {
                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                });
                                                if(res.data.success) {
                                                    const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
                                                    const serverBase = apiBase.split('/api')[0];
                                                    const imgPath = `${serverBase}${res.data.path}`;
                                                    document.getElementById('swal-image').value = imgPath;
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
                                        onClick={() => document.getElementById('swal-product-file').click()}
                                    >
                                        <Upload size={16} /> Choose File
                                    </button>
                                    <span id="swal-upload-status" className="b-upload-status">No file chosen</span>
                                </div>
                            </div>
                            <div className="b-iris-viewport mt-10" style={{ height: '160px', borderRadius: '20px', overflow: 'hidden', border: '2px dashed #e2e8f0' }}>
                                <img id="swal-p-preview" src={product?.image || 'https://via.placeholder.com/150?text=No+Preview'} alt="Live Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <div className="v-stat-row mt-10" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="swal-input-group">
                                    <label>Dimensions (Sizes)</label>
                                    <input id="swal-size" className="swal2-input no-ico" defaultValue={Array.isArray(product?.size) ? product.size.join(', ') : (product?.size || 'S, M, L, XL')} placeholder="S, M, L..." style={{ paddingLeft: '15px' }} />
                                </div>
                                <div className="swal-input-group">
                                    <label>Palette (Label:Hex, e.g. Red:#FF0000)</label>
                                    <input id="swal-color" className="swal2-input no-ico" defaultValue={Array.isArray(product?.color) ? product.color.join(', ') : (product?.color || 'Blue, White, Black')} placeholder="Red:#FF0000, Blue:#0000FF..." style={{ paddingLeft: '15px' }} />
                                </div>
                            </div>
                            <div className="v-stat-row mt-10" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="swal-input-group">
                                    <label style={{color: '#ef4444'}}>Out of Stock Sizes</label>
                                    <input id="swal-out-size" className="swal2-input no-ico" defaultValue={Array.isArray(product?.outOfStockSizes) ? product.outOfStockSizes.join(', ') : ''} placeholder="S, XL..." style={{ paddingLeft: '15px', borderColor: '#fecaca' }} />
                                </div>
                                <div className="swal-input-group">
                                    <label style={{color: '#ef4444'}}>Out of Stock Colors</label>
                                    <input id="swal-out-color" className="swal2-input no-ico" defaultValue={Array.isArray(product?.outOfStockColors) ? product.outOfStockColors.join(', ') : ''} placeholder="Red, Green..." style={{ paddingLeft: '15px', borderColor: '#fecaca' }} />
                                </div>
                            </div>
                            <div className="compliance-note" style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '10px' }}>
                                * Separate sizes and colors with commas for internal array mapping.
                            </div>

                            <div className="b-sec-head-blue mt-20"><Tag size={14}/> 3. Promotional Toggles</div>
                            <div className="v-stat-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="promo-check-card" style={{ padding: '15px', background: '#f8fafc', borderRadius: '15px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <input type="checkbox" id="swal-new-arrival" defaultChecked={product?.isNewArrival || false} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                                    <label htmlFor="swal-new-arrival" style={{ margin: 0, fontWeight: '800', color: '#1e293b', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Zap size={14} color="#3b82f6" fill="#3b82f6"/> New Arrival
                                    </label>
                                </div>
                                <div className="promo-check-card" style={{ padding: '15px', background: '#f8fafc', borderRadius: '15px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <input type="checkbox" id="swal-best-seller" defaultChecked={product?.isBestSeller || false} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                                    <label htmlFor="swal-best-seller" style={{ margin: 0, fontWeight: '800', color: '#1e293b', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Flame size={14} color="#ef4444" fill="#ef4444"/> Best Seller
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
            preConfirm: () => {
                const name = document.getElementById('swal-name').value;
                const category = document.getElementById('swal-category').value;
                const price = document.getElementById('swal-price').value;
                const oldPrice = document.getElementById('swal-old-price').value;
                const stock = document.getElementById('swal-stock').value;
                const image = document.getElementById('swal-image').value;
                const description = document.getElementById('swal-desc').value;
                const sizeRaw = document.getElementById('swal-size').value;
                const colorRaw = document.getElementById('swal-color').value;
                const isNewArrival = document.getElementById('swal-new-arrival').checked;
                const isBestSeller = document.getElementById('swal-best-seller').checked;
                const rating = document.getElementById('swal-rating').value;

                if (!name || !category || !price) {
                    Swal.showValidationMessage('Product Name, Category and Sale Price are required');
                    return false;
                }

                return {
                    name, 
                    category, 
                    price: parseFloat(price), 
                    oldPrice: oldPrice ? parseFloat(oldPrice) : null,
                    stock: parseInt(stock), 
                    image, 
                    description,
                    rating: parseFloat(rating) || 0,
                    size: sizeRaw.split(',').map(s => s.trim()).filter(s => s !== ''),
                    color: colorRaw.split(',').map(c => c.trim()).filter(c => c !== ''),
                    outOfStockSizes: document.getElementById('swal-out-size').value.split(',').map(s => s.trim()).filter(s => s !== ''),
                    outOfStockColors: document.getElementById('swal-out-color').value.split(',').map(c => c.trim()).filter(c => c !== ''),
                    isNewArrival,
                    isBestSeller,
                    badge: (oldPrice && parseFloat(oldPrice) > parseFloat(price)) ? `${Math.round(((parseFloat(oldPrice) - parseFloat(price)) / parseFloat(oldPrice)) * 100)}%` : null
                };
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
                const token = localStorage.getItem('admin_token');
                const headers = { Authorization: `Bearer ${token}` };
                let res;

                if (isEdit) {
                    res = await API.put(`/admin/products/${product._id}`, formValues, { headers });
                } else {
                    res = await API.post('/admin/products', formValues, { headers });
                }

                if (res.data.success) {
                    fetchData();
                    MySwal.fire({
                        icon: 'success',
                        title: isEdit ? 'Inventory Updated' : 'Product Published',
                        text: isEdit ? 'Asset changes have been synchronized.' : 'Product has been added to the store.',
                        timer: 2000,
                        showConfirmButton: false,
                        toast: true,
                        position: 'top-end'
                    });
                }
            } catch (err) {
                MySwal.fire({
                    icon: 'error',
                    title: 'Database Error',
                    text: err.response?.data?.message || 'Failed to propagate changes to store.',
                });
            }
        }
    };

    const handleDelete = (product) => {
        MySwal.fire({
            title: 'Are you sure?',
            text: `You are about to delete "${product.name || product.title}". This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#e2e8f0',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Discard',
            reverseButtons: true,
            customClass: {
                popup: 'delete-swal-popup',
                confirmButton: 'premium-delete-btn'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('admin_token');
                    const res = await API.delete(`/admin/products/${product._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (res.data.success) {
                        fetchData();
                        MySwal.fire({
                            icon: 'success',
                            title: 'Deleted!',
                            text: 'Your product has been removed from the database.',
                            timer: 2000,
                            showConfirmButton: false,
                            toast: true,
                            position: 'top-end'
                        });
                    }
                } catch (err) {
                    MySwal.fire({
                        icon: 'error',
                        title: 'Deletion Failed',
                        text: err.response?.data?.message || 'Could not remove product.',
                    });
                }
            }
        });
    };

    const handleView = (product) => {
        Swal.fire({
            title: product.name || product.title,
            width: '800px',
            padding: '2rem',
            background: '#ffffff',
            customClass: {
                popup: 'v-extreme-swal-blue',
                confirmButton: 'b-swal-confirm-btn-blue'
            },
            confirmButtonText: 'Understood',
            html: `
                <div class="view-product-details">
                    <div class="view-grid">
                        <div class="view-img">
                            <img src="${product.image || 'https://via.placeholder.com/150'}" alt="${product.name}" />
                        </div>
                        <div class="view-info">
                            <div class="v-label">CATEGORY</div>
                            <div class="v-val">${product.category}</div>
                            
                            <div class="v-label">VALUATION</div>
                            <div class="v-val">₹${product.price ? parseFloat(product.price).toLocaleString() : '0'}</div>
                            
                             <div class="v-label">AVAILABILITY</div>
                            <div class="v-val">${product.stock || 50} Units in Core</div>

                            ${product.oldPrice && product.oldPrice > product.price ? `
                                <div class="v-label">OFFER SCALE</div>
                                <div class="v-val" style="color: #16a34a; background: #f0fdf4; padding: 4px 10px; border-radius: 8px; border: 1px solid #dcfce7; width: fit-content; font-size: 0.9rem;">${Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF Applied</div>
                            ` : ''}

                            <div class="v-label">PRODUCT RATING</div>
                            <div class="v-val" style="display: flex; align-items: center; gap: 8px;">
                                <span style="background: #fffbeb; color: #b45309; padding: 4px 10px; border-radius: 8px; font-weight: 800; border: 1px solid #fef3c7; display: flex; align-items: center; gap: 5px;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#b45309" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                    ${product.rating || '0.0'}
                                </span>
                                <span style="color: #94a3b8; font-size: 0.8rem; font-weight: 600;">(${product.numReviews || 0} Reviews)</span>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                                <div>
                                    <div class="v-label" style="color: #ef4444;">OUT OF STOCK SIZES</div>
                                    <div class="v-val" style="font-size: 0.9rem;">${product.outOfStockSizes?.length > 0 ? product.outOfStockSizes.join(', ') : 'None'}</div>
                                </div>
                                <div>
                                    <div class="v-label" style="color: #ef4444;">OUT OF STOCK COLORS</div>
                                    <div class="v-val" style="font-size: 0.9rem;">${product.outOfStockColors?.length > 0 ? product.outOfStockColors.join(', ') : 'None'}</div>
                                </div>
                            </div>

                            <div class="v-label">AVAILABILITY MATRIX</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
                                ${product.color?.map(c => `
                                    <div style="display: flex; align-items: center; gap: 6px; background: #f8fafc; padding: 4px 10px; border-radius: 50px; border: 1px solid #e2e8f0;">
                                        <span style="width: 12px; height: 12px; border-radius: 50%; background: ${getColorCode(c)}; border: 1px solid #ddd;"></span>
                                        <span style="font-size: 0.75rem; font-weight: 700; color: #475569;">${getColorName(c)}</span>
                                    </div>
                                `).join('') || '<span class="v-val" style="font-size: 0.9rem;">None</span>'}
                            </div>
                            
                            <div class="v-label">ABSTRACT</div>
                            <div class="v-val desc" style="font-size: 0.85rem;">${product.description || 'No detailed blueprint available.'}</div>
                            
                            <div class="v-badges" style="display: flex; gap: 10px; margin-top: 10px;">
                                ${product.isNewArrival ? '<span class="p-badge arrival">NEW ARRIVAL</span>' : ''}
                                ${product.isBestSeller ? '<span class="p-badge arrival" style="background: #fee2e2; color: #ef4444; border-color: #fecaca;">BEST SELLER</span>' : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `
        });
    };

    const toggleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    return (
        <div className="admin-products-container">
            <div className="admin-panel fade-in">
                <div className="panel-header">
                    <div className="header-left">
                        <h3>Inventory Management</h3>
                        <span className="count-badge">{filteredProducts.length} Products</span>
                    </div>
                    <button className="btn-primary" onClick={() => handleOpenForm()}>
                        <Plus size={18} /> Add New Entry
                    </button>
                </div>

                {/* Filters Row */}
                <div className="admin-filters-bar mt-20">
                    <div className="admin-product-search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Find products by name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <div className="select-wrapper">
                            <Filter size={16} className="filter-icon" />
                            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="table-responsive mt-20">
                    {loading ? (
                        <div className="admin-loading-state">
                            <Package className="animate-spin" size={40} />
                            <p>Connecting to Inventory Hub...</p>
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Item Details</th>
                                    <th onClick={() => toggleSort('category')} style={{cursor: 'pointer'}}>
                                        Category <ArrowUpDown size={14} />
                                    </th>
                                    <th onClick={() => toggleSort('price')} style={{cursor: 'pointer'}}>
                                        Price <ArrowUpDown size={14} />
                                    </th>
                                     <th onClick={() => toggleSort('stock')} style={{cursor: 'pointer'}}>
                                        Stock <ArrowUpDown size={14} />
                                    </th>
                                    <th>Discount</th>
                                    <th>Rating</th>
                                    <th>Status</th>
                                    <th>Control</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map(product => (
                                        <tr key={product._id}>
                                            <td className="product-cell">
                                                <div className="product-info-compact">
                                                    <div className="p-img">
                                                        {product.image ? (
                                                            <img src={product.image} alt={product.name || product.title} />
                                                        ) : (
                                                            <ImageIcon size={20} color="#cbd5e1" />
                                                        )}
                                                    </div>
                                                    <div className="p-text">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span className="p-name">{product.name || product.title}</span>
                                                            {product.isNewArrival && <Zap size={12} color="#3b82f6" fill="#3b82f6" title="New Arrival" />}
                                                            {product.isBestSeller && <Flame size={12} color="#ef4444" fill="#ef4444" title="Best Seller" />}
                                                        </div>
                                                        <div className="p-meta-mini">
                                                            {product.size && product.size.length > 0 && <span className="mini-pill size">{product.size.length} sizes</span>}
                                                            {product.color && product.color.length > 0 && (
                                                                <div className="admin-table-color-dots">
                                                                    {product.color.slice(0, 4).map(c => (
                                                                        <span key={c} className="table-dot" style={{ background: getColorCode(c) }} title={getColorName(c)}></span>
                                                                    ))}
                                                                    {product.color.length > 4 && <span className="more-count">+{product.color.length - 4}</span>}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{product.category}</td>
                                            <td className="p-price"><IndianRupee size={12} style={{marginRight: '2px'}} />{parseFloat(product.price).toLocaleString()}</td>
                                            <td>{product.stock || 50}</td>
                                            <td>
                                                {product.oldPrice && product.oldPrice > product.price ? (
                                                    <span className="p-badge arrival" style={{ background: '#f0fdf4', color: '#16a34a', borderColor: '#dcfce7' }}>
                                                        {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                                                    </span>
                                                ) : <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>None</span>}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#fffbeb', color: '#b45309', padding: '4px 8px', borderRadius: '8px', border: '1px solid #fef3c7', fontWeight: '800', width: 'fit-content' }}>
                                                    <Star size={12} fill="#b45309" />
                                                    {product.rating ? product.rating.toFixed(1) : '0.0'}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${(product.stock || 50) > 0 ? 'status-completed' : 'status-pending'}`}>
                                                    {(product.stock || 50) > 0 ? 'Regular' : 'Stock Out'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-btns">
                                                    <button className="btn-icon-circle view" onClick={() => handleView(product)} title="View Specs">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button className="btn-icon-circle edit" onClick={() => handleOpenForm(product)} title="Edit Node">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="btn-icon-circle delete" onClick={() => handleDelete(product)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="empty-table-msg">
                                            <div className="no-data">
                                                <Package size={40} />
                                                <p>Searching for items? No matches found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <style>{`
                /* Advanced Blue Product Swal Pop CSS */
                .v-extreme-swal-blue { border-radius: 20px !important; overflow: hidden !important; }
                .swal2-show.v-extreme-swal-blue { animation: b-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important; }
                @keyframes b-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                .b-advanced-layout-blue { text-align: left; padding: 25px; }
                .b-form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
                .b-swal-sec { padding: 0 20px; border-right: 1px solid #f1f5f9; }
                .b-swal-sec.no-border { border-right: none; }
                .b-sec-head-blue { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #3b82f6; margin-bottom: 20px; border-bottom: 2px solid #eff6ff; padding-bottom: 8px; display: flex; align-items: center; gap: 8px; letter-spacing: 0.5px; }
                
                .swal-input-group label { font-size: 0.75rem !important; font-weight: 700 !important; color: #64748b !important; margin-bottom: 4px !important; display: block; }
                .swal2-input, .swal2-select, .swal2-textarea { height: 38px !important; font-size: 0.85rem !important; margin: 0 0 12px 0 !important; border-radius: 8px !important; background-color: #fcfdfe !important; border: 1px solid #e2e8f0 !important; transition: border-color 0.2s; width: 100% !important; }
                .swal2-input:focus, .swal2-select:focus, .swal2-textarea:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important; }
                .swal2-textarea.compact { height: 80px !important; padding: 10px !important; line-height: 1.4 !important; }

                .v-stat-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

                .b-iris-viewport { margin-top: 10px; width: 100%; height: 200px; background: #f8fafc; border: 2px dashed #dbeafe; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
                .b-iris-viewport img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
                .b-iris-viewport:hover img { transform: scale(1.05); }
                .b-compliance-text { font-size: 0.65rem; color: #94a3b8; font-weight: 500; margin-top: 15px; text-align: center; line-height: 1.3; }

                .b-swal-confirm-btn-blue { padding: 12px 30px !important; font-size: 0.9rem !important; font-weight: 800 !important; border-radius: 10px !important; background: #3b82f6 !important; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2) !important; }
                .b-swal-cancel-btn-blue { padding: 12px 25px !important; font-size: 0.85rem !important; font-weight: 700 !important; border-radius: 10px !important; color: #64748b !important; }

                /* Dashboard Integration Overrides */
                .admin-products-container { padding: 0; }
                .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
                .header-left h3 { font-size: 1.4rem; font-weight: 900; color: #1e293b; margin: 0; }
                .count-badge { background: #eff6ff; color: #3b82f6; padding: 4px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 800; margin-left: 10px; border: 1px solid #dbeafe; }

                .admin-filters-bar { display: flex; gap: 15px; background: white; padding: 15px; border-radius: 20px; border: 1px solid #f1f5f9; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
                .admin-product-search-wrapper { position: relative; flex: 1; }
                .admin-product-search-wrapper .search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
                .admin-product-search-wrapper input { box-sizing: border-box; width: 100%; padding: 12px 15px 12px 45px; border: 1px solid #f1f5f9; border-radius: 14px; background: #f8fafc; font-weight: 600; outline: none; transition: 0.3s; }
                .admin-product-search-wrapper input:focus { background: white; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05); }

                .select-wrapper { position: relative; min-width: 220px; }
                .filter-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #3b82f6; z-index: 10; }
                .select-wrapper select { box-sizing: border-box; width: 100%; padding: 12px 15px 12px 45px; border: 1px solid #f1f5f9; border-radius: 14px; background: #f8fafc; font-weight: 700; color: #475569; appearance: none; cursor: pointer; }

                /* High Fidelity Table */
                .product-cell { display: flex; align-items: center; gap: 15px; }
                .p-img { width: 48px; height: 48px; border-radius: 12px; overflow: hidden; border: 2px solid #eff6ff; }
                .p-text { display: flex; flex-direction: column; gap: 4px; }
                .p-name { font-weight: 800; color: #1e293b; font-size: 0.95rem; }
                .p-meta-mini { display: flex; gap: 6px; }
                .mini-pill { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.4px; }
                .mini-pill.size { background: #eff6ff; color: #2563eb; }
                .mini-pill.color { background: #fdf2f8; color: #db2777; }
                .p-id { font-size: 0.7rem; color: #94a3b8; font-weight: 600; }

                .p-price { font-weight: 800; color: #1e293b; }
                .status-badge { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 50px; font-size: 0.75rem; font-weight: 800; width: fit-content; }
                .status-badge.status-completed { background: #dcfce7; color: #15803d; }
                .status-badge.status-pending { background: #fee2e2; color: #b91c1c; }
                
                .action-btns { display: flex; gap: 8px; }
                .btn-icon-circle { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: 0.2s; }
                .btn-icon-circle.view { background: #eff6ff; color: #3b82f6; }
                .btn-icon-circle.view:hover { background: #3b82f6; color: white; transform: translateY(-3px); }
                .btn-icon-circle.edit { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }
                .btn-icon-circle.edit:hover { background: #1e293b; color: white; transform: translateY(-3px); border-color: #1e293b; }
                .btn-icon-circle.delete { background: #fff1f2; color: #e11d48; }
                .btn-icon-circle.delete:hover { background: #ef4444; color: white; transform: translateY(-3px); }

                .view-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; text-align: left; }
                .view-img { border-radius: 15px; overflow: hidden; border: 1px solid #f1f5f9; height: 300px; }
                .view-img img { width: 100%; height: 100%; object-fit: cover; }
                .v-label { font-size: 0.7rem; font-weight: 800; color: #94a3b8; letter-spacing: 1px; margin-bottom: 5px; }
                .v-val { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin-bottom: 20px; }
                .v-val.desc { font-size: 0.9rem; font-weight: 500; color: #64748b; line-height: 1.6; }

                /* EXTREME RADIUS & FIELD ICONS */
                .v-extreme-swal-blue { border-radius: 35px !important; }
                .product-popup-redesign { text-align: left !important; }
                .input-with-icon { position: relative; width: 100%; }
                .field-icon { position: absolute; left: 15px; top: 12px; color: #94a3b8; pointer-events: none; transition: 0.3s; z-index: 10; }
                .swal2-input, .swal2-select, .swal2-textarea { 
                    padding-left: 45px !important; 
                    border-radius: 12px !important; 
                    background: #fbfcfe !important; 
                    border: 1px solid #e2e8f0 !important; 
                    transition: all 0.3s !important;
                    font-size: 0.9rem !important;
                }
                .swal2-input.no-ico { padding-left: 15px !important; }
                .swal2-input:focus, .swal2-select:focus, .swal2-textarea:focus {
                    border-color: #3b82f6 !important;
                    background: white !important;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08) !important;
                }
                .input-with-icon:focus-within .field-icon { color: #3b82f6; }
                .swal-input-group label { 
                    font-size: 0.7rem !important; 
                    font-weight: 800 !important; 
                    color: #64748b !important; 
                    margin-bottom: 5px !important; 
                    display: block; 
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .b-swal-confirm-btn-blue { border-radius: 50px !important; }
                .b-swal-cancel-btn-blue { border-radius: 50px !important; }

                /* Badge Styles */
                .p-badge { font-size: 0.65rem; font-weight: 900; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.5px; }
                .p-badge.arrival { background: #eff6ff; color: #3b82f6; border: 1px solid #dbeafe; }
                .p-badge.seller { background: #fee2e2; color: #ef4444; border: 1px solid #fecaca; }
                .mt-20 { margin-top: 20px; }

                /* Advance Upload Styles */
                .b-upload-zone-mini { margin-top: 15px; background: #fdfdfd; padding: 12px; border: 1px dashed #e2e8f0; border-radius: 10px; }
                .b-file-selector-wrapper { display: flex; align-items: center; gap: 12px; margin-top: 8px; }
                .b-btn-upload-trigger { display: flex; align-items: center; gap: 8px; background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 6px 14px; border-radius: 6px; font-weight: 800; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; }
                .b-btn-upload-trigger:hover { background: #dbeafe; }
                .b-upload-status { font-size: 0.7rem; color: #94a3b8; font-weight: 600; }

                /* Responsive Admin Popups */
                @media (max-width: 768px) {
                    .b-form-grid-2 { grid-template-columns: 1fr !important; gap: 15px !important; }
                    .v-stat-row { grid-template-columns: 1fr !important; gap: 10px !important; }
                    .b-swal-sec { border-right: none !important; padding: 0 !important; }
                    .b-advanced-layout-blue { padding: 10px !important; }
                    .view-grid { grid-template-columns: 1fr !important; gap: 15px !important; }
                    .view-img { height: 200px !important; }
                    .admin-filters-bar { flex-direction: column; }
                }
            `}</style>
        </div>
    );
};

export default AdminProducts;
