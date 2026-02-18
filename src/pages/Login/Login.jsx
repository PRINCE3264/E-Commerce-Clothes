import React, { useState, useEffect } from 'react';
import {
    Mail,
    Lock,
    User,
    ArrowRight,
    Eye,
    EyeOff,
    UserPlus,
    MapPin,
    Smartphone,
    Home,
    Globe,
    Zap,
    ShieldCheck
} from 'lucide-react';
import './Login.css';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
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
            <div className={`auth-card ${!isLogin ? 'register-wide' : ''}`}>
                <div className="auth-header">
                    <div className="auth-logo-box">
                        {isLogin ? <Lock size={32} /> : <UserPlus size={32} />}
                    </div>
                    <h2>{isLogin ? 'Welcome Back' : 'Join Pandit Shop'}</h2>
                    <p>{isLogin ? 'Login to your account to continue shopping.' : 'Create your account to start shopping premium items.'}</p>
                </div>

                <form className="auth-body" onSubmit={(e) => e.preventDefault()}>
                    {isLogin ? (
                        <div className="login-form-container">
                            <div className="form-floating">
                                <input type="email" id="email" placeholder=" " required />
                                <label htmlFor="email"><Mail size={18} /> Email Address</label>
                            </div>
                            <div className="form-floating">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder=" "
                                    required
                                />
                                <label htmlFor="password"><Lock size={18} /> Password</label>
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            <div className="form-options">
                                <label className="remember-check">
                                    <input type="checkbox" id="rememberMe" />
                                    <span>Remember me</span>
                                </label>
                                <a href="#" className="forgot-link">Forgot password?</a>
                            </div>

                            <button className="auth-btn-primary">
                                <span>Login Securely</span>
                                <ArrowRight size={20} className="animate-arrow" />
                            </button>
                        </div>
                    ) : (
                        <div className="register-form-container">
                            <div className="register-row">
                                {/* Personal Info Section */}
                                <div className="register-section">
                                    <h5 className="section-title"><User size={18} /> Personal Information</h5>

                                    <div className="form-floating">
                                        <input type="text" id="regName" placeholder=" " required />
                                        <label htmlFor="regName">Full Name</label>
                                    </div>

                                    <div className="form-floating">
                                        <input type="email" id="regEmail" placeholder=" " required />
                                        <label htmlFor="regEmail">Email address</label>
                                    </div>

                                    <div className="phone-input-group">
                                        <div className="country-select">
                                            <select>
                                                <option value="+91">🇮🇳 +91</option>
                                                <option value="+1">🇺🇸 +1</option>
                                                <option value="+44">🇬🇧 +44</option>
                                            </select>
                                        </div>
                                        <div className="form-floating-select">
                                            <div className="form-floating">
                                                <input type="tel" id="regPhone" placeholder=" " required />
                                                <label htmlFor="regPhone">Phone Number</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-floating">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="regPass"
                                            placeholder=" "
                                            required
                                            onChange={handlePasswordChange}
                                        />
                                        <label htmlFor="regPass">Password</label>
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>

                                    <div className="strength-container">
                                        <div className="strength-bar">
                                            <div className={`strength-fill ${passwordStrength}`}></div>
                                        </div>
                                        <small className="text-muted">Security Level: {passwordStrength || 'Enter password'}</small>
                                    </div>
                                </div>

                                {/* Address Section */}
                                <div className="register-section">
                                    <h5 className="section-title"><MapPin size={18} /> Shipping Address</h5>

                                    <div className="form-floating">
                                        <input type="text" id="address" placeholder=" " />
                                        <label htmlFor="address">Street Address</label>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div className="form-floating">
                                            <input type="text" id="city" placeholder=" " />
                                            <label htmlFor="city">City</label>
                                        </div>
                                        <div className="form-floating">
                                            <input type="text" id="state" placeholder=" " />
                                            <label htmlFor="state">State</label>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div className="form-floating">
                                            <input type="text" id="postal" placeholder=" " />
                                            <label htmlFor="postal">Postal Code</label>
                                        </div>
                                        <div className="form-floating">
                                            <select id="country" style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', outline: 'none', padding: '1.5rem 1rem 0.5rem', fontWeight: '700' }}>
                                                <option selected>India</option>
                                                <option>USA</option>
                                                <option>UK</option>
                                            </select>
                                            <label htmlFor="country" style={{ top: '1.2rem', fontSize: '0.75rem', fontWeight: '700' }}>Country</label>
                                        </div>
                                    </div>

                                    <div className="form-check" style={{ marginTop: '1.5rem', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                        <input type="checkbox" id="terms" required style={{ marginTop: '4px' }} />
                                        <label htmlFor="terms" className="text-muted" style={{ fontSize: '0.85rem' }}>
                                            I agree to the <a href="#" style={{ color: '#1e3a5f', fontWeight: '800' }}>Terms of Service</a> and <a href="#" style={{ color: '#1e3a5f', fontWeight: '800' }}>Privacy Policy</a>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <button className="auth-btn-primary">
                                <span>Create My Account</span>
                                <ArrowRight size={20} className="animate-arrow" />
                            </button>
                        </div>
                    )}

                    <div className="auth-divider">
                        <span>Social {isLogin ? 'Login' : 'Signup'}</span>
                    </div>

                    <div className="social-flex">
                        <button className="social-btn">
                            <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" alt="Google" />
                            <span>Google</span>
                        </button>
                        <button className="social-btn">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_(2019).png" alt="Facebook" />
                            <span>Facebook</span>
                        </button>
                    </div>

                    <p className="auth-footer">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            type="button"
                            className="toggle-link"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? 'Register now' : 'Login here'}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
