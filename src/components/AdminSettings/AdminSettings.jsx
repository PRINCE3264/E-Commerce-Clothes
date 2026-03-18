import React, { useState } from 'react';
import { 
    Settings, Image, CreditCard, Shield, Mail, Save, X, 
    Globe, DollarSign, Percent, MapPin, Truck, Bell, Lock, Smartphone
} from 'lucide-react';
import './AdminSettings.css';
import Swal from 'sweetalert2';

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('general');

    const handleSave = (e) => {
        e.preventDefault();
        Swal.fire({
            title: 'Configurations Saved!',
            text: 'Your application settings have been updated in the cloud.',
            icon: 'success',
            confirmButtonText: 'EXCELLENT',
            customClass: {
                popup: 'luxury-admin-swal',
                confirmButton: 'b-swal-confirm-btn-blue',
            }
        });
    };

    return (
        <div className="admin-settings-container animate-fade-in">
            <div className="settings-header-premium">
                <div className="sh-left">
                    <div className="sh-icon-wrap">
                        <Settings size={28} />
                    </div>
                    <div>
                        <h2>Global Configurations</h2>
                        <p>Manage application preferences, payment nodes, and security parameters.</p>
                    </div>
                </div>
                <div className="sh-right">
                    <button className="btn-discard"><X size={16}/> Discard</button>
                    <button className="btn-save-master" onClick={handleSave}><Save size={16}/> Save Changes</button>
                </div>
            </div>

            <div className="settings-grid-layout">
                <aside className="settings-sidebar glass-panel">
                    <nav className="settings-nav">
                        <button 
                            className={`s-nav-item ${activeTab === 'general' ? 'active' : ''}`}
                            onClick={() => setActiveTab('general')}
                        >
                            <Globe size={18} /> General Setup
                        </button>
                        <button 
                            className={`s-nav-item ${activeTab === 'payments' ? 'active' : ''}`}
                            onClick={() => setActiveTab('payments')}
                        >
                            <CreditCard size={18} /> Payment Gateways
                        </button>
                        <button 
                            className={`s-nav-item ${activeTab === 'shipping' ? 'active' : ''}`}
                            onClick={() => setActiveTab('shipping')}
                        >
                            <Truck size={18} /> Shipping & Delivery
                        </button>
                        <button 
                            className={`s-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                            onClick={() => setActiveTab('notifications')}
                        >
                            <Bell size={18} /> Email & Alerts
                        </button>
                        <button 
                            className={`s-nav-item ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <Shield size={18} /> Security & Auth
                        </button>
                    </nav>
                </aside>

                <main className="settings-content-area glass-panel">
                    <form className="admin-form-premium" onSubmit={handleSave}>
                        {activeTab === 'general' && (
                            <div className="s-tab-content animate-slide-up">
                                <h3 className="tab-title">Platform Identity</h3>
                                
                                <div className="s-form-grid">
                                    <div className="s-input-group full">
                                        <label>Application Name</label>
                                        <input type="text" defaultValue="PANDIT FASHION" />
                                    </div>
                                    <div className="s-input-group">
                                        <label>Support Email</label>
                                        <div className="input-with-icon">
                                            <Mail size={16} />
                                            <input type="email" defaultValue="support@panditfashion.com" />
                                        </div>
                                    </div>
                                    <div className="s-input-group">
                                        <label>Support Phone</label>
                                        <div className="input-with-icon">
                                            <Smartphone size={16} />
                                            <input type="tel" defaultValue="+91 9876543210" />
                                        </div>
                                    </div>
                                    <div className="s-input-group">
                                        <label>Base Currency</label>
                                        <div className="input-with-icon">
                                            <DollarSign size={16} />
                                            <select defaultValue="INR">
                                                <option value="USD">USD ($)</option>
                                                <option value="EUR">EUR (€)</option>
                                                <option value="GBP">GBP (£)</option>
                                                <option value="INR">INR (₹)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="s-input-group">
                                        <label>Standard Tax Rate (%)</label>
                                        <div className="input-with-icon">
                                            <Percent size={16} />
                                            <input type="number" defaultValue="18" />
                                        </div>
                                    </div>
                                    <div className="s-input-group full">
                                        <label>Corporate Address</label>
                                        <div className="input-with-icon align-top">
                                            <MapPin size={16} />
                                            <textarea rows="3" defaultValue="123 Luxury Avenue, Fashion District, Mumbai 400001"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'payments' && (
                            <div className="s-tab-content animate-slide-up">
                                <h3 className="tab-title">Financial Connectivity</h3>
                                <p className="tab-desc">Configure your active payment processing nodes.</p>

                                <div className="integration-card active">
                                    <div className="ic-header">
                                        <div className="ic-brand">
                                            <img src="https://razorpay.com/build/browser/static/razorpay-logo.5cdb58df.svg" alt="Razorpay" />
                                        </div>
                                        <div className="ic-toggle">
                                            <span className="status optimal">LIVE RECORDING</span>
                                        </div>
                                    </div>
                                    <div className="s-form-grid mt-20">
                                        <div className="s-input-group full">
                                            <label>Key ID</label>
                                            <input type="password" defaultValue="rzp_live_placeholder" />
                                        </div>
                                        <div className="s-input-group full">
                                            <label>Key Secret</label>
                                            <input type="password" defaultValue="************************" />
                                        </div>
                                    </div>
                                </div>

                                <div className="integration-card mt-20">
                                    <div className="ic-header">
                                        <div className="ic-brand">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" style={{ filter: 'grayscale(1)', opacity: 0.6 }} />
                                        </div>
                                        <div className="ic-toggle">
                                            <span className="status offline">SUSPENDED</span>
                                        </div>
                                    </div>
                                    <div className="s-form-grid mt-20" style={{ opacity: 0.5 }}>
                                        <div className="s-input-group full">
                                            <label>Publishable Key</label>
                                            <input type="text" placeholder="stripe_publishable_key_placeholder" disabled />
                                        </div>
                                        <div className="s-input-group full">
                                            <label>Secret Key</label>
                                            <input type="password" placeholder="stripe_secret_key_placeholder" disabled />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'shipping' && (
                            <div className="s-tab-content animate-slide-up">
                                <h3 className="tab-title">Logistics Parameters</h3>
                                <div className="s-form-grid">
                                    <div className="s-input-group">
                                        <label>Base Shipping Cost (₹)</label>
                                        <input type="number" defaultValue="150" />
                                    </div>
                                    <div className="s-input-group">
                                        <label>Free Shipping Threshold (₹)</label>
                                        <input type="number" defaultValue="5000" />
                                    </div>
                                    <div className="s-input-group full">
                                        <label>Estimated Delivery Text</label>
                                        <input type="text" defaultValue="3-5 Business Days (Standard)" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="s-tab-content animate-slide-up">
                                <h3 className="tab-title">SMTP & Trigger Configs</h3>
                                <div className="s-form-grid">
                                    <div className="s-input-group full">
                                        <label>SMTP Hostner</label>
                                        <input type="text" defaultValue="smtp.gmail.com" />
                                    </div>
                                    <div className="s-input-group">
                                        <label>SMTP Port</label>
                                        <input type="number" defaultValue="465" />
                                    </div>
                                    <div className="s-input-group">
                                        <label>Encryption Protocol</label>
                                        <select defaultValue="SSL">
                                            <option value="SSL">SSL/TLS</option>
                                            <option value="STARTTLS">STARTTLS</option>
                                        </select>
                                    </div>
                                    <div className="s-input-group full">
                                        <label>SMTP Username (Sender)</label>
                                        <input type="email" defaultValue="notifications@panditfashion.com" />
                                    </div>
                                    <div className="s-input-group full">
                                        <label>SMTP Password / App Key</label>
                                        <input type="password" defaultValue="****************" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="s-tab-content animate-slide-up">
                                <h3 className="tab-title">Defense Matrix</h3>
                                <div className="s-form-grid">
                                    <div className="s-input-group full">
                                        <label>JWT Secret String</label>
                                        <div className="input-with-icon">
                                            <Lock size={16} />
                                            <input type="password" defaultValue="e8f4a3c2b1d9..." />
                                        </div>
                                    </div>
                                    <div className="s-input-group">
                                        <label>JWT Expiration Duration</label>
                                        <select defaultValue="30d">
                                            <option value="1d">24 Hours</option>
                                            <option value="7d">7 Days</option>
                                            <option value="30d">30 Days</option>
                                            <option value="365d">1 Year</option>
                                        </select>
                                    </div>
                                    <div className="s-input-group">
                                        <label>OTP Validity Windows</label>
                                        <select defaultValue="10m">
                                            <option value="5m">5 Minutes</option>
                                            <option value="10m">10 Minutes</option>
                                            <option value="15m">15 Minutes</option>
                                        </select>
                                    </div>
                                    <div className="s-input-group full">
                                        <label>Google OAuth Client ID</label>
                                        <input type="text" defaultValue="7075416075..." />
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </main>
            </div>
        </div>
    );
};

export default AdminSettings;
