import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEyeSlash, FaEye, FaChevronDown } from 'react-icons/fa';
import { MdOutlineEmail, MdLockOutline, MdOutlinePhone } from 'react-icons/md';
import { FiUser, FiGlobe } from 'react-icons/fi';
import { RiBookmarkLine } from 'react-icons/ri';
import { LuFolderOpen } from 'react-icons/lu';
import { BsEnvelopePaper } from 'react-icons/bs';
import { IoShieldCheckmarkOutline, IoCheckmarkCircle } from 'react-icons/io5';
import logo from '../assets/logo.svg';
import detailImg from '../assets/detail_img.png';
import { useAuth } from '../context/AuthContext';
import '../pages/Login.css';
import './Signup.css';


const API_BASE = 'http://localhost:5000';

const SignupIconMapper = ({ iconName }) => {
    const icons = {
        RiBookmarkLine: <RiBookmarkLine />,
        LuFolderOpen: <LuFolderOpen />,
        BsEnvelopePaper: <BsEnvelopePaper />,
        IoShieldCheckmarkOutline: <IoShieldCheckmarkOutline />,
        FiUser: <FiUser />,
        FiGlobe: <FiGlobe />
    };
    return icons[iconName] || <RiBookmarkLine />;
};

const Signup = () => {
    const { register, loginWithGoogle, showToast } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        country: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authBranding, setAuthBranding] = useState(null);

    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '163952309094-b7k8osgc8fb91ip41nmnodubeaobd9o5.apps.googleusercontent.com';

    // Fetch dynamic Auth Branding (signup title, subtitle & features)
    React.useEffect(() => {
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
    React.useEffect(() => {
        if (!window.google) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        }
    }, []);

    // Official Real Google Sign Up / Login Handler (Opens Google Login Popup)
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
                                await loginWithGoogle({
                                    email: googleProfile.email,
                                    fullName: googleProfile.name || googleProfile.given_name || googleProfile.email.split('@')[0],
                                    googleId: googleProfile.sub
                                });
                                navigate('/');
                            } else {
                                throw new Error('Could not retrieve email from Google profile.');
                            }
                        } catch (err) {
                            console.error('Google SSO Error:', err);
                            setErrorMsg(err.message || 'Real Google Sign Up failed.');
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
                        navigate('/');
                    } catch (err) {
                        setErrorMsg('Real Google Sign Up failed.');
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





    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Dynamic password rule checkers
    const isLengthValid = formData.password.length >= 8;
    const isUpperLowerValid = /[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password);
    const isNumOrSpecialValid = /[0-9]/.test(formData.password) || /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);

    const validateForm = () => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]{6,}$/;

        if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
            errors.fullName = 'Full name must be at least 2 characters';
        }

        if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
            errors.email = 'Valid email address is required';
        }

        if (formData.phone.trim() && !phoneRegex.test(formData.phone.trim())) {
            errors.phone = 'Valid phone number is required (min 7 digits)';
        }

        if (!isLengthValid || !isUpperLowerValid || !isNumOrSpecialValid) {
            errors.password = 'Password does not meet required security criteria';
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.agreeTerms) {
            errors.agreeTerms = 'You must agree to the Terms & Conditions';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!validateForm()) {
            setErrorMsg('Please check form fields for errors.');
            if (showToast) showToast('Please fix validation errors.', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            await register({
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                country: formData.country,
                password: formData.password
            });

            if (showToast) showToast('Account created successfully!', 'success');
            // Redirect to home page on successful registration
            navigate('/');
        } catch (err) {
            setErrorMsg(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <div className="login-page-container">
            {/* Top Bar */}
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

            {/* Main Content */}
            <div className="login-wrapper">
                <div className="login-image-container" style={{ backgroundImage: `url(${detailImg})` }}>
                    <div className="login-overlay-gradient"></div>

                    <div className="login-content-layout">
                        {/* Left Side Text & Features */}
                        <div className="login-text-content signup-text-content">
                            <h2 dangerouslySetInnerHTML={{ __html: authBranding?.signupTitle ? authBranding.signupTitle.replace(/\n/g, '<br/>') : 'Elevate Your<br />Interior Experience' }}></h2>
                            <p dangerouslySetInnerHTML={{ __html: authBranding?.signupSubtitle ? authBranding.signupSubtitle.replace(/\n/g, '<br/>') : 'Join Good Interior Studio to curate your dream space,<br />track design consultations, and access exclusive<br />portfolio concepts.' }}></p>

                            <div className="signup-features-box">
                                {(authBranding?.signupFeatures?.length > 0 ? authBranding.signupFeatures : [
                                    { icon: 'RiBookmarkLine', title: 'Curate & Save Inspiration', description: 'Save your favorite room designs, 3D renderings, and bespoke styling ideas.' },
                                    { icon: 'LuFolderOpen', title: 'Seamless Project Tracking', description: 'Monitor your ongoing interior project milestones, consultation schedules, and site updates.' },
                                    { icon: 'BsEnvelopePaper', title: 'Personalized Interior Service', description: 'Receive tailored design proposals, material recommendations, and direct team support.' }
                                ]).map((feat, idx) => (
                                    <div className="feature-item" key={idx}>
                                        <div className="feature-icon">
                                            <SignupIconMapper iconName={feat.icon} />
                                        </div>
                                        <div className="feature-text">
                                            <h4>{feat.title}</h4>
                                            <p>{feat.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Side Form Card */}
                        <div className="login-form-card signup-form-card">
                            <div className="form-header signup-header">
                                <h2>Create Account</h2>
                                <p>Fill in the details below to get started</p>
                            </div>

                            {errorMsg && (
                                <div className="auth-error-alert">
                                    <span>️ {errorMsg}</span>
                                </div>
                            )}

                            <form className="login-form" onSubmit={handleSubmit} noValidate>
                                <div className="input-group">
                                    <label>Full Name *</label>
                                    <div className="input-wrapper">
                                        <FiUser className="input-icon" />
                                        <input
                                            type="text"
                                            name="fullName"
                                            placeholder="Enter your full name"
                                            className={fieldErrors.fullName ? 'input-has-error' : ''}
                                            value={formData.fullName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {fieldErrors.fullName && (
                                        <span className="form-field-error-msg">️ {fieldErrors.fullName}</span>
                                    )}
                                </div>

                                <div className="input-group">
                                    <label>Email Address *</label>
                                    <div className="input-wrapper">
                                        <MdOutlineEmail className="input-icon" />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Enter your email"
                                            className={fieldErrors.email ? 'input-has-error' : ''}
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {fieldErrors.email && (
                                        <span className="form-field-error-msg">️ {fieldErrors.email}</span>
                                    )}
                                </div>

                                <div className="input-row-2col">
                                    <div className="input-group">
                                        <label>Phone Number</label>
                                        <div className="input-wrapper">
                                            <MdOutlinePhone className="input-icon" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                placeholder="Enter your phone number"
                                                className={fieldErrors.phone ? 'input-has-error' : ''}
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        {fieldErrors.phone && (
                                            <span className="form-field-error-msg">️ {fieldErrors.phone}</span>
                                        )}
                                    </div>
                                    <div className="input-group">
                                        <label>Country</label>
                                        <div className="input-wrapper custom-select-wrapper">
                                            <FiGlobe className="input-icon" />
                                            <select
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                            >
                                                <option value="" disabled hidden>Select country</option>
                                                <option value="Sri Lanka">Sri Lanka</option>
                                                <option value="United States">United States</option>
                                                <option value="United Kingdom">United Kingdom</option>
                                                <option value="Australia">Australia</option>
                                                <option value="United Arab Emirates">United Arab Emirates</option>
                                            </select>
                                            <FaChevronDown className="select-arrow" />
                                        </div>
                                    </div>
                                </div>

                                <div className="input-row-2col">
                                    <div className="input-group">
                                        <label>Password *</label>
                                        <div className="input-wrapper">
                                            <MdLockOutline className="input-icon" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                placeholder="Create a password"
                                                className={fieldErrors.password ? 'input-has-error' : ''}
                                                value={formData.password}
                                                onChange={handleChange}
                                            />
                                            <button
                                                type="button"
                                                className="btn-toggle-pass"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                                            </button>
                                        </div>
                                        {fieldErrors.password && (
                                            <span className="form-field-error-msg">️ {fieldErrors.password}</span>
                                        )}
                                    </div>
                                    <div className="input-group">
                                        <label>Confirm Password *</label>
                                        <div className="input-wrapper">
                                            <MdLockOutline className="input-icon" />
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="confirmPassword"
                                                placeholder="Confirm your password"
                                                className={fieldErrors.confirmPassword ? 'input-has-error' : ''}
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                            />
                                            <button
                                                type="button"
                                                className="btn-toggle-pass"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                                            </button>
                                        </div>
                                        {fieldErrors.confirmPassword && (
                                            <span className="form-field-error-msg">️ {fieldErrors.confirmPassword}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Password Requirements Box */}
                                <div className="password-req-box">
                                    <div className="req-icon-container">
                                        <IoShieldCheckmarkOutline />
                                    </div>
                                    <div className="req-details">
                                        <h5>Password must contain:</h5>
                                        <ul>
                                            <li className={isLengthValid ? 'req-met' : ''}>
                                                <IoCheckmarkCircle className="check-icon" /> At least 8 characters
                                            </li>
                                            <li className={isUpperLowerValid ? 'req-met' : ''}>
                                                <IoCheckmarkCircle className="check-icon" /> Upper and lowercase letters
                                            </li>
                                            <li className={isNumOrSpecialValid ? 'req-met' : ''}>
                                                <IoCheckmarkCircle className="check-icon" /> At least one number or special character
                                            </li>
                                        </ul>
                                    </div>
                                </div>


                                <div className="remember-me terms-checkbox">
                                    <label className="checkbox-container">
                                        <input
                                            type="checkbox"
                                            name="agreeTerms"
                                            checked={formData.agreeTerms}
                                            onChange={handleChange}
                                        />
                                        <span className="checkmark"></span>
                                        <span className="terms-text">I agree to the <a href="#terms">Terms & Conditions</a> and <a href="#privacy">Privacy Policy</a></span>
                                    </label>
                                    {fieldErrors.agreeTerms && (
                                        <span className="form-field-error-msg">️ {fieldErrors.agreeTerms}</span>
                                    )}
                                </div>


                                <button type="submit" className="btn-login-submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
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
                                <p>Already have an account? <Link to="/login" className="signup-link">Log In</Link></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;



