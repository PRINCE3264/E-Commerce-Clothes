import React, { useState } from 'react';
import {
    Mail,
    Lock,
    User,
    ArrowRight,
    Eye,
    EyeOff,
    MapPin,
    Smartphone,
    Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import '../Login/Login.css'; // Re-use the login base styles for consistency
import './Register.css';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        if (val.length === 0) setPasswordStrength('');
        else if (val.length < 6) setPasswordStrength('weak');
        else if (val.length < 10) setPasswordStrength('medium');
        else setPasswordStrength('strong');
    };

    return (
        <div className="login-page">
            {/* Architectural Background Elements */}
            <div className="glass-orb orb-1"></div>
            <div className="glass-orb orb-2"></div>

            <div className="auth-card register-wide">
                <div className="auth-header">
                    <div className="auth-logo-box">
                        <User size={28} />
                    </div>
                    <h2>Create Account</h2>
                    <p className="auth-subtitle">Join our elite community of style enthusiasts.</p>
                </div>

                <form className="auth-body" onSubmit={(e) => e.preventDefault()}>
                    <div className="register-form-container staggered-container">
                        <div className="register-grid">
                            {/* Personal Details Column */}
                            <div className="register-column">
                                <h5 className="column-title anim-f-1">PERSONAL DETAILS</h5>

                                <div className="form-group anim-f-2">
                                    <label><User size={16} /> Full Name</label>
                                    <input type="text" placeholder="John Doe" required />
                                </div>

                                <div className="form-group anim-f-3">
                                    <label><Mail size={16} /> Email Address</label>
                                    <input type="email" placeholder="john@example.com" required />
                                </div>

                                <div className="form-group anim-f-4">
                                    <label><Smartphone size={16} /> Phone Number</label>
                                    <div className="phone-wrapper">
                                        <select className="country-code">
                                            <option>🇮🇳 +91</option>
                                            <option>🇺🇸 +1</option>
                                            <option>🇬🇧 +44</option>
                                        </select>
                                        <input type="tel" placeholder="98765 43210" required />
                                    </div>
                                </div>

                                <div className="form-group anim-f-5">
                                    <label><Lock size={16} /> Password</label>
                                    <div className="pass-wrapper">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Create password"
                                            required
                                            onChange={handlePasswordChange}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="strength-display anim-f-6">
                                    <div className="strength-track">
                                        <div className={`strength-fill ${passwordStrength}`}></div>
                                    </div>
                                    <small className="strength-text">Security: {passwordStrength || 'Enter password'}</small>
                                </div>
                            </div>

                            {/* Shipping Preferences Column */}
                            <div className="register-column">
                                <h5 className="column-title anim-f-1">SHIPPING PREFERENCES</h5>

                                <div className="form-group anim-f-2">
                                    <label><MapPin size={16} /> Street Address</label>
                                    <input type="text" placeholder="House no, Street name" />
                                </div>

                                <div className="grid-split anim-f-3">
                                    <div className="form-group">
                                        <label>City</label>
                                        <input type="text" placeholder="Your City" />
                                    </div>
                                    <div className="form-group">
                                        <label>Postal Code</label>
                                        <input type="text" placeholder="123456" />
                                    </div>
                                </div>

                                <div className="form-group anim-f-4">
                                    <label><Globe size={16} /> Country</label>
                                    <select className="styled-input">
                                        <option>India</option>
                                        <option>United Kingdom</option>
                                        <option>United States</option>
                                        <option>Canada</option>
                                    </select>
                                </div>

                                <div className="form-check anim-f-5">
                                    <div className="custom-checkbox">
                                        <input type="checkbox" id="terms-agree" required />
                                        <label htmlFor="terms-agree">
                                            I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
                                        </label>
                                    </div>
                                </div>

                                <div className="form-check anim-f-6">
                                    <div className="custom-checkbox">
                                        <input type="checkbox" id="news-agree" />
                                        <label htmlFor="news-agree">Subscribe to our luxury newsletter for exclusive drops</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button className="auth-btn-submit anim-f-7">
                            <span>CREATE ACCOUNT</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>

                    <p className="auth-switch anim-f-8">
                        Already have an account?
                        <Link to="/login" className="switch-btn">
                            Login Here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
