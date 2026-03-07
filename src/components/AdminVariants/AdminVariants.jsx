import React, { useState, useEffect, useMemo } from 'react';
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    Layers, 
    Box,
    Hash,
    Settings2,
    CheckCircle,
    Info,
    AlertTriangle,
    Tag,
    IndianRupee,
    Palette,
    Maximize,
    Image as ImageIcon,
    Pipette
} from 'lucide-react';
import API from '../../utils/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const AdminVariants = () => {
    // Variants initialization
    const [variants, setVariants] = useState([]);
    const [dbProducts, setDbProducts] = useState([]);
    const [loading, setLoading] = useState(false);

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

    // Fetch Products for the selection dropdown
    useEffect(() => {
        const fetchProds = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('admin_token');
                const res = await API.get('/admin/products', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setDbProducts(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch products for variants", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProds();
    }, []);

    const [searchTerm, setSearchTerm] = useState('');

    // Fetch Variants Data
    const fetchVariants = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await API.get('/variants', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setVariants(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch variants", err);
        }
    };

    useEffect(() => {
        fetchVariants();
    }, []);

    const filteredVariants = useMemo(() => {
        return variants.filter(v => 
            v.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.type.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [variants, searchTerm]);

    const handleOpenForm = async (variant = null) => {
        const isEdit = !!variant;

        const result = await MySwal.fire({
            title: isEdit ? 'Sync Variant Data' : 'Initialize New SKU',
            width: '1000px',
            padding: '2.5rem',
            showCancelButton: true,
            confirmButtonText: isEdit ? 'Apply Updates' : 'Index Variant',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#f8fafc',
            cancelButtonText: 'Discard',
            allowOutsideClick: false,
            allowEscapeKey: false,
            buttonsStyling: false,
            customClass: {
                popup: 'v-extreme-swal-blue',
                confirmButton: 'v-swal-confirm-btn-blue',
                cancelButton: 'v-swal-cancel-btn-blue'
            },
            html: (
                <div className="swal-custom-form v-advanced-layout-blue">
                    <div className="v-form-grid-2">
                        {/* Section 1: Core Configuration */}
                        <div className="v-swal-sec">
                            <div className="v-sec-head-blue"><Box size={16}/> 1. Base Setup</div>
                            <div className="swal-input-group">
                                <label>Target Product</label>
                                <select id="swal-var-product" className="swal2-select" defaultValue={variant?.productId || ''}>
                                    <option value="">Select Base Model...</option>
                                    {dbProducts.map(p => (
                                        <option key={p._id} value={p._id}>{p.name || p.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="swal-input-group">
                                <label>Attribute Category</label>
                                <select id="swal-var-type" className="swal2-select" defaultValue={variant?.type || 'Color'} onChange={(e) => {
                                    const picker = document.getElementById('swal-var-picker');
                                    const valInput = document.getElementById('swal-var-value');
                                    if(e.target.value === 'Color') {
                                        picker.style.display = 'block';
                                        valInput.placeholder = 'e.g. #000000 or Red:#FF0000';
                                    } else {
                                        picker.style.display = 'none';
                                        valInput.placeholder = e.target.value === 'Size' ? 'e.g. S, M, L, XL' : 'e.g. Cotton, Silk';
                                    }
                                }}>
                                    <option value="Color">Color Palette</option>
                                    <option value="Size">Size Scale</option>
                                    <option value="Material">Material Type</option>
                                </select>
                            </div>
                             <div className="swal-input-group">
                                <label>Assigned Value (Code/Label)</label>
                                <div className="v-dual-input">
                                    <input id="swal-var-value" className="swal2-input" defaultValue={variant?.value || ''} placeholder={variant?.type === 'Size' ? 'e.g. S, M, L, XL' : 'e.g. #000000 or Red:#FF0000'} />
                                    <input type="color" id="swal-var-picker" className="v-color-iris" style={{ display: (variant?.type && variant.type !== 'Color') ? 'none' : 'block' }} defaultValue={variant?.type === 'Color' && getColorCode(variant.value).startsWith('#') ? getColorCode(variant.value) : '#3b82f6'} onInput={(e) => {
                                        const currentVal = document.getElementById('swal-var-value').value;
                                        if (currentVal.includes(':')) {
                                            const [label] = currentVal.split(':');
                                            document.getElementById('swal-var-value').value = `${label.trim()}:${e.target.value}`;
                                        } else {
                                            document.getElementById('swal-var-value').value = e.target.value;
                                        }
                                        const preview = document.getElementById('swal-live-iris');
                                        if(preview) preview.style.background = e.target.value;
                                    }} />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Inventory & Logics */}
                        <div className="v-swal-sec no-border">
                            <div className="v-sec-head-blue"><Hash size={16}/> 2. SKU & Logic</div>
                            <div className="swal-input-group">
                                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>SKU Reference ID</span>
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            const prod = document.getElementById('swal-var-product');
                                            const val = document.getElementById('swal-var-value');
                                            const skuInput = document.getElementById('swal-var-sku');
                                            if (prod.value && val.value) {
                                                const prodName = prod.options[prod.selectedIndex].text.substring(0, 3).toUpperCase();
                                                const attrVal = val.value.replace(/[:#]/g, '').substring(0, 4).toUpperCase();
                                                skuInput.value = `${prodName}-${attrVal}-${Math.floor(Math.random() * 1000)}`;
                                            } else {
                                                Swal.fire({
                                                    icon: 'warning',
                                                    title: 'Missing Info',
                                                    text: 'Select Product and Value first to generate SKU',
                                                    toast: true,
                                                    position: 'top-end',
                                                    showConfirmButton: false,
                                                    timer: 2000
                                                });
                                            }
                                        }}
                                        style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.65rem', fontWeight: '800', cursor: 'pointer', padding: '0' }}
                                    >GENERATE SKU</button>
                                </label>
                                <input id="swal-var-sku" className="swal2-input" defaultValue={variant?.sku || ''} placeholder="SKU-GEN-001" />
                            </div>
                            <div className="v-stat-row">
                                <div className="mini-group">
                                    <label>Stock Qty</label>
                                    <input id="swal-var-stock" type="number" className="swal2-input" defaultValue={variant?.stock || 0} />
                                </div>
                                <div className="mini-group">
                                    <label>Extra (₹)</label>
                                    <input id="swal-var-pricemod" type="number" className="swal2-input" defaultValue={variant?.priceMod || 0} />
                                </div>
                            </div>
                            <div className="swal-input-group">
                                <label>Media URI Link</label>
                                <input id="swal-var-image" className="swal2-input" defaultValue={variant?.image || ''} placeholder="Direct image URL..." onInput={(e) => {
                                    const previewImg = document.getElementById('swal-v-preview');
                                    if(previewImg) previewImg.src = e.target.value || 'https://placehold.co/150x150?text=No+Image';
                                }} />
                            </div>
                            <div className="v-iris-preview-viewport mt-10">
                                <img 
                                    id="swal-v-preview" 
                                    src={variant?.image || 'https://placehold.co/150x150?text=No+Image'} 
                                    alt="SKU Preview" 
                                    onError={(e) => { e.target.src = 'https://placehold.co/150x150?text=Invalid+URL'; }}
                                />
                            </div>
                            <div className="swal-input-group">
                                <label>System Status</label>
                                <select id="swal-var-status" className="swal2-select" defaultValue={variant?.status || 'In Stock'}>
                                    <option value="In Stock">Active Asset</option>
                                    <option value="Low Stock">Restock Protocol</option>
                                    <option value="Out of Stock">Hidden / Pending</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            ),
            preConfirm: () => {
                const productId = document.getElementById('swal-var-product').value;
                const sku = document.getElementById('swal-var-sku').value;
                const type = document.getElementById('swal-var-type').value;
                const value = document.getElementById('swal-var-value').value;
                const image = document.getElementById('swal-var-image').value;
                const stock = document.getElementById('swal-var-stock').value;
                const priceMod = document.getElementById('swal-var-pricemod').value;
                const status = document.getElementById('swal-var-status').value;

                if (!productId || !sku || !value) {
                    Swal.showValidationMessage('Product Identity, SKU, and Attribute Value are mandatory.');
                    return false;
                }

                const selectedProduct = dbProducts.find(p => p._id.toString() === productId);

                return {
                    productId: productId,
                    productName: selectedProduct ? (selectedProduct.name || selectedProduct.title) : 'Unknown',
                    sku, type, value, image,
                    stock: parseInt(stock),
                    priceMod: parseFloat(priceMod),
                    status
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
                const config = { headers: { Authorization: `Bearer ${token}` } };
                if (isEdit) {
                    await API.put(`/variants/${variant._id}`, formValues, config);
                    MySwal.fire({ icon: 'success', title: 'Asset Re-indexed', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
                } else {
                    await API.post('/variants', formValues, config);
                    MySwal.fire({ icon: 'success', title: 'New Variant Indexed', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
                }
                fetchVariants();
            } catch (err) {
                console.error(err);
                const errorMsg = err.response?.data?.message || 'Failed to save variant. Ensure SKU is unique.';
                MySwal.fire('Constraint Violation', errorMsg, 'error');
            }
        }
    };

    const handleDelete = (variant) => {
        MySwal.fire({
            title: 'De-index Variant?',
            text: `You are about to remove SKU ${variant.sku}. This will permanently purge inventory history.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#be185d',
            confirmButtonText: 'Purge Item',
            cancelButtonText: 'Discard'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('admin_token');
                    await API.delete(`/variants/${variant._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    fetchVariants();
                    MySwal.fire({ icon: 'success', title: 'Removed', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
                } catch {
                     MySwal.fire('Error', 'Failed to delete variant.', 'error');
                }
            }
        });
    };

    return (
        <div className="admin-variants-expanded">
            <div className="admin-panel fade-in">
                <div className="panel-header">
                    <div className="header-left">
                        <h3>Inventory Attributes & SKUs</h3>
                        <span className="premium-count-pill">{filteredVariants.length} Active SKU</span>
                    </div>
                    <button className="btn-primary v-premium-btn" onClick={() => handleOpenForm()}>
                        <Plus size={18} /> Indexed New Variant
                    </button>
                </div>

                <div className="admin-filters-bar mt-20">
                    <div className="search-wrapper modern wide">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Filter by product name, SKU ref, or attribute..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="v-status-legend">
                        <Pipette size={14} />
                        <span>Dynamic Live Color Calibration</span>
                    </div>
                </div>

                <div className="table-responsive mt-30">
                    {loading ? (
                        <div className="v-loading-overlay">
                            <Plus className="animate-spin" size={30} />
                            <p>Querying SKU Index...</p>
                        </div>
                    ) : (
                    <table className="admin-table v-supreme-table">
                        <thead>
                            <tr>
                                <th>Visual SDK</th>
                                <th>Parent Target</th>
                                <th>SKU Index</th>
                                <th>Attr Type</th>
                                <th>Calibration</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Surcharge</th>
                                <th>Control</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVariants.length > 0 ? (
                                filteredVariants.map(variant => (
                                    <tr key={variant._id}>
                                        <td>
                                            <div className="v-asset-thumb">
                                                <img 
                                                    src={variant.image || 'https://placehold.co/150x150?text=No+Img'} 
                                                    alt="" 
                                                    onError={(e) => { e.target.src = 'https://placehold.co/150x150?text=No+Img'; }}
                                                    style={{ display: variant.image ? 'block' : 'none' }}
                                                />
                                                {!variant.image && <ImageIcon size={18} color="#cbd5e1" />}
                                            </div>
                                        </td>
                                        <td className="v-p-ref">
                                            <span className="v-p-name">{variant.productName}</span>
                                            <span className="v-p-id">ID: {variant.productId}</span>
                                        </td>
                                        <td><span className="v-sku-tag">{variant.sku}</span></td>
                                        <td>
                                            <span className="v-type-badge">
                                                {variant.type === 'Color' ? <Palette size={12}/> : <Maximize size={12}/>}
                                                {variant.type}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="v-calib-data">
                                                {variant.type === 'Color' ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div className="v-chip" style={{ background: getColorCode(variant.value) }}></div>
                                                        <span className="v-label-p">{getColorName(variant.value)}</span>
                                                    </div>
                                                ) : (
                                                    <span className="v-label-p">{variant.value}</span>
                                                )}
                                                <span className="v-val-text" style={{ fontSize: '0.7rem' }}>{variant.value}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={`v-stock-gauge ${variant.stock < 10 ? 'critical' : ''}`}>
                                                <div className="gauge-bar" style={{ width: `${Math.min(100, (variant.stock / 50) * 100)}%` }}></div>
                                                <span className="v-qnt">{variant.stock} <small>UNIT</small></span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`v-status-pill ${variant.status?.toLowerCase().replace(/\s+/g, '-') || 'in-stock'} ${variant.stock <= 0 ? 'out-of-stock' : ''}`}>
                                                {variant.stock <= 0 ? 'Sold Out' : (variant.status || 'In Stock')}
                                            </span>
                                        </td>
                                        <td className="v-price-mod">
                                            <span className={`mod-pill ${variant.priceMod > 0 ? 'inc' : ''}`}>
                                                {variant.priceMod === 0 ? 'FLAT' : `${variant.priceMod > 0 ? '+' : ''}₹${variant.priceMod}`}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="v-ctrl-btns">
                                                <button className="v-btn-icon edit" onClick={() => handleOpenForm(variant)}><Edit size={16} /></button>
                                                <button className="v-btn-icon del" onClick={() => handleDelete(variant)}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="v-empty-msg">
                                        <Layers size={48} />
                                        <p>No indexed variants matched your calibration filters.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    )}
                </div>
            </div>

            <style>{`
                .admin-variants-expanded { padding: 0; }
                
                .premium-count-pill {
                    background: #eff6ff;
                    color: #2563eb;
                    padding: 4px 14px;
                    border-radius: 50px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    margin-left: 15px;
                    border: 1px solid #dbeafe;
                }

                .v-premium-btn {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    border: none;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
                }

                .v-status-legend {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #eff6ff;
                    color: #2563eb;
                    padding: 8px 16px;
                    border-radius: 10px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    border: 1px solid #dbeafe;
                }

                /* Table SDK Styling */
                .v-asset-thumb {
                    width: 52px;
                    height: 52px;
                    background: #f8fafc;
                    border: 1px solid #f1f5f9;
                    border-radius: 10px;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .v-asset-thumb img { width: 100%; height: 100%; object-fit: cover; }

                .v-p-name { font-weight: 700; color: #1e293b; display: block; }
                .v-p-id { font-size: 0.75rem; color: #94a3b8; font-weight: 500; }

                .v-sku-tag {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.8rem;
                    background: #f1f5f9;
                    color: #475569;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-weight: 700;
                }

                .v-type-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: #3b82f6;
                    text-transform: uppercase;
                }

                .v-calib-data { display: flex; align-items: center; gap: 10px; }
                .v-chip { width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 1px #e2e8f0; }
                .v-label-p { background: #1e293b; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; }
                .v-val-text { font-size: 0.85rem; color: #64748b; font-weight: 500; }

                .v-stock-gauge {
                    width: 85px;
                    height: 14px;
                    background: #f1f5f9;
                    border-radius: 10px;
                    position: relative;
                    overflow: hidden;
                }
                .gauge-bar { height: 100%; background: #3b82f6; transition: width 0.3s; }
                .v-stock-gauge.critical .gauge-bar { background: #f59e0b; }
                .v-qnt { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 0.65rem; font-weight: 800; color: #1e293b; }

                .mod-pill { font-weight: 800; color: #94a3b8; font-size: 0.85rem; }
                .mod-pill.inc { color: #3b82f6; }

                .v-btn-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: #f1f5f9;
                    color: #64748b;
                }
                .v-btn-icon.edit:hover { background: #3b82f6; color: white; }
                .v-btn-icon.del:hover { background: #ef4444; color: white; }

                .v-empty-msg { padding: 100px 0 !important; text-align: center; color: #cbd5e1; }
                .v-empty-msg p { margin-top: 15px; font-weight: 600; }

                /* Advance Blue Swal Pop CSS */
                .v-extreme-swal-blue { border-radius: 20px !important; overflow: hidden !important; animation: v-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes v-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                .v-advanced-layout-blue { text-align: left; }
                .v-form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .v-swal-sec { padding: 0; border-right: none; }
                .v-swal-sec:first-child { padding-right: 20px; border-right: 1px solid #f1f5f9; }
                .v-sec-head-blue { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #3b82f6; margin-bottom: 18px; border-bottom: 2px solid #eff6ff; padding-bottom: 8px; display: flex; align-items: center; gap: 8px; letter-spacing: 0.5px; }
                
                .swal-input-group { margin-bottom: 12px; }
                .swal-input-group label { display: block; font-size: 0.75rem !important; margin-bottom: 4px !important; font-weight: 700; color: #64748b; }
                .swal2-input, .swal2-select { width: 100% !important; box-sizing: border-box !important; height: 38px !important; font-size: 0.85rem !important; margin: 0 !important; border-radius: 8px !important; background-color: #fcfdfe !important; border: 1px solid #e2e8f0 !important; }
                .swal2-input:focus, .swal2-select:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important; outline: none !important; }
                
                .v-dual-input { display: grid; grid-template-columns: 1fr 40px; gap: 8px; align-items: center; }
                .v-color-iris { width: 100%; height: 38px; padding: 0; border: 1px solid #dbeafe; border-radius: 8px; cursor: pointer; margin-bottom: 12px; }
                
                .v-stat-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
                .v-stat-row .mini-group label { display: block; font-size: 0.7rem; font-weight: 700; color: #64748b; margin-bottom: 3px; }

                .v-iris-preview-viewport { margin-top: 10px; width: 100%; height: 160px; background: #f8fafc; border: 2px dashed #dbeafe; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center; position: relative; }
                .v-iris-preview-viewport img { width: 100%; height: 100%; object-fit: contain; }
                .iris-overlay { position: absolute; bottom: 8px; right: 8px; width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; box-shadow: 0 3px 5px rgba(0,0,0,0.1); transition: all 0.3s; }
                .v-compliance-text { font-size: 0.65rem; color: #94a3b8; font-weight: 500; margin-top: 10px; text-align: center; line-height: 1.3; }

                .v-swal-confirm-btn-blue { padding: 10px 25px !important; font-size: 0.9rem !important; font-weight: 800 !important; border-radius: 10px !important; background: #3b82f6 !important; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2) !important; }
                .v-swal-cancel-btn-blue { padding: 10px 25px !important; font-size: 0.85rem !important; font-weight: 700 !important; border-radius: 10px !important; color: #64748b !important; }
            `}</style>
        </div>
    );
};

export default AdminVariants;
