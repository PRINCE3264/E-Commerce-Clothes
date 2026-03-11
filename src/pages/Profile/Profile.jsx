import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Camera, LogOut, ChevronRight, User,
    Mail, Phone, AlertCircle,
    Loader, Edit3, Save, X, Crown, Calendar
} from 'lucide-react';
import API from '../../utils/api';
import './Profile.css';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=c0392b&color=fff&size=200&bold=true&name=';

const Profile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    const [editForm, setEditForm] = useState({
        name: '', phone: '', address: '', city: '', postalCode: '', country: ''
    });

    /* ── Fetch user on mount ── */
    useEffect(() => {
        const load = async () => {
            try {
                const res = await API.get('/auth/me');
                if (res.data.success) {
                    const u = res.data.data;
                    setUser(u);
                    setAvatarPreview(u.avatar || '');
                    syncForm(u);
                    localStorage.setItem('user_data', JSON.stringify(u));
                }
            } catch {
                const stored = localStorage.getItem('user_data');
                if (stored) {
                    const u = JSON.parse(stored);
                    setUser(u);
                    setAvatarPreview(u.avatar || '');
                    syncForm(u);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const syncForm = (u) => {
        setEditForm({
            name: u.name || '',
            phone: u.phone || '',
            address: u.address || '',
            city: u.city || '',
            postalCode: u.postalCode || '',
            country: u.country || '',
        });
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2MB'); return; }
        
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result;
            setAvatarPreview(base64);
            
            try {
                const res = await API.put('/auth/profile', { ...editForm, avatar: base64 });
                if (res.data.success) {
                    const u = res.data.data;
                    setUser(u);
                    localStorage.setItem('user_data', JSON.stringify(u));
                    window.dispatchEvent(new Event('user_data_updated'));
                }
            } catch (err) {
                console.error("Failed to auto-save avatar", err);
                alert("Failed to save profile picture. Please try again.");
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaveStatus('');
        try {
            const res = await API.put('/auth/profile', { ...editForm, avatar: avatarPreview });
            if (res.data.success) {
                const u = res.data.data;
                setUser(u);
                setAvatarPreview(u.avatar || '');
                syncForm(u);
                localStorage.setItem('user_data', JSON.stringify(u));
                window.dispatchEvent(new Event('user_data_updated'));
                setSaveStatus('ok');
                setTimeout(() => { setSaveStatus(''); setActiveSection(null); }, 1500);
            }
        } catch {
            setSaveStatus('err');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        navigate('/login');
    };

    const fallbackAvatar = `${DEFAULT_AVATAR}${encodeURIComponent(user?.name || 'U')}`;
    const avatarSrc = avatarPreview || user?.avatar || fallbackAvatar;
    const onAvatarError = (e) => { e.target.onerror = null; e.target.src = fallbackAvatar; };

    const joinDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Recently Joined';

    if (loading) return (
        <div className="pf-loading">
            <Loader size={44} className="pf-spin" />
            <p>Loading profile…</p>
        </div>
    );

    if (!user) return (
        <div className="pf-loading">
            <AlertCircle size={44} color="#ef4444" />
            <p>Please <span className="pf-link" onClick={() => navigate('/login')}>login</span> to view your profile.</p>
        </div>
    );

    return (
        <div className="pf-page-standalone animate-fade-in elite-profile-page">
            <div className="elite-profile-wrap">
                
                {/* ── RED CURVED HEADER ── */}
                <div className="elite-hero-card">
                    <div className="elite-hero-banner"></div>
                    <div className="elite-hero-content">
                        <div className="elite-avatar-container">
                            <div className="elite-avatar-ring">
                                <img src={avatarSrc} alt={user.name} className="elite-avatar-img" onError={onAvatarError} />
                                <button className="elite-cam-btn" onClick={() => fileInputRef.current?.click()}>
                                    <Camera size={16} />
                                </button>
                                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleAvatarChange} />
                            </div>
                        </div>
                        
                        <div className="elite-identity">
                            <h1 className="elite-name">{user.name}</h1>
                            <p className="elite-email">{user.email}</p>
                            {user.phone && <p className="elite-phone">{user.phone}</p>}
                            
                            <div className="elite-badges">
                                <span className="badge-pill premium">
                                    <Crown size={14} fill="#f59e0b" color="#f59e0b" /> Premium Member
                                </span>
                                <span className="badge-pill join">Since {joinDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="elite-details-container">
                    <div className="elite-section">
                        <div className="elite-section-title">
                            <User size={18} /> <span>Account Details</span>
                        </div>
                        
                        <div className="elite-details-list">
                            <div className="elite-detail-row">
                                <div className="detail-icon"><User size={18} /></div>
                                <div className="detail-info">
                                    <small>FULL NAME</small>
                                    <strong>{user.name}</strong>
                                </div>
                            </div>
                            
                            <div className="elite-detail-row">
                                <div className="detail-icon"><Mail size={18} /></div>
                                <div className="detail-info">
                                    <small>EMAIL</small>
                                    <strong>{user.email}</strong>
                                </div>
                            </div>

                            {user.phone && (
                                <div className="elite-detail-row">
                                    <div className="detail-icon"><Phone size={18} /></div>
                                    <div className="detail-info">
                                        <small>PHONE</small>
                                        <strong>{user.phone}</strong>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="elite-divider"></div>

                    <div className="elite-section">
                        <div className="elite-section-title">
                            <Edit3 size={18} /> <span>Profile Settings</span>
                        </div>
                        
                        <div className="elite-actions">
                            <button className="elite-action-btn" onClick={() => setActiveSection(activeSection === 'edit' ? null : 'edit')}>
                                <div className="action-icon edit"><Edit3 size={18} /></div>
                                <span className="action-label">Edit Profile Information</span>
                                <ChevronRight size={18} className={`chevron ${activeSection === 'edit' ? 'active' : ''}`} />
                            </button>

                            {activeSection === 'edit' && (
                                <form className="elite-edit-form" onSubmit={handleSave}>
                                    <div className="elite-form-grid">
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Phone Number</label>
                                            <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                                        </div>
                                        <div className="form-group full-width">
                                            <label>Shipping Address</label>
                                            <input type="text" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} />
                                        </div>
                                        <div className="form-group">
                                            <label>City</label>
                                            <input type="text" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Postal Code</label>
                                            <input type="text" value={editForm.postalCode} onChange={e => setEditForm({...editForm, postalCode: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="form-footer">
                                        <button type="submit" className="elite-save-btn" disabled={saving}>
                                            {saving ? <Loader className="spin" size={16} /> : <Save size={16} />}
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        {saveStatus === 'ok' && <span className="status-msg success">Profile updated!</span>}
                                    </div>
                                </form>
                            )}

                            <button className="elite-action-btn logout-btn" onClick={handleLogout}>
                                <div className="action-icon logout"><LogOut size={18} /></div>
                                <span className="action-label">Sign Out Account</span>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
