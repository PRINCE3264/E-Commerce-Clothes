import React, { useState, useEffect, useMemo } from 'react';
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    Eye,
    Image as ImageIcon,
    User,
    Briefcase,
    Linkedin,
    Instagram,
    Twitter,
    Upload,
    ArrowUpDown,
    Hash
} from 'lucide-react';
import API from '../../utils/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const AdminTeam = () => {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const headers = { Authorization: `Bearer ${token}` };
            const res = await API.get('/admin/team', { headers });
            if (res.data.success) {
                setTeam(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch team data", err);
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

    const filteredTeam = useMemo(() => {
        return team.filter(member => 
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.role.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }, [team, searchTerm]);

    const handleOpenForm = async (member = null) => {
        const isEdit = !!member;
        
        const result = await MySwal.fire({
            title: isEdit ? 'Update Team Member: ' + member.name : 'Add New Team Member',
            width: '900px',
            padding: '1.5rem 2rem',
            background: '#ffffff',
            showCancelButton: true,
            confirmButtonText: isEdit ? 'Update Member' : 'Add Member',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#f8fafc',
            cancelButtonText: 'Cancel',
            allowOutsideClick: false,
            buttonsStyling: false,
            customClass: {
                popup: 'v-extreme-swal-blue',
                confirmButton: 'b-swal-confirm-btn-blue',
                cancelButton: 'b-swal-cancel-btn-blue'
            },
            html: (
                <div className="b-advanced-layout-blue">
                    <div className="b-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        {/* Section 1: Basic Info */}
                        <div className="b-swal-sec">
                            <div className="b-sec-head-blue"><User size={14}/> 1. Basic Information</div>
                            <div className="swal-input-group">
                                <label>Full Name</label>
                                <div className="input-with-icon">
                                    <User size={16} className="field-icon" />
                                    <input id="swal-name" className="swal2-input" defaultValue={member?.name || ''} placeholder="John Doe" />
                                </div>
                            </div>
                            <div className="swal-input-group">
                                <label>Role / Position</label>
                                <div className="input-with-icon">
                                    <Briefcase size={16} className="field-icon" />
                                    <input id="swal-role" className="swal2-input" defaultValue={member?.role || ''} placeholder="CEO / Manager" />
                                </div>
                            </div>
                            <div className="swal-input-group">
                                <label>Display Order (Priority)</label>
                                <div className="input-with-icon">
                                    <Hash size={16} className="field-icon" />
                                    <input id="swal-order" type="number" className="swal2-input" defaultValue={member?.displayOrder || 0} placeholder="0" />
                                </div>
                            </div>
                            <div className="swal-input-group">
                                <label>Short Bio / Description</label>
                                <textarea id="swal-desc" className="swal2-textarea compact" defaultValue={member?.description || ''} placeholder="Tell us about this member..." style={{ height: '120px', borderRadius: '15px' }}></textarea>
                            </div>
                        </div>

                        {/* Section 2: Media & Socials */}
                        <div className="b-swal-sec no-border">
                            <div className="b-sec-head-blue"><ImageIcon size={14}/> 2. Media & Social Links</div>
                            <div className="swal-input-group">
                                <label>Profile Image URL</label>
                                <div className="input-with-icon">
                                    <ImageIcon size={16} className="field-icon" />
                                    <input id="swal-image" className="swal2-input" defaultValue={member?.image || ''} placeholder="https://..." onInput={(e) => {
                                        const previewImg = document.getElementById('swal-m-preview');
                                        if(previewImg) previewImg.src = e.target.value || 'https://placehold.co/150x150?text=No+Preview';
                                    }} />
                                </div>
                            </div>
                            <div className="swal-input-group b-upload-zone-mini">
                                <label>Or Upload Image</label>
                                <div className="b-file-selector-wrapper">
                                    <input 
                                        type="file" 
                                        id="swal-member-file" 
                                        accept="image/*" 
                                        style={{ display: 'none' }} 
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;
                                            const formData = new FormData();
                                            formData.append('image', file);
                                            const statusText = document.getElementById('swal-upload-status');
                                            if(statusText) statusText.innerText = "Uploading...";
                                            try {
                                                const res = await API.post('/upload', formData, {
                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                });
                                                if(res.data.success) {
                                                    const imgPath = `${API.defaults.baseURL.split('/api')[0]}${res.data.path}`;
                                                    document.getElementById('swal-image').value = imgPath;
                                                    document.getElementById('swal-m-preview').src = imgPath;
                                                    if(statusText) statusText.innerText = "Upload Complete!";
                                                }
                                            } catch (error) {
                                                console.error("Upload failed", error);
                                                if(statusText) statusText.innerText = "Upload Failed";
                                            }
                                        }}
                                    />
                                    <button type="button" className="b-btn-upload-trigger" onClick={() => document.getElementById('swal-member-file').click()}><Upload size={16} /> Choose File</button>
                                    <span id="swal-upload-status" className="b-upload-status" style={{fontSize: '0.7rem', color: '#64748b', marginLeft: '10px'}}>No file chosen</span>
                                </div>
                            </div>
                            <div className="b-iris-viewport mt-10" style={{ height: '120px', borderRadius: '15px', overflow: 'hidden', border: '2px dashed #e2e8f0', display: 'flex', justifyContent: 'center', background: '#f8fafc' }}>
                                <img id="swal-m-preview" src={member?.image || 'https://via.placeholder.com/150?text=Preview'} alt="Preview" style={{ height: '100%', objectFit: 'contain' }} />
                            </div>

                            <div className="social-links-grid mt-10" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div className="swal-input-group">
                                    <label>LinkedIn</label>
                                    <div className="input-with-icon">
                                        <Linkedin size={14} className="field-icon" />
                                        <input id="swal-linkedin" className="swal2-input" defaultValue={member?.socials?.linkedin || ''} placeholder="URL" />
                                    </div>
                                </div>
                                <div className="swal-input-group">
                                    <label>Instagram</label>
                                    <div className="input-with-icon">
                                        <Instagram size={14} className="field-icon" />
                                        <input id="swal-instagram" className="swal2-input" defaultValue={member?.socials?.instagram || ''} placeholder="URL" />
                                    </div>
                                </div>
                                <div className="swal-input-group">
                                    <label>Twitter</label>
                                    <div className="input-with-icon">
                                        <Twitter size={14} className="field-icon" />
                                        <input id="swal-twitter" className="swal2-input" defaultValue={member?.socials?.twitter || ''} placeholder="URL" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
            preConfirm: () => {
                const name = document.getElementById('swal-name').value;
                const role = document.getElementById('swal-role').value;
                const image = document.getElementById('swal-image').value;
                const description = document.getElementById('swal-desc').value;
                const displayOrder = document.getElementById('swal-order').value;
                const linkedin = document.getElementById('swal-linkedin').value;
                const instagram = document.getElementById('swal-instagram').value;
                const twitter = document.getElementById('swal-twitter').value;

                if (!name || !role || !image) {
                    Swal.showValidationMessage('Name, Role and Image are required');
                    return false;
                }

                return {
                    name,
                    role,
                    image,
                    description,
                    displayOrder: parseInt(displayOrder) || 0,
                    socials: {
                        linkedin: linkedin || '#',
                        instagram: instagram || '#',
                        twitter: twitter || '#'
                    }
                };
            }
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('admin_token');
                const headers = { Authorization: `Bearer ${token}` };
                let res;
                if (isEdit) {
                    res = await API.put(`/admin/team/${member._id}`, result.value, { headers });
                } else {
                    res = await API.post('/admin/team', result.value, { headers });
                }

                if (res.data.success) {
                    fetchData();
                    MySwal.fire({
                        icon: 'success',
                        title: isEdit ? 'Member Updated' : 'Member Added',
                        timer: 2000,
                        showConfirmButton: false,
                        toast: true,
                        position: 'top-end'
                    });
                }
            } catch (err) {
                MySwal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: err.response?.data?.message || 'Action failed',
                });
            }
        }
    };

    const handleDelete = (member) => {
        MySwal.fire({
            title: 'Delete Member?',
            text: `Are you sure you want to remove ${member.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, remove',
            cancelButtonText: 'No, keep',
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('admin_token');
                    const res = await API.delete(`/admin/team/${member._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.data.success) {
                        fetchData();
                        MySwal.fire({
                            icon: 'success',
                            title: 'Member Removed',
                            timer: 2000,
                            showConfirmButton: false,
                            toast: true,
                            position: 'top-end'
                        });
                    }
                } catch (err) {
                    MySwal.fire({
                        icon: 'error',
                        title: 'Failed',
                        text: err.response?.data?.message || 'Could not delete member.',
                    });
                }
            }
        });
    };

    const handleView = (member) => {
        Swal.fire({
            title: member.name,
            html: `
                <div style="text-align: left;">
                    <img src="${member.image}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 15px; margin-bottom: 15px;" />
                    <div style="font-weight: 800; color: #3b82f6; margin-bottom: 5px;">${member.role}</div>
                    <p style="color: #64748b;">${member.description}</p>
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        ${member.socials?.linkedin !== '#' ? '<span>LinkedIn</span>' : ''}
                        ${member.socials?.instagram !== '#' ? '<span>Instagram</span>' : ''}
                        ${member.socials?.twitter !== '#' ? '<span>Twitter</span>' : ''}
                    </div>
                </div>
            `,
            confirmButtonText: 'Close'
        });
    };

    return (
        <div className="admin-products-container">
            <div className="admin-panel fade-in">
                <div className="panel-header">
                    <div className="header-left">
                        <h3>Team Management</h3>
                        <span className="count-badge">{filteredTeam.length} Members</span>
                    </div>
                    <button className="btn-primary" onClick={() => handleOpenForm()}>
                        <Plus size={18} /> Add New Member
                    </button>
                </div>

                <div className="admin-filters-bar mt-20">
                    <div className="admin-product-search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search by name or role..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-responsive mt-20">
                    {loading ? (
                        <div className="admin-loading-state">
                            <User className="animate-spin" size={40} />
                            <p>Loading Team Data...</p>
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Member Details</th>
                                    <th>Role</th>
                                    <th>Socials</th>
                                    <th>Controls</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTeam.length > 0 ? (
                                    filteredTeam.map(member => (
                                        <tr key={member._id}>
                                            <td><span className="count-badge">{member.displayOrder}</span></td>
                                            <td className="product-cell">
                                                <div className="product-info-compact">
                                                    <div className="p-img">
                                                        <img src={member.image} alt={member.name} />
                                                    </div>
                                                    <div className="p-text">
                                                        <span className="p-name">{member.name}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className="mini-pill size">{member.role}</span></td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {member.socials?.linkedin !== '#' && <Linkedin size={14} color="#0077b5" />}
                                                    {member.socials?.instagram !== '#' && <Instagram size={14} color="#e4405f" />}
                                                    {member.socials?.twitter !== '#' && <Twitter size={14} color="#1da1f2" />}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="action-btns">
                                                    <button className="btn-icon-circle view" onClick={() => handleView(member)}><Eye size={16} /></button>
                                                    <button className="btn-icon-circle edit" onClick={() => handleOpenForm(member)}><Edit size={16} /></button>
                                                    <button className="btn-icon-circle delete" onClick={() => handleDelete(member)}><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="empty-table-msg">No team members found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminTeam;

/* Styles adapted from the Admin Panel design system */
const adminTeamStyles = `
    .admin-products-container { padding: 0; }
    .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .header-left h3 { font-size: 1.4rem; font-weight: 900; color: #1e293b; margin: 0; }
    .count-badge { background: #eff6ff; color: #3b82f6; padding: 4px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 800; border: 1px solid #dbeafe; }

    .admin-filters-bar { display: flex; gap: 15px; background: white; padding: 15px; border-radius: 20px; border: 1px solid #f1f5f9; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
    .admin-product-search-wrapper { position: relative; flex: 1; }
    .admin-product-search-wrapper .search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
    .admin-product-search-wrapper input { box-sizing: border-box; width: 100%; padding: 12px 15px 12px 45px; border: 1px solid #f1f5f9; border-radius: 14px; background: #f8fafc; font-weight: 600; outline: none; transition: 0.3s; }
    .admin-product-search-wrapper input:focus { background: white; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05); }

    .product-cell { display: flex; align-items: center; gap: 15px; }
    .p-img { width: 48px; height: 48px; border-radius: 12px; overflow: hidden; border: 2px solid #eff6ff; }
    .p-img img { width: 100%; height: 100%; object-fit: cover; }
    .p-text { display: flex; flex-direction: column; gap: 4px; }
    .p-name { font-weight: 800; color: #1e293b; font-size: 0.95rem; }

    .mini-pill { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.4px; }
    .mini-pill.size { background: #eff6ff; color: #2563eb; }

    .action-btns { display: flex; gap: 8px; }
    .btn-icon-circle { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: 0.2s; }
    .btn-icon-circle.view { background: #eff6ff; color: #3b82f6; }
    .btn-icon-circle.view:hover { background: #3b82f6; color: white; transform: translateY(-3px); }
    .btn-icon-circle.edit { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }
    .btn-icon-circle.edit:hover { background: #1e293b; color: white; transform: translateY(-3px); border-color: #1e293b; }
    .btn-icon-circle.delete { background: #fff1f2; color: #e11d48; }
    .btn-icon-circle.delete:hover { background: #ef4444; color: white; transform: translateY(-3px); }

    .btn-primary { 
        display: flex; align-items: center; gap: 8px; 
        background: #3b82f6; color: white; padding: 10px 20px; 
        border: none; border-radius: 14px; font-weight: 700; 
        cursor: pointer; transition: 0.3s;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
    }
    .btn-primary:hover { background: #2563eb; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(59, 130, 246, 0.35); }

    /* Redesigned Swal Inputs */
    .v-extreme-swal-blue { border-radius: 35px !important; overflow: hidden !important; }
    .b-swal-sec { padding: 0 20px; border-right: 1px solid #f1f5f9; }
    .b-swal-sec.no-border { border-right: none; }
    .b-sec-head-blue { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #3b82f6; margin-bottom: 20px; border-bottom: 2px solid #eff6ff; padding-bottom: 8px; display: flex; align-items: center; gap: 8px; letter-spacing: 0.5px; }
    .swal-input-group label { font-size: 0.7rem !important; font-weight: 800 !important; color: #64748b !important; margin-bottom: 5px !important; display: block; text-transform: uppercase; letter-spacing: 1px; }
    .input-with-icon { position: relative; width: 100%; }
    .field-icon { position: absolute; left: 15px; top: 12px; color: #94a3b8; pointer-events: none; transition: 0.3s; z-index: 10; font-size: 14px; }
    .swal2-input, .swal2-select, .swal2-textarea { 
        padding-left: 45px !important; 
        border-radius: 12px !important; 
        background: #fbfcfe !important; 
        border: 1px solid #e2e8f0 !important; 
        transition: all 0.3s !important;
        font-size: 0.9rem !important;
        width: 100%;
        margin-bottom: 12px !important;
    }
    .swal2-input:focus, .swal2-select:focus, .swal2-textarea:focus { border-color: #3b82f6 !important; background: white !important; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08) !important; }
    
    .b-swal-confirm-btn-blue { padding: 12px 30px !important; font-size: 0.9rem !important; font-weight: 800 !important; border-radius: 50px !important; background: #3b82f6 !important; color: white !important; cursor: pointer; border: none; }
    .b-swal-cancel-btn-blue { padding: 12px 25px !important; font-size: 0.85rem !important; font-weight: 700 !important; border-radius: 50px !important; color: #64748b !important; background: #f8fafc !important; cursor: pointer; border: none; margin-left: 10px; }
`;

// Inject styles into the head
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = adminTeamStyles;
    document.head.appendChild(styleElement);
}
