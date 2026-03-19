import React, { useEffect, useState, useMemo } from 'react';
import { 
    Plus, 
    User, 
    Shield, 
    Mail, 
    Calendar, 
    Edit, 
    Trash2, 
    Search, 
    Eye,
    Loader2, 
    CheckCircle, 
    AlertCircle,
    Phone,
    MapPin
} from 'lucide-react';
import API from '../../utils/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const AdminCustomers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const res = await API.get('/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setUsers(res.data.data);
            }
        } catch (err) {
            console.error("Failed to sync customer registry:", err);
            MySwal.fire({
                icon: 'error',
                title: 'Sync Failed',
                text: 'Could not connect to the user database.',
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
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const handleOpenForm = async (user = null) => {
        const isEdit = !!user;
        
        const result = await MySwal.fire({
            title: null,
            width: '480px',
            padding: '1.5rem',
            showCancelButton: true,
            confirmButtonText: isEdit ? 'Update Identity' : 'Initialize User',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#f8fafc',
            cancelButtonText: 'Discard',
            customClass: {
                popup: 'v-standard-modal',
                confirmButton: 'v-btn-confirm',
                cancelButton: 'v-btn-cancel'
            },
            html: (
                <div className="v-standard-form">
                    <h3 className="v-modal-title">{isEdit ? 'Edit User Identity' : 'Register New User'}</h3>
                    <div className="v-form-group">
                        <label>Full Name</label>
                        <input id="swal-user-name" className="swal2-input v-input" defaultValue={user?.name || ''} placeholder="Full Name" />
                    </div>
                    <div className="v-form-group">
                        <label>Email Address</label>
                        <input id="swal-user-email" className="swal2-input v-input" defaultValue={user?.email || ''} placeholder="Email" />
                    </div>
                    {!isEdit && (
                        <div className="v-form-group">
                            <label>Password</label>
                            <input id="swal-user-pass" type="password" className="swal2-input v-input" placeholder="Create Password" />
                        </div>
                    )}
                    <div className="v-form-row">
                        <div className="v-form-group">
                            <label>Role</label>
                            <select id="swal-user-role" className="swal2-select v-input" defaultValue={user?.role || 'user'}>
                                <option value="user">Participant</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="v-form-group">
                            <label>Phone</label>
                            <input id="swal-user-phone" className="swal2-input v-input" defaultValue={user?.phone || ''} placeholder="+91..." />
                        </div>
                    </div>
                    <div className="v-form-group">
                        <label>Address</label>
                        <textarea id="swal-user-address" className="swal2-textarea v-input" defaultValue={user?.address || ''} placeholder="Residential address details..."></textarea>
                    </div>
                </div>
            ),
            preConfirm: () => {
                const name = document.getElementById('swal-user-name').value;
                const email = document.getElementById('swal-user-email').value;
                const role = document.getElementById('swal-user-role').value;
                const phone = document.getElementById('swal-user-phone').value;
                const address = document.getElementById('swal-user-address').value;
                const password = !isEdit ? document.getElementById('swal-user-pass').value : '';

                if (!name || !email) {
                    Swal.showValidationMessage('Basic identity (Name & Email) is mandatory');
                    return false;
                }
                if (!isEdit && !password) {
                    Swal.showValidationMessage('Password is required for new registration');
                    return false;
                }

                return { name, email, role, phone, address, ...(password && { password }) };
            }
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('admin_token');
                let res;
                if (isEdit) {
                    res = await API.put(`/admin/users/${user._id}`, result.value, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } else {
                    res = await API.post('/admin/users', result.value, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }

                if (res.data.success) {
                    fetchUsers();
                    MySwal.fire({ 
                        icon: 'success', 
                        title: isEdit ? 'Identity Updated' : 'User Provisioned', 
                        timer: 2000, 
                        showConfirmButton: false, 
                        toast: true, 
                        position: 'top-end' 
                    });
                }
            } catch (err) {
                MySwal.fire({
                    icon: 'error',
                    title: 'Provisioning Failed',
                    text: err.response?.data?.message || 'Something went wrong',
                });
            }
        }
    };

    const handleView = (user) => {
        MySwal.fire({
            title: null,
            width: '480px',
            padding: '1.5rem',
            background: '#ffffff',
            showConfirmButton: true,
            confirmButtonText: 'Registration Safe',
            customClass: {
                popup: 'v-standard-modal',
                confirmButton: 'v-btn-confirm'
            },
            html: (
                <div className="v-standard-form">
                    <h3 className="v-modal-title">User Intelligence Card</h3>
                    <div className="v-profile-view-header">
                        <div className="v-view-avatar">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="v-view-meta">
                            <h4>{user.name}</h4>
                            <span className={`v-role-badge ${user.role}`}>
                                {user.role === 'admin' ? 'SYSTEM OPERATOR' : 'STORE MEMBER'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="v-view-grid">
                        <div className="v-view-item">
                            <label>ID NODE</label>
                            <p>#{user._id.slice(-6).toUpperCase()}</p>
                        </div>
                        <div className="v-view-item">
                            <label>AUTH ENDPOINT</label>
                            <p>{user.email}</p>
                        </div>
                        <div className="v-view-item">
                            <label>SIGNAL (PHONE)</label>
                            <p>{user.phone || 'N/A'}</p>
                        </div>
                        <div className="v-view-item">
                            <label>JOIN EPOCH</label>
                            <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="v-view-item full">
                            <label>GEOGRAPHIC BASE (ADDRESS)</label>
                            <p>{user.address || 'No location data registered.'}</p>
                        </div>
                    </div>
                </div>
            )
        });
    };

    const handleDelete = (user) => {
        MySwal.fire({
            title: 'Terminate Access?',
            text: `Revoking access for "${user.name}". This node will be purged from the registry.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Purge User',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('admin_token');
                    await API.delete(`/admin/users/${user._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    fetchUsers();
                    MySwal.fire({ icon: 'info', title: 'Purged', text: 'Identity removed successfully.', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
                } catch (err) {
                    MySwal.fire({
                        icon: 'error',
                        title: 'Purge Failed',
                        text: err.response?.data?.message || 'Something went wrong',
                    });
                }
            }
        });
    };

    return (
        <div className="admin-panel customers-management fade-in">
            <div className="panel-header">
                <div className="header-info">
                    <h3>Identity Command Center</h3>
                    <p>Monitoring and managing all active store participants.</p>
                </div>
                <div className="header-actions">
                    <div className="v-stat-pill mr-15">
                        <User size={14}/> <span>{users.length} Nodes Online</span>
                    </div>
                    <button className="btn-primary highlight-btn mt-15" onClick={() => handleOpenForm()}>
                        <Plus size={18} /> Provision User
                    </button>
                </div>
            </div>

            <div className="admin-filters-bar mt-20">
                <div className="search-wrapper modern">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by name or endpoint (email)..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="admin-loading-state">
                    <Loader2 className="animate-spin" size={40} />
                    <p>Synchronizing identity registry...</p>
                </div>
            ) : (
                <div className="table-responsive mt-30">
                    <table className="admin-table luxury-table">
                        <thead>
                            <tr>
                                <th>Identity Node</th>
                                <th>Auth Stream</th>
                                <th>Access Tier</th>
                                <th>Registration</th>
                                <th>Lifecycle</th>
                                <th>Controls</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user._id}>
                                        <td>
                                            <div className="user-identity-cell">
                                                <div className="user-initials-ring">{user.name.charAt(0).toUpperCase()}</div>
                                                <div className="user-meta">
                                                    <span className="user-full-name">{user.name}</span>
                                                    <span className="user-uid">UID: {user._id.slice(-6).toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="auth-stream-cell">
                                                <div className="stream-item">
                                                    <Mail size={12} className="ico" /> <span>{user.email}</span>
                                                </div>
                                                {user.phone && (
                                                    <div className="stream-item">
                                                        <Phone size={12} className="ico" /> <span>{user.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`role-pill ${user.role}`}>
                                                {user.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                                                {user.role === 'admin' ? 'Admin Node' : 'Store Participant'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="reg-epoch">
                                                <Calendar size={12} className="ico" />
                                                <span>{new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${user.role === 'admin' ? 'completed' : 'processing'}`}>
                                                {user.role === 'admin' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                                Verified
                                            </span>
                                        </td>
                                        <td>
                                            <div className="category-actions">
                                                <button className="btn-action view" onClick={() => handleView(user)} title="Inspect Node">
                                                    <Eye size={16} />
                                                </button>
                                                <button className="btn-action edit" onClick={() => handleOpenForm(user)} title="Edit Identity">
                                                    <Edit size={16} />
                                                </button>
                                                <button className="btn-action delete" onClick={() => handleDelete(user)} title="Purge Node">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="empty-results-cell">
                                        <div className="no-cat-found">
                                            <User size={40} />
                                            <p>No matching identities found in current registry.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <style>{`
                .customers-management { padding: 0; }
                .v-stat-pill { background: #f0f9ff; color: #0c4a6e; padding: 6px 14px; border-radius: 50px; font-weight: 700; font-size: 0.8rem; border: 1px solid #bae6fd; display: flex; align-items: center; gap: 6px; }
                .highlight-btn { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border: none; }
                .user-identity-cell { display: flex; align-items: center; gap: 12px; }
                .user-initials-ring { width: 38px; height: 38px; border-radius: 50%; background: #e0f2fe; color: #0369a1; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                .user-meta { display: flex; flex-direction: column; }
                .user-full-name { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
                .user-uid { font-size: 0.7rem; color: #94a3b8; font-weight: 600; letter-spacing: 0.5px; }
                .auth-stream-cell { display: flex; flex-direction: column; gap: 4px; }
                .stream-item { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: #64748b; }
                .stream-item .ico { color: #94a3b8; }
                .category-actions { display: flex; gap: 8px; }
                .btn-action { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: 0.2s; }
                .btn-action.view { background: #eff6ff; color: #3b82f6; }
                .btn-action.view:hover { background: #3b82f6; color: white; transform: translateY(-3px); }
                .btn-action.edit { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }
                .btn-action.edit:hover { background: #1e293b; color: white; transform: translateY(-3px); border-color: #1e293b; }
                .btn-action.delete { background: #fff1f2; color: #e11d48; }
                .btn-action.delete:hover { background: #ef4444; color: white; transform: translateY(-3px); }

                /* Standardized Admin Popups (View, Edit, Create) */
                .v-standard-modal { border-radius: 20px !important; }
                .v-modal-title { font-size: 1.4rem; font-weight: 800; color: #0f172a; text-align: left; margin: 0 0 20px 0; font-family: 'Outfit', sans-serif; }
                .v-standard-form { text-align: left; width: 100%; display: flex; flex-direction: column; }
                .v-form-group { margin-bottom: 12px; display: flex; flex-direction: column; width: 100%; }
                .v-form-group label { font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
                .v-input { 
                    margin: 0 !important; 
                    width: 100% !important; 
                    box-sizing: border-box; 
                    height: 44px !important; 
                    border-radius: 10px !important; 
                    font-size: 0.95rem !important; 
                    border: 1px solid #e2e8f0 !important;
                    background: #f8fafc !important;
                }
                textarea.v-input { height: 90px !important; padding: 12px !important; }
                .v-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                
                .v-btn-confirm { padding: 12px 30px !important; background: #3b82f6 !important; border-radius: 10px !important; font-weight: 800 !important; font-size: 0.9rem !important; }
                .v-btn-cancel { padding: 12px 25px !important; background: #f1f5f9 !important; color: #64748b !important; border-radius: 10px !important; font-weight: 700 !important; font-size: 0.9rem !important; border: none !important; }

                /* View Specific */
                .v-profile-view-header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
                .v-view-avatar { width: 48px; height: 48px; background: #eff6ff; color: #1e40af; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 800; border: 1px solid #dbeafe; }
                .v-view-meta h4 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #1e293b; }
                .v-role-badge { font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.5px; margin-top: 3px; display: inline-block; }
                .v-role-badge.admin { background: #fee2e2; color: #ef4444; }
                .v-role-badge.user { background: #f0fdf4; color: #16a34a; }
                
                .v-view-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .v-view-item.full { grid-column: span 2; }
                .v-view-item label { font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 3px; display: block; }
                .v-view-item p { margin: 0; font-size: 0.9rem; font-weight: 700; color: #334155; }
                
                /* Ultra-Compact View Profile Styles */
                .v-profile-mini { text-align: left; }
                .v-mini-header { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; }
                .v-mini-avatar { width: 44px; height: 44px; background: #eff6ff; color: #1e40af; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 800; border: 1px solid #dbeafe; }
                .v-mini-meta h4 { margin: 0; font-size: 1rem; font-weight: 800; color: #1e293b; line-height: 1.2; }
                .v-badge-xs { font-size: 0.6rem; font-weight: 900; padding: 1px 6px; border-radius: 4px; letter-spacing: 0.5px; display: inline-block; margin-top: 2px; }
                .v-badge-xs.admin { background: #fee2e2; color: #ef4444; }
                .v-badge-xs.user { background: #f1f5f9; color: #64748b; }
                
                .v-mini-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .v-mini-item.full { grid-column: span 2; }
                .v-mini-item label { display: block; font-size: 0.6rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 1px; }
                .v-mini-item p { margin: 0; font-size: 0.8rem; font-weight: 700; color: #334155; word-break: break-all; }
                
                .v-view-swal-ultra-compact { border-radius: 18px !important; }
                .b-swal-confirm-btn-blue-sm { padding: 8px 30px !important; font-size: 0.85rem !important; font-weight: 800 !important; border-radius: 10px !important; background: #3b82f6 !important; color: white !important; border: none !important; }
            `}</style>
        </div>
    );
};

export default AdminCustomers;
