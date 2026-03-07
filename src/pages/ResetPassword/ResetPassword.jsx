import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, ShieldAlert, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import API from '../../utils/api';
import Swal from 'sweetalert2';
import '../Login/Login.css';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
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
        }
    };

    return (
        <div className="login-page">
            <div className="glass-orb orb-1"></div>
            <div className="glass-orb orb-2"></div>

            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo-box">
                        <ShieldAlert size={28} />
                    </div>
                    <h2>New Credentials</h2>
                    <p className="auth-subtitle">Finalize your secure account restoration.</p>
                </div>

                <form className="auth-body" onSubmit={handleReset}>
                    <div className="forgot-form-container staggered-container">
                        <div className="form-group anim-f-1">
                            <label><Lock size={16} /> New Security Password</label>
                            <div className="pass-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                        </div>

                        <div className="form-group anim-f-2">
                            <label><Lock size={16} /> Confirm Security Password</label>
                            <input
                                type="password"
                                placeholder="Re-enter password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button className="auth-btn-submit anim-f-3">
                            <span>COMMIT UPDATES</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>

                    <p className="auth-switch anim-f-4">
                        <Link to="/login" className="back-link">
                            <ChevronLeft size={16} />
                            <span>Return to Login Gate</span>
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
