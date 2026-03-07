import React, { useState } from 'react';
import { Mail, ArrowRight, ShieldCheck, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../Login/Login.css'; // Re-use the login base styles
import './ForgotPassword.css';
import API from '../../utils/api';
import Swal from 'sweetalert2';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');

    const handleForgot = async (e) => {
        e.preventDefault();
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
                        <ShieldCheck size={28} />
                    </div>
                    <h2>Reset Password</h2>
                    <p className="auth-subtitle">Enter your email address to receive a secure reset link.</p>
                </div>

                <form className="auth-body" onSubmit={handleForgot}>
                    <div className="forgot-form-container staggered-container">
                        <div className="form-group anim-f-1">
                            <label><Mail size={16} /> Email Address</label>
                            <input type="email" placeholder="registered-email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>

                        <button className="auth-btn-submit anim-f-2">
                            <span>SEND RESET LINK</span>
                            <ArrowRight size={18} />
                        </button>

                        <div className="reset-info anim-f-3">
                            <p>We'll send you a recovery link to restore access to your account.</p>
                        </div>
                    </div>

                    <p className="auth-switch anim-f-4">
                        <Link to="/login" className="back-link">
                            <ChevronLeft size={16} />
                            <span>Back to Login</span>
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
