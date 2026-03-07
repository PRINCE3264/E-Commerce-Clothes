import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Camera, LogOut, ChevronRight, MapPin, User,
    Mail, Phone, CheckCircle, AlertCircle,
    Loader, Edit3, Save, X
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
            
            // Auto-save avatar to backend immediately
            try {
                const res = await API.put('/auth/profile', { ...editForm, avatar: base64 });
                if (res.data.success) {
                    const u = res.data.data;
                    setUser(u);
                    localStorage.setItem('user_data', JSON.stringify(u));
                    window.dispatchEvent(new Event('user_data_updated'));
                    // Optional: show a small toast or success indicator
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

    /* Same 3-step chain as sidebar: preview → saved avatar → initials */
    const fallbackAvatar = `${DEFAULT_AVATAR}${encodeURIComponent(user?.name || 'U')}`;
    const avatarSrc = avatarPreview || user?.avatar || fallbackAvatar;
    const onAvatarError = (e) => { e.target.onerror = null; e.target.src = fallbackAvatar; };

    const joinDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Recently Joined';

    /* ── Loading state ── */
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
        <div className="pf-page">
            <div className="pf-wrap">

                {/* ══════════════════════════════
                    ONE SINGLE CARD
                ══════════════════════════════ */}
                <div className="pf-single-card">

                    {/* ── Hero: Avatar + Name ── */}
                    <div className="pf-hero-inner">
                        <div className="pf-hero-bg-strip" />
                        <div className="pf-hero-body">
                            <div className="pf-avatar-ring">
                                <img src={avatarSrc} alt={user.name} className="pf-avatar" onError={onAvatarError} />
                                <button className="pf-cam-btn" type="button" onClick={() => fileInputRef.current?.click()}>
                                    <Camera size={14} />
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*"
                                    style={{ display: 'none' }} onChange={handleAvatarChange} />
                            </div>
                            <h1 className="pf-hero-name">{user.name}</h1>
                            <p className="pf-hero-email">{user.email}</p>
                            {user.phone && <p className="pf-hero-phone">{user.phone}</p>}
                            <span className="pf-premium-badge">👑 Premium Member</span>
                            <span className="pf-join-badge">Since {joinDate}</span>
                        </div>
                    </div>

                    <div className="pf-card-divider" />

                    {/* ── Account Details ── */}
                    <div className="pf-details-block">
                        <h2 className="pf-block-title"><User size={16} /> Account Details</h2>
                        <div className="pf-details-list">
                            <div className="pf-detail-row">
                                <User size={15} className="pf-detail-icon" />
                                <div>
                                    <span className="pf-detail-label">Full Name</span>
                                    <span className="pf-detail-val">{user.name}</span>
                                </div>
                            </div>
                            <div className="pf-detail-row">
                                <Mail size={15} className="pf-detail-icon" />
                                <div>
                                    <span className="pf-detail-label">Email</span>
                                    <span className="pf-detail-val">{user.email}</span>
                                </div>
                            </div>
                            {user.phone && (
                                <div className="pf-detail-row">
                                    <Phone size={15} className="pf-detail-icon" />
                                    <div>
                                        <span className="pf-detail-label">Phone</span>
                                        <span className="pf-detail-val">{user.phone}</span>
                                    </div>
                                </div>
                            )}
                            {(user.address || user.city) && (
                                <div className="pf-detail-row">
                                    <MapPin size={15} className="pf-detail-icon" />
                                    <div>
                                        <span className="pf-detail-label">Address</span>
                                        <span className="pf-detail-val">
                                            {[user.address, user.city, user.postalCode, user.country].filter(Boolean).join(', ')}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pf-card-divider" />

                    {/* ── Edit Profile + Shipping ── */}
                    <div className="pf-details-block">

                        {/* Edit Profile toggle */}
                        <button className="pf-menu-item" onClick={() => setActiveSection(activeSection === 'edit' ? null : 'edit')}>
                            <div className="pf-menu-left">
                                <div className="pf-menu-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                                    <Edit3 size={17} />
                                </div>
                                <span>Edit Profile</span>
                            </div>
                            <ChevronRight size={18} className={`pf-chevron ${activeSection === 'edit' ? 'rotated' : ''}`} />
                        </button>

                        {activeSection === 'edit' && (
                            <form className="pf-inline-form" onSubmit={handleSave}>
                                {saveStatus === 'ok' && (
                                    <div className="pf-banner success"><CheckCircle size={16} /> Saved successfully!</div>
                                )}
                                {saveStatus === 'err' && (
                                    <div className="pf-banner error"><AlertCircle size={16} /> Save failed. Try again.</div>
                                )}
                                <div className="pf-form-avatar-row">
                                    <img src={avatarSrc} alt="avatar" className="pf-form-avatar" onError={onAvatarError} />
                                    <button type="button" className="pf-change-photo-btn" onClick={() => fileInputRef.current?.click()}>
                                        <Camera size={15} /> Change Photo
                                    </button>
                                </div>
                                <div className="pf-form-grid">
                                    <div className="pf-form-group">
                                        <label>Full Name *</label>
                                        <input type="text" value={editForm.name}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                            placeholder="Your full name" required />
                                    </div>
                                    <div className="pf-form-group">
                                        <label>Email (cannot change)</label>
                                        <input type="email" value={user.email} disabled />
                                    </div>
                                    <div className="pf-form-group">
                                        <label>Phone Number</label>
                                        <input type="text" value={editForm.phone}
                                            onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                            placeholder="+91 98765 43210" />
                                    </div>
                                    <div className="pf-form-group">
                                        <label>Country</label>
                                        <input type="text" value={editForm.country}
                                            onChange={e => setEditForm({ ...editForm, country: e.target.value })}
                                            placeholder="India" />
                                    </div>
                                    <div className="pf-form-group pf-full-col">
                                        <label>Street Address</label>
                                        <input type="text" value={editForm.address}
                                            onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                                            placeholder="House No, Street" />
                                    </div>
                                    <div className="pf-form-group">
                                        <label>City</label>
                                        <input type="text" value={editForm.city}
                                            onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                                            placeholder="Mumbai" />
                                    </div>
                                    <div className="pf-form-group">
                                        <label>Postal Code</label>
                                        <input type="text" value={editForm.postalCode}
                                            onChange={e => setEditForm({ ...editForm, postalCode: e.target.value })}
                                            placeholder="400001" />
                                    </div>
                                </div>
                                <div className="pf-form-actions">
                                    <button type="button" className="pf-btn-cancel" onClick={() => setActiveSection(null)}>
                                        <X size={16} /> Cancel
                                    </button>
                                    <button type="submit" className="pf-btn-save" disabled={saving}>
                                        {saving
                                            ? <><Loader size={16} className="pf-spin" /> Saving…</>
                                            : <><Save size={16} /> Save Changes</>}
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="pf-menu-divider" />

                        {/* Shipping Address toggle */}
                        <button className="pf-menu-item" onClick={() => setActiveSection(activeSection === 'shipping' ? null : 'shipping')}>
                            <div className="pf-menu-left">
                                <div className="pf-menu-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                                    <MapPin size={17} />
                                </div>
                                <span>Shipping Address</span>
                            </div>
                            <ChevronRight size={18} className={`pf-chevron ${activeSection === 'shipping' ? 'rotated' : ''}`} />
                        </button>

                        {activeSection === 'shipping' && (
                            <div className="pf-shipping-detail">
                                {user.address || user.city ? (
                                    <>
                                        {user.address    && <p><strong>Street:</strong> {user.address}</p>}
                                        {user.city       && <p><strong>City:</strong> {user.city}</p>}
                                        {user.postalCode && <p><strong>Postal Code:</strong> {user.postalCode}</p>}
                                        {user.country    && <p><strong>Country:</strong> {user.country}</p>}
                                        <button className="pf-edit-addr-btn" onClick={() => setActiveSection('edit')}>
                                            <Edit3 size={14} /> Edit Address
                                        </button>
                                    </>
                                ) : (
                                    <div className="pf-no-addr">
                                        <MapPin size={30} color="#cbd5e1" />
                                        <p>No address saved yet.</p>
                                        <button className="pf-edit-addr-btn" onClick={() => setActiveSection('edit')}>
                                            + Add Address
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="pf-card-divider" />

                    {/* ── Logout ── */}
                    <div className="pf-details-block">
                        <button className="pf-logout-inline" onClick={handleLogout}>
                            <LogOut size={18} /><span>Logout</span>
                        </button>
                    </div>

                </div>
                {/* end pf-single-card */}

            </div>
        </div>
    );
};

export default Profile;
