import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaEyeSlash, FaEye } from 'react-icons/fa';
import { MdOutlineEmail, MdLockOutline } from 'react-icons/md';
import logo from '../assets/logo.svg';
import detailImg from '../assets/detail_img.png';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const API_BASE = 'http://localhost:5000';

const Login = () => {
    const { login, loginWithGoogle, showToast } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState(location.state?.message || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authBranding, setAuthBranding] = useState(null);

    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '163952309094-b7k8osgc8fb91ip41nmnodubeaobd9o5.apps.googleusercontent.com';

    // Fetch dynamic Auth Branding (login title & subtitle)
    useEffect(() => {
        const fetchBranding = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/auth-branding`);
                if (res.ok) {
                    const data = await res.json();
                    setAuthBranding(data);
                }
            } catch (err) {
                console.error('Error fetching auth branding:', err);
            }
        };
        fetchBranding();
    }, []);

    // Load Official Google Identity Services SDK script dynamically
    useEffect(() => {
        if (!window.google) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        }
    }, []);

    // On mount: check if an email was remembered in localStorage
    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim() || !emailRegex.test(email.trim())) {
            setErrorMsg('Please enter a valid email address.');
            return;
        }

        if (!password) {
            setErrorMsg('Please enter your password.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Handle Remember Me persistence
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            const data = await login(email, password);
            if (data?.user?.role === 'admin') {
                navigate('/admin');
            } else {
                const redirectUrl = location.state?.returnUrl || '/';
                navigate(redirectUrl);
            }
        } catch (err) {
            setErrorMsg(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };


    // Official Real Google Login Handler (Opens Google Login Popup)
    const handleGoogleLogin = () => {
        if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID')) {
            showToast('Google Client ID is missing or invalid in .env', 'error', 6000);
            return;
        }

        if (window.google?.accounts?.oauth2) {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: 'email profile openid',
                callback: async (tokenResponse) => {
                    if (tokenResponse.error) {
                        console.error('Google OAuth error:', tokenResponse);
                        showToast(`${tokenResponse.error}`, 'error');
                        return;
                    }

                    if (tokenResponse.access_token) {
                        try {
                            setIsSubmitting(true);
                            // Fetch real user info from Google's verified UserInfo endpoint
                            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                            });
                            const googleProfile = await res.json();

                            if (googleProfile.email) {
                                const data = await loginWithGoogle({
                                    email: googleProfile.email,
                                    fullName: googleProfile.name || googleProfile.given_name || googleProfile.email.split('@')[0],
                                    googleId: googleProfile.sub
                                });
                                if (data?.user?.role === 'admin') {
                                    navigate('/admin');
                                } else {
                                    const redirectUrl = location.state?.returnUrl || '/';
                                    navigate(redirectUrl);
                                }
                            } else {
                                throw new Error('Could not retrieve email from Google profile.');
                            }
                        } catch (err) {
                            console.error('Google SSO Error:', err);
                            setErrorMsg(err.message || 'Real Google Login failed.');
                        } finally {
                            setIsSubmitting(false);
                        }
                    }
                }
            });
            // Open official Google authentication popup window
            client.requestAccessToken();
        } else if (window.google?.accounts?.id) {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: async (response) => {
                    try {
                        setIsSubmitting(true);
                        await loginWithGoogle({ credential: response.credential });
                        const redirectUrl = location.state?.returnUrl || '/';
                        navigate(redirectUrl);
                    } catch (err) {
                        setErrorMsg('Real Google Login failed.');
                    } finally {
                        setIsSubmitting(false);
                    }
                }
            });
            window.google.accounts.id.prompt();
        } else {
            showToast('. Please try again in 2 seconds.', 'info', 4000);
        }
    };


    return (
        <div className="login-page-container">
            {/* Top Bar specific to Login Page */}
            <div className="login-top-bar">
                <Link to="/" className="login-logo-container">
                    <div className="login-logo-mark">
                        <img src={logo} alt="Good Interior" />
                    </div>
                    <div className="login-logo-text">
                        <span className="logo-title">GOOD INTERIOR</span>
                        <span className="logo-subtitle">DESIGN STUDIO</span>
                    </div>
                </Link>
                <Link to="/" className="back-to-home">
                    <FaArrowLeft className="back-icon" /> Back to Home
                </Link>
            </div>

            {/* Main Login Content */}
            <div className="login-wrapper">
                <div className="login-image-container" style={{ backgroundImage: `url(${detailImg})` }}>
                    <div className="login-overlay-gradient"></div>

                    <div className="login-content-layout">
                        {/* Left Side Text */}
                        <div className="login-text-content">
                            <h2 dangerouslySetInnerHTML={{ __html: authBranding?.loginTitle ? authBranding.loginTitle.replace(/\n/g, '<br/>') : 'Welcome Back' }}></h2>
                            <p dangerouslySetInnerHTML={{ __html: authBranding?.loginSubtitle ? authBranding.loginSubtitle.replace(/\n/g, '<br/>') : 'Log in to access your projects,<br />saved ideas and personalized<br />design experience.' }}></p>
                        </div>

                        {/* Right Side Form Card */}
                        <div className="login-form-card">
                            <div className="form-header">
                                <h2>Log In</h2>
                                <p>Enter your credentials to continue</p>
                            </div>

                            {errorMsg && (
                                <div className="auth-error-alert">
                                    <span>️ {errorMsg}</span>
                                </div>
                            )}

                            <form className="login-form" onSubmit={handleSubmit}>
                                <div className="input-group">
                                    <label>Email Address</label>
                                    <div className="input-wrapper">
                                        <MdOutlineEmail className="input-icon" />
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>Password</label>
                                    <div className="input-wrapper">
                                        <MdLockOutline className="input-icon" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter your password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="btn-toggle-pass"
                                            onClick={togglePasswordVisibility}
                                        >
                                            {showPassword ? <FaEye /> : <FaEyeSlash />}
                                        </button>
                                    </div>
                                    <div className="forgot-password">
                                        <button
                                            type="button"
                                            className="forgot-password-link-btn"
                                            onClick={() => setIsForgotModalOpen(true)}
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                </div>

                                <div className="remember-me">
                                    <label className="checkbox-container">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <span className="checkmark"></span>
                                        Remember Me
                                    </label>
                                </div>

                                <button type="submit" className="btn-login-submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'LOGGING IN...' : 'LOG IN'}
                                </button>

                                <div className="divider">
                                    <span>OR</span>
                                </div>

                                <div className="social-login-group">
                                    <button
                                        type="button"
                                        className="btn-social btn-social-full"
                                        onClick={handleGoogleLogin}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" className="google-svg-logo">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                        </svg>
                                        <span>Continue with Google</span>
                                    </button>
                                </div>
                            </form>

                            <div className="login-footer">
                                <p>Don't have an account? <Link to="/signup" className="signup-link">Sign Up</Link></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            <ForgotPasswordModal
                isOpen={isForgotModalOpen}
                onClose={() => setIsForgotModalOpen(false)}
            />
        </div>
    );
};

export default Login;




