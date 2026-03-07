import React, { useState, useRef } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import Swal from 'sweetalert2';
import '../Login/Login.css';
import './VerifyOTP.css';

const VerifyOTP = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);
    const email = location.state?.email || '';

    const handleChange = (index, value) => {
        // Accept only digits
        if (!/^\d?$/.test(value)) return;

        const updated = [...otpDigits];
        updated[index] = value;
        setOtpDigits(updated);

        // Auto-advance to next box
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Move back on backspace if box is empty
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const updated = [...otpDigits];
        pasted.split('').forEach((char, i) => { updated[i] = char; });
        setOtpDigits(updated);
        // Focus last filled box
        const lastIdx = Math.min(pasted.length, 5);
        inputRefs.current[lastIdx]?.focus();
    };

    const otp = otpDigits.join('');

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/auth/verify-otp', { email, otp });
            if (res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Account Verified!',
                    text: 'Your email has been verified successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/login');
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Verification Failed',
                text: err.response?.data?.message || 'Invalid or expired OTP'
            });
        }
    };

    if (!email) {
        return (
            <div className="login-page">
                <div className="auth-card">
                    <h2>Session Invalid</h2>
                    <p>No email provided for verification.</p>
                    <button className="auth-btn-submit" onClick={() => navigate('/register')}>Back to Register</button>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page verify-otp-page">
            <div className="glass-orb orb-1"></div>
            <div className="glass-orb orb-2"></div>

            <div className="auth-card verify-card">
                <div className="auth-header">
                    <div className="auth-logo-box otp-logo-box">
                        <CheckCircle size={28} />
                    </div>
                    <h2>Verify Your Email</h2>
                    <p className="auth-subtitle">
                        We've sent a 6-digit code to <strong>{email}</strong>
                    </p>
                </div>

                <form className="auth-body" onSubmit={handleVerify}>
                    <div className="otp-boxes-row" onPaste={handlePaste}>
                        {otpDigits.map((digit, i) => (
                            <input
                                key={i}
                                ref={el => inputRefs.current[i] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleChange(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                className={`otp-box ${digit ? 'otp-box-filled' : ''}`}
                                autoFocus={i === 0}
                            />
                        ))}
                    </div>

                    <button
                        className="auth-btn-submit anim-f-2"
                        type="submit"
                        disabled={otp.length < 6}
                    >
                        <span>VERIFY &amp; CONTINUE</span>
                        <ArrowRight size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyOTP;
