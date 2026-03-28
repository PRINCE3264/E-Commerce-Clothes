import React, { useState } from 'react';
import { Mail, ArrowRight, Lock, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../Login/Login.css';
import './ForgotPassword.css';
import API from '../../utils/api';
import Swal from 'sweetalert2';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleForgot = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/auth/forgotpassword', { email });
            Swal.fire({
                icon: 'success',
                title: 'Link Dispatched',
                text: 'Check your inbox for the secure reset gateway.',
                timer: 3000,
                showConfirmButton: false
            });
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Gateway Error',
                text: err.response?.data?.message || 'Email not found in our elite database'
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
                    <h2 className="premium-title">Account Recovery</h2>
                    <p className="auth-subtitle">Verify your identity to restore access.</p>
                </div>

                <form className="auth-body" onSubmit={handleForgot}>
                    <div className="form-group">
                        <label className="premium-label"><Mail size={14} /> Email Address</label>
                        <input 
                            type="email" 
                            className="premium-input"
                            placeholder="admin@gmail.com" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>

                    <button type="submit" className={`elite-btn ${loading ? 'btn-processing' : ''}`} disabled={loading}>
                        {loading ? (
                            <>
                                <span>PROCESSING...</span>
                                <div className="btn-spinner"></div>
                            </>
                        ) : (
                            <>
                                <span>SEND RESET LINK</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    <div className="elite-info">
                        <p>We'll dispatch a secure recovery link to your inbox.</p>
                    </div>

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

export default ForgotPassword;
