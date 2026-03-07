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
            title: isEdit ? 'Edit User Identity' : 'Register New User',
            width: '700px',
            padding: '2.5rem',
            showCancelButton: true,
            confirmButtonText: isEdit ? 'Update Identity' : 'Initialize User',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#f8fafc',
            cancelButtonText: 'Discard',
            customClass: {
                popup: 'v-extreme-swal-blue',
                confirmButton: 'b-swal-confirm-btn-blue',
                cancelButton: 'b-swal-cancel-btn-blue'
            },
            html: (
                <div className="swal-custom-form user-form">
                    <div className="swal-row">
                        <div className="swal-input-group">
                            <label>Full Name</label>
                            <input id="swal-user-name" className="swal2-input" defaultValue={user?.name || ''} placeholder="John Doe" />
                        </div>
                        <div className="swal-input-group">
                            <label>Email Address</label>
                            <input id="swal-user-email" className="swal2-input" defaultValue={user?.email || ''} placeholder="john@example.com" />
                        </div>
                    </div>
                    {!isEdit && (
                        <div className="swal-input-group">
                            <label>Password</label>
                            <input id="swal-user-pass" type="password" className="swal2-input" placeholder="Create secure password" />
                        </div>
                    )}
                    <div className="swal-row">
                        <div className="swal-input-group">
                            <label>Access Role</label>
                            <select id="swal-user-role" className="swal2-select" defaultValue={user?.role || 'user'}>
                                <option value="user">Store Participant</option>
                                <option value="admin">Admin Node</option>
                            </select>
                        </div>
                        <div className="swal-input-group">
                            <label>Phone Number</label>
                            <input id="swal-user-phone" className="swal2-input" defaultValue={user?.phone || ''} placeholder="+91 ..." />
                        </div>
                    </div>
                    <div className="swal-input-group">
                        <label>Shipping / Base Address</label>
                        <textarea id="swal-user-address" className="swal2-textarea" defaultValue={user?.address || ''} placeholder="Street details..."></textarea>
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
            title: user.name + ' - Profile Data',
            width: '600px',
            padding: '2rem',
            background: '#ffffff',
            customClass: {
                popup: 'v-extreme-swal-blue',
                confirmButton: 'b-swal-confirm-btn-blue'
            },
            confirmButtonText: 'Registration Safe',
            html: (
                <div className="view-user-details" style={{ textAlign: 'left' }}>
                    <div className="user-profile-header" style={{ display: 'flex', gap: '20px', marginBottom: '30px', alignItems: 'center' }}>
                        <div className="v-ring" style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f0f9ff', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '800' }}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{user.name}</h3>
                            <span className={`role-pill ${user.role}`}>{user.role.toUpperCase()}</span>
                        </div>
                    </div>
                    <div className="view-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <div className="v-label">EMAIL ENDPOINT</div>
                            <div className="v-val">{user.email}</div>
                        </div>
                        <div>
                            <div className="v-label">COMMUNICATION</div>
                            <div className="v-val">{user.phone || 'No Signal'}</div>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <div className="v-label">GEOGRAPHIC BASE (ADDRESS)</div>
                            <div className="v-val">{user.address || 'No location data registered.'}</div>
                        </div>
                        <div>
                            <div className="v-label">JOIN EPOCH</div>
                            <div className="v-val">{new Date(user.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div>
                            <div className="v-label">SYSTEM UID</div>
                            <div className="v-val" style={{ fontFamily: 'monospace' }}>{user._id}</div>
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
                    <button className="btn-primary highlight-btn" onClick={() => handleOpenForm()}>
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

                .v-label { font-size: 0.7rem; font-weight: 800; color: #94a3b8; letter-spacing: 1px; margin-bottom: 5px; text-transform: uppercase; }
                .v-val { font-size: 1rem; font-weight: 700; color: #1e293b; margin-bottom: 15px; }
                .role-pill { display: flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; width: fit-content; }
                .role-pill.admin { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
                .role-pill.user { background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; }
                .reg-epoch { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: #64748b; font-weight: 500; }
                .status-pill.completed { background: #dcfce7; color: #15803d; }
                .status-pill.processing { background: #eff6ff; color: #2563eb; }
                .admin-loading-state { display: flex; flex-direction: column; align-items: center; padding: 80px 0; color: #475569; gap: 15px; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
                .swal-custom-form.user-form .swal-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                .swal-custom-form.user-form .swal-input-group { display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 15px; }
                .swal-custom-form.user-form label { font-size: 0.85rem; font-weight: 700; color: #64748b; margin-bottom: 8px; }
                .swal-custom-form.user-form .swal2-input, .swal-custom-form.user-form .swal2-select, .swal-custom-form.user-form .swal2-textarea { margin: 0 !important; width: 100% !important; box-sizing: border-box; }
            `}</style>
        </div>
    );
};

export default AdminCustomers;
