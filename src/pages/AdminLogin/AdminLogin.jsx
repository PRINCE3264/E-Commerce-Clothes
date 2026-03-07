import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, Eye, EyeOff, ArrowRight, Loader } from 'lucide-react';
import './AdminLogin.css';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [particles, setParticles] = useState([]);

    // Redirect if already logged in
    useEffect(() => {
        if (localStorage.getItem('admin_auth') === 'true') {
            navigate('/admin');
        }
    }, [navigate]);

    // Generate floating particles
    useEffect(() => {
        const generated = Array.from({ length: 18 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            size: `${Math.random() * 8 + 4}px`,
            animDelay: `${Math.random() * 6}s`,
            animDuration: `${Math.random() * 8 + 6}s`,
        }));
        setParticles(generated);
    }, []);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://127.0.0.1:8000/api/auth/admin-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password,
                }),
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('admin_auth', 'true');
                localStorage.setItem('admin_token', data.token);
                localStorage.setItem('admin_user', JSON.stringify(data.user));
                navigate('/admin');
            } else {
                setError(data.message || 'Invalid credentials. Please try again.');
            }
        } catch {
            // Fallback: if backend is down, check hardcoded credentials
            if (credentials.email === 'admin@gmail.com' && credentials.password === 'admin123') {
                localStorage.setItem('admin_auth', 'true');
                localStorage.setItem('admin_user', JSON.stringify({ name: 'Admin', email: credentials.email, role: 'admin' }));
                navigate('/admin');
            } else {
                setError('Unable to connect to server. Use admin@gmail.com / admin123 for demo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="al-page">
            {/* Animated background particles */}
            <div className="al-bg">
                <div className="al-bg-gradient" />
                <div className="al-bg-grid" />
                {particles.map((p) => (
                    <div
                        key={p.id}
                        className="al-particle"
                        style={{
                            left: p.left,
                            top: p.top,
                            width: p.size,
                            height: p.size,
                            animationDelay: p.animDelay,
                            animationDuration: p.animDuration,
                        }}
                    />
                ))}
            </div>

            <div className="al-container animate-slide-up">
                {/* Side decoration */}
                <div className="al-side-bar" />

                {/* Header */}
                <div className="al-header">
                    <div className="al-shield-wrap">
                        <div className="al-shield-ring" />
                        <ShieldCheck size={36} className="al-shield-icon" />
                    </div>
                    <h1 className="al-title">Admin Portal</h1>
                    <p className="al-subtitle">Secure access to your control center</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="al-form">
                    {error && (
                        <div className="al-error">
                            <span className="al-error-dot" />
                            {error}
                        </div>
                    )}

                    {/* Email Field */}
                    <div className="al-field">
                        <label className="al-label">Email Address</label>
                        <div className="al-input-wrap">
                            <Mail size={18} className="al-input-icon" />
                            <input
                                type="email"
                                name="email"
                                placeholder="admin@example.com"
                                value={credentials.email}
                                onChange={handleChange}
                                className="al-input"
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="al-field">
                        <label className="al-label">Password</label>
                        <div className="al-input-wrap">
                            <Lock size={18} className="al-input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Enter your password"
                                value={credentials.password}
                                onChange={handleChange}
                                className="al-input"
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="al-eye-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Demo hint */}
                    <div className="al-hint">
                        <span className="al-hint-badge">DEMO</span>
                        Use <strong>admin@gmail.com</strong> / <strong>admin123</strong>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="al-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader size={20} className="al-spinner" />
                                Authenticating...
                            </>
                        ) : (
                            <>
                                Access Dashboard
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>

                    {/* Back link */}
                    <div className="al-back">
                        <Link to="/" className="al-back-link">
                            ← Back to Store
                        </Link>
                    </div>
                </form>

                {/* Footer branding */}
                <div className="al-footer">
                    <span className="al-footer-dot" />
                    <span>Pandit Fashion &mdash; Admin Control Panel</span>
                    <span className="al-footer-dot" />
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
