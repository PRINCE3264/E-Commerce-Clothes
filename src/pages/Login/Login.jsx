import React, { useState } from 'react';
import {
    Mail,
    Lock,
    ArrowRight,
    Eye,
    EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="login-page">
            {/* Architectural Background Elements */}
            <div className="glass-orb orb-1"></div>
            <div className="glass-orb orb-2"></div>

            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo-box">
                        <Lock size={28} />
                    </div>
                    <h2>Welcome Back</h2>
                    <p className="auth-subtitle">Step into your curated fashion world.</p>
                </div>

                <form className="auth-body" onSubmit={(e) => e.preventDefault()}>
                    <div className="login-form-container staggered-container">
                        <div className="form-group anim-f-1">
                            <label><Mail size={16} /> Email Address</label>
                            <input type="email" placeholder="email@example.com" required />
                        </div>

                        <div className="form-group anim-f-2">
                            <label><Lock size={16} /> Password</label>
                            <div className="pass-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter password"
                                    required
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

                        <div className="form-utils anim-f-3">
                            <label className="check-box">
                                <input type="checkbox" />
                                <span>Keep me signed in</span>
                            </label>
                            <Link to="/forgot-password" title="Recover Account" className="forgot-link">Forgot password?</Link>
                        </div>

                        <button className="auth-btn-submit anim-f-4">
                            <span>LOGIN NOW</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>

                    <p className="auth-switch anim-f-5">
                        New to Pandit Shop?
                        <Link to="/register" className="switch-btn">
                            Register Here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
