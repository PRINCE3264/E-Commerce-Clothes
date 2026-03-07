import React, { useState } from 'react';
import {
    Mail,
    Lock,
    ArrowRight,
    Eye,
    EyeOff
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Login.css';

import API from '../../utils/api';
import Swal from 'sweetalert2';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [credentials, setCredentials] = useState({ email: '', password: '' });

    React.useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        if (token) {
            localStorage.setItem('auth_token', token);
            API.get('/auth/me')
                .then(res => {
                    localStorage.setItem('user_data', JSON.stringify(res.data.data));
                    window.dispatchEvent(new Event('user_data_updated'));
                    navigate('/');
                }).catch(() => {
                    Swal.fire({ icon: 'error', title: 'Google Login Error' });
                });
        }
    }, [location, navigate]);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        try {
            const res = await API.post('/auth/login', credentials);
            
            if (res.data.success) {
                localStorage.setItem('auth_token', res.data.token);
                localStorage.setItem('user_data', JSON.stringify(res.data.user));
                window.dispatchEvent(new Event('user_data_updated'));
                
                Swal.fire({
                    icon: 'success',
                    title: 'Welcome Back',
                    text: `Logged in as ${res.data.user.name}`,
                    timer: 1500,
                    showConfirmButton: false
                });

                if (res.data.user.role === 'admin') {
                    localStorage.setItem('admin_auth', 'true');
                    localStorage.setItem('admin_token', res.data.token);
                    localStorage.setItem('admin_user', JSON.stringify(res.data.user));
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Auth Failure',
                text: err.response?.data?.message || 'Invalid session credentials'
            });
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const res = await API.get('/auth/google/url');
            if (res.data.success) {
                window.location.href = res.data.url;
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Google OAuth failed',
                text: 'Could not contact identity provider'
            });
        }
    };

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

                <form className="auth-body" onSubmit={handleLogin}>
                    <div className="login-form-container staggered-container">
                        <div className="form-group anim-f-1">
                            <label><Mail size={16} /> Email Address</label>
                            <input 
                                type="email" 
                                name="email"
                                placeholder="email@example.com" 
                                value={credentials.email}
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        <div className="form-group anim-f-2">
                            <label><Lock size={16} /> Password</label>
                            <div className="pass-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter password"
                                    value={credentials.password}
                                    onChange={handleChange}
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

                        <button type="submit" className="auth-btn-submit anim-f-4">
                            <span>LOGIN NOW</span>
                            <ArrowRight size={18} />
                        </button>

                        <div className="auth-separator anim-f-5" style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                            <span style={{ margin: '0 10px', color: '#94a3b8', fontSize: '0.9rem' }}>OR</span>
                            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                        </div>

                        <button type="button" onClick={handleGoogleLogin} className="auth-btn-google anim-f-5" style={{ width: '100%', padding: '15px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: 'bold', color: '#334155', cursor: 'pointer', transition: '0.3s' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                <path d="M1 1h22v22H1z" fill="none"/>
                            </svg>
                            <span>Continue with Google</span>
                        </button>
                    </div>

                    <p className="auth-switch anim-f-6">
                        New to Pandit Shop?
                        <Link to="/register" className="switch-btn">
                            Register Here
                        </Link>
                    </p>
                    {/* <p className="auth-switch anim-f-5" style={{ marginTop: '10px' }}>
                        Admin Account?
                        <Link to="/admin-login" className="switch-btn">
                            Admin Login
                        </Link>
                    </p> */}
                </form>
            </div>
        </div>
    );
};

export default Login;
