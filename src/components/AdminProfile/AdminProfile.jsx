import React, { useState, useEffect } from 'react';
import { Camera, Mail, User, Shield, Save, Smartphone, MapPin, CheckCircle, Lock } from 'lucide-react';
import './AdminProfile.css';
import Swal from 'sweetalert2';

const AdminProfile = () => {
    const defaultData = {
        fullName: 'Khushi Pandit',
        email: 'admin@panditfashion.com',
        role: 'Super Administrator',
        phone: '+91 9876543210',
        location: 'Mumbai, India',
        status: 'Active'
    };

    const [profileData, setProfileData] = useState(() => {
        const storedUser = localStorage.getItem('admin_user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                return {
                    ...defaultData,
                    fullName: parsed.name || defaultData.fullName,
                    email: parsed.email || defaultData.email,
                };
            } catch {
                return defaultData;
            }
        }
        return defaultData;
    });

    useEffect(() => {
        // Any side effects that need to happen on mount can go here
        // If nothing else is needed, this effect can be removed or kept for future use
    }, []);

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleSave = (e) => {
        e.preventDefault();
        Swal.fire({
            title: 'Profile Updated',
            text: 'Your personal administrator configuration has been saved.',
            icon: 'success',
            customClass: {
                popup: 'luxury-admin-swal',
                confirmButton: 'b-swal-confirm-btn-blue',
            }
        });
    };

    const handlePassUpdate = (e) => {
        e.preventDefault();
        Swal.fire({
            title: 'Security Verified',
            text: 'Your cryptographic signature has been updated.',
            icon: 'success',
            customClass: {
                popup: 'luxury-admin-swal',
                confirmButton: 'b-swal-confirm-btn-blue',
            }
        });
    };

    return (
        <div className="admin-profile-container animate-fade-in">
            {/* Profile Cover Background */}
            <div className="profile-cover">
                <div class="pc-overlay"></div>
            </div>

            {/* Main Interface Content */}
            <div className="profile-content glass-panel">
                <div className="profile-hero-section">
                    <div className="profile-avatar-wrapper">
                        <div className="profile-avatar">
                            <span className="avatar-initials">{(profileData.fullName || 'A').charAt(0)}</span>
                        </div>
                        <button className="avatar-upload-btn" title="Update Identity Hologram">
                            <Camera size={18} />
                        </button>
                    </div>

                    <div className="profile-hero-info">
                        <div className="phi-title-wrap">
                            <h2>{profileData.fullName}</h2>
                            <div className="badge-verified"><CheckCircle size={14} /> Verified Matrix Identity</div>
                        </div>
                        <p className="profile-role"><Shield size={14} style={{display:'inline', marginRight:'6px', position:'relative', top:'2px'}}/>{profileData.role}</p>
                    </div>
                </div>

                <div className="profile-grid">
                    {/* General Information Card */}
                    <div className="profile-card">
                        <div className="card-header">
                            <h3>General Intelligence</h3>
                            <p>Update your personal biometric data markers.</p>
                        </div>
                        <form className="profile-form" onSubmit={handleSave}>
                            <div className="form-row">
                                <div className="input-group">
                                    <label>Full Identity Marker</label>
                                    <div className="input-with-icon">
                                        <User size={18} className="input-icon" />
                                        <input 
                                            type="text" 
                                            name="fullName" 
                                            value={profileData.fullName} 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Authorization Level</label>
                                    <div className="input-with-icon">
                                        <Shield size={18} className="input-icon" />
                                        <input 
                                            type="text" 
                                            value={profileData.role} 
                                            disabled 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="input-group">
                                    <label>Email Sector</label>
                                    <div className="input-with-icon">
                                        <Mail size={18} className="input-icon" />
                                        <input 
                                            type="email" 
                                            name="email" 
                                            value={profileData.email} 
                                            disabled 
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Phone Transmitter</label>
                                    <div className="input-with-icon">
                                        <Smartphone size={18} className="input-icon" />
                                        <input 
                                            type="tel" 
                                            name="phone" 
                                            value={profileData.phone} 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="input-group">
                                    <label>Geographic Node</label>
                                    <div className="input-with-icon">
                                        <MapPin size={18} className="input-icon" />
                                        <input 
                                            type="text" 
                                            name="location" 
                                            value={profileData.location} 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="btn-profile-save">
                                <Save size={18} /> SYNCHRONIZE DATA
                            </button>
                        </form>
                    </div>

                    {/* Security Sub-Grid */}
                    <div className="security-sub-grid">
                        <div className="profile-card security-card">
                            <div className="card-header">
                                <h3>Cryptographic Core</h3>
                                <p>Manage your master access sequences.</p>
                            </div>
                            <form className="profile-form" onSubmit={handlePassUpdate}>
                                <div className="input-group">
                                    <label>Current Sequence</label>
                                    <div className="input-with-icon">
                                        <Lock size={18} className="input-icon" />
                                        <input type="password" placeholder="Enter current password..." />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>New Sequence</label>
                                    <div className="input-with-icon">
                                        <Lock size={18} className="input-icon" />
                                        <input type="password" placeholder="Enter new password..." />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Confirm Sequence</label>
                                    <div className="input-with-icon">
                                        <Lock size={18} className="input-icon" />
                                        <input type="password" placeholder="Confirm new password..." />
                                    </div>
                                </div>
                                <button type="submit" className="btn-profile-save update-pass-btn">
                                    UPDATE ENCRYPTION <Shield size={16} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
