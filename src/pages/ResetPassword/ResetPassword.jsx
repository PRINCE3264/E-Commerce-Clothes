import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import API from '../../utils/api';
import Swal from 'sweetalert2';
import '../Login/Login.css';
import '../ForgotPassword/ForgotPassword.css';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (password !== confirmPassword) {
            setLoading(false);
            return Swal.fire({ icon: 'error', title: 'Mismatch', text: 'Passwords do not align.' });
        }

        try {
            const res = await API.put(`/auth/resetpassword/${token}`, { password });
            if (res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Vault Updated',
                    text: 'Your security credentials have been successfully reset.',
                    timer: 3000,
                    showConfirmButton: false
                });
                navigate('/login');
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Link Expired',
                text: err.response?.data?.message || 'Token is no longer valid'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page forgot-password-gateway">
            <div className="auth-card elite-card">
                <div className="auth-header">
                    <div className="auth-logo-box premium-box">
                        <Lock size={28} />
                    </div>
                    <h2 className="premium-title">New Credentials</h2>
                    <p className="auth-subtitle">Establish a fresh, secure password.</p>
                </div>

                <form className="auth-body" onSubmit={handleReset}>
                    <div className="form-group">
                        <label className="premium-label"><Lock size={14} /> New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="premium-input"
                                placeholder="8+ characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button 
                                type="button" 
                                className="password-toggle" 
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '15px', top: '15px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                            >
                                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="premium-label"><Lock size={14} /> Confirm Password</label>
                        <input
                            type="password"
                            className="premium-input"
                            placeholder="Repeat password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className={`elite-btn ${loading ? 'btn-processing' : ''}`} disabled={loading}>
                        {loading ? (
                            <>
                                <span>UPDATING...</span>
                                <div className="btn-spinner"></div>
                            </>
                        ) : (
                            <>
                                <span>UPDATE PASSWORD</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    <div className="auth-switch">
                        <Link to="/login" className="elite-back">
                            <ChevronLeft size={16} />
                            <span>Return to Login</span>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
