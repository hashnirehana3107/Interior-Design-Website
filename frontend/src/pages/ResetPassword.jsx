import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MdLockReset, MdVisibility, MdVisibilityOff, MdCheckCircle } from 'react-icons/md';
import { BsArrowRight } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';
import './ResetPassword.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useAuth();

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!token || !email) {
            setErrorMsg('Invalid or missing reset link. Please request a new password reset.');
        }
    }, [token, email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!password || password.length < 8) {
            setErrorMsg('Password must be at least 8 characters long.');
            return;
        }
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
            setErrorMsg('Password must contain uppercase and lowercase letters.');
            return;
        }
        if (!/[0-9]/.test(password) && !/[!@#$%^&*]/.test(password)) {
            setErrorMsg('Password must contain at least one number or special character.');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMsg('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, email, password })
            });
            const data = await res.json();
            if (res.ok) {
                setIsSuccess(true);
                if (showToast) showToast('Password reset successfully! You can now log in.', 'success', 5000);
            } else {
                setErrorMsg(data.message || 'Failed to reset password. Please try again.');
                if (showToast) showToast(data.message || 'Failed to reset password.', 'error');
            }
        } catch (err) {
            setErrorMsg('Network error. Please check your connection and try again.');
            if (showToast) showToast('Network error. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="rp-page">
            <div className="rp-card">
                {/* Logo / Brand */}
                <div className="rp-brand">
                    <span className="rp-brand-name">GOOD INTERIOR</span>
                    <span className="rp-brand-sub">DESIGN STUDIO</span>
                </div>

                {isSuccess ? (
                    <div className="rp-success">
                        <div className="rp-success-icon"><MdCheckCircle /></div>
                        <h2>Password Reset!</h2>
                        <p>Your password has been updated successfully. You can now log in with your new password.</p>
                        <button className="rp-btn" onClick={() => navigate('/login')}>
                            GO TO LOGIN <BsArrowRight />
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="rp-header">
                            <div className="rp-icon-badge"><MdLockReset /></div>
                            <h2>Set New Password</h2>
                            {email && <p className="rp-email-label">Resetting password for: <strong>{decodeURIComponent(email)}</strong></p>}
                        </div>

                        {errorMsg && (
                            <div className="rp-error-banner">{errorMsg}</div>
                        )}

                        {!errorMsg || (token && email) ? (
                            <form className="rp-form" onSubmit={handleSubmit} noValidate>
                                <div className="rp-input-group">
                                    <label>New Password</label>
                                    <div className="rp-input-wrapper">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Min 8 chars, upper + lower + number"
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                                        />
                                        <button type="button" className="rp-eye-btn" onClick={() => setShowPassword(v => !v)}>
                                            {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                                        </button>
                                    </div>
                                </div>

                                <div className="rp-input-group">
                                    <label>Confirm New Password</label>
                                    <div className="rp-input-wrapper">
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            placeholder="Re-enter your new password"
                                            value={confirmPassword}
                                            onChange={(e) => { setConfirmPassword(e.target.value); setErrorMsg(''); }}
                                        />
                                        <button type="button" className="rp-eye-btn" onClick={() => setShowConfirm(v => !v)}>
                                            {showConfirm ? <MdVisibilityOff /> : <MdVisibility />}
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" className="rp-btn" disabled={isSubmitting}>
                                    {isSubmitting ? 'UPDATING PASSWORD...' : <><span>RESET PASSWORD</span> <BsArrowRight /></>}
                                </button>
                            </form>
                        ) : null}

                        <p className="rp-back-link">
                            <a href="/login">Back to Login</a>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
