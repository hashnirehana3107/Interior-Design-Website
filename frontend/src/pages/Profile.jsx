import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiGlobe, FiCheckCircle, FiShield, FiSave, FiLock, FiCalendar, FiBookOpen, FiCamera, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { countriesList } from '../utils/countries';
import './Profile.css';

const Profile = () => {
    const { user, isAuthenticated, updateProfile, showToast } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        country: user?.country || 'Sri Lanka'
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [fieldErrors, setFieldErrors] = useState({});
    const [formError, setFormError] = useState('');

    // Redirect if not logged in
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', {
                state: { returnUrl: '/profile', message: 'Please log in to view your profile.' }
            });
        } else if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                country: user.country || 'Sri Lanka'
            });
        }
    }, [isAuthenticated, user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            if (showToast) showToast('Please select a valid image file (JPG, PNG, WebP).', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            if (showToast) showToast('Failed to process profile photo.', 'error');
            return;
        }

        setIsUploadingPhoto(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const base64String = reader.result;
                await updateProfile({
                    fullName: formData.fullName,
                    phone: formData.phone,
                    country: formData.country,
                    avatar: base64String
                });
                if (showToast) showToast('Changes saved successfully', 'success');
            } catch (err) {
                console.error('Photo upload failed:', err);
                if (showToast) showToast('Failed to process profile photo.', 'error');
            } finally {
                setIsUploadingPhoto(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemovePhoto = async () => {
        setIsUploadingPhoto(true);
        try {
            await updateProfile({
                fullName: formData.fullName,
                phone: formData.phone,
                country: formData.country,
                avatar: ''
            });
            if (showToast) showToast('Profile photo removed.', 'info');
        } catch (err) {
            console.error('Photo removal failed:', err);
            if (showToast) showToast('Failed to process profile photo.', 'error');
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const validateForm = () => {
        const errors = {};
        const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]{6,}$/;

        if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
            errors.fullName = 'Full name must be at least 2 characters';
        }

        if (formData.phone.trim() && !phoneRegex.test(formData.phone.trim())) {
            errors.phone = 'Valid phone number is required (min 7 digits)';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!validateForm()) {
            setFormError('Please fix profile validation errors.');
            if (showToast) showToast('Failed to process profile photo.', 'error');
            return;
        }

        setIsSaving(true);
        try {
            await updateProfile({
                fullName: formData.fullName,
                phone: formData.phone,
                country: formData.country
            });
            if (showToast) showToast('Changes saved successfully', 'success');
        } catch (err) {
            console.error('Profile update failed:', err);
            setFormError(err.message || 'Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return null;

    const userInitial = user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';

    return (
        <div className="profile-page">
            {/* Uniform Hero Section */}
            <section className="profile-hero-section">
                <div className="profile-hero-overlay"></div>
                <div className="profile-hero-content">
                    <span className="profile-hero-subtitle">MEMBER PORTAL</span>
                    <h1 className="profile-hero-title">MY PROFILE & ACCOUNT</h1>
                    <p className="profile-hero-description">
                        Manage your account settings, personal information, and interior design consultation preferences.
                    </p>
                </div>
            </section>

            {/* Profile Main Container */}
            <div className="profile-main-container">
                <div className="profile-layout-grid">

                    {/* Left Sidebar Card */}
                    <div className="profile-sidebar-card">
                        <div className="profile-avatar-wrapper">
                            <div className="profile-avatar-large">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.fullName} className="profile-avatar-img" />
                                ) : (
                                    <span>{userInitial}</span>
                                )}
                            </div>
                            <div className="profile-avatar-badge" title="Verified Account">
                                <FiCheckCircle />
                            </div>
                        </div>

                        <div className="profile-avatar-actions">
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handlePhotoUpload}
                            />
                            <button
                                type="button"
                                className="btn-avatar-action btn-upload"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingPhoto}
                                title="Upload new photo"
                            >
                                <FiCamera /> {isUploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                            </button>
                            {user?.avatar && (
                                <button
                                    type="button"
                                    className="btn-avatar-action btn-remove"
                                    onClick={handleRemovePhoto}
                                    disabled={isUploadingPhoto}
                                    title="Remove photo"
                                >
                                    <FiTrash2 /> Remove
                                </button>
                            )}
                        </div>

                        <h3 className="profile-user-name">{user.fullName}</h3>
                        <p className="profile-user-email">{user.email}</p>

                        <div className="profile-vip-tag">
                            <FiShield className="vip-icon" />
                            <span>GOOD INTERIOR CLUB MEMBER</span>
                        </div>

                        <div className="profile-sidebar-stats">
                            <div className="sidebar-stat-item">
                                <div className="stat-icon-bg"><FiCalendar /></div>
                                <div className="stat-info">
                                    <span className="stat-label">Member Since</span>
                                    <span className="stat-value">2026</span>
                                </div>
                            </div>
                            <div className="sidebar-stat-item">
                                <div className="stat-icon-bg"><FiGlobe /></div>
                                <div className="stat-info">
                                    <span className="stat-label">Country</span>
                                    <span className="stat-value">{user.country || 'Sri Lanka'}</span>
                                </div>
                            </div>
                            <div className="sidebar-stat-item">
                                <div className="stat-icon-bg"><FiBookOpen /></div>
                                <div className="stat-info">
                                    <span className="stat-label">Saved Projects</span>
                                    <span className="stat-value">5 Items</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="profile-content-card">
                        {/* Tabs */}
                        <div className="profile-tabs-header">
                            <button
                                className={`profile-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                                onClick={() => setActiveTab('general')}
                            >
                                <FiUser /> Personal Details
                            </button>
                            <button
                                className={`profile-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                                onClick={() => setActiveTab('security')}
                            >
                                <FiLock /> Security & Password
                            </button>
                        </div>

                        {activeTab === 'general' ? (
                            /* Personal Details Form */
                            <form className="profile-form" onSubmit={handleSaveProfile} noValidate>
                                <div className="profile-form-header">
                                    <h3>Personal Information</h3>
                                    <p>Update your display name and contact details stored in MongoDB Atlas.</p>
                                </div>

                                <div className="profile-form-grid">
                                    <div className="profile-input-group">
                                        <label>Full Name *</label>
                                        <div className="profile-input-wrapper">
                                            <FiUser className="profile-field-icon" />
                                            <input
                                                type="text"
                                                name="fullName"
                                                className={fieldErrors.fullName ? 'input-has-error' : ''}
                                                value={formData.fullName}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        {fieldErrors.fullName && (
                                            <span className="form-field-error-msg">️ {fieldErrors.fullName}</span>
                                        )}
                                    </div>

                                    <div className="profile-input-group">
                                        <label>Email Address (Primary)</label>
                                        <div className="profile-input-wrapper disabled">
                                            <FiMail className="profile-field-icon" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                disabled
                                                title="Email address cannot be changed"
                                            />
                                        </div>
                                        <span className="field-hint">Email is tied to your primary authentication login.</span>
                                    </div>

                                    <div className="profile-input-group">
                                        <label>Phone Number</label>
                                        <div className="profile-input-wrapper">
                                            <FiPhone className="profile-field-icon" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                placeholder="+94 7X XXX XXXX"
                                                className={fieldErrors.phone ? 'input-has-error' : ''}
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        {fieldErrors.phone && (
                                            <span className="form-field-error-msg">️ {fieldErrors.phone}</span>
                                        )}
                                    </div>

                                    <div className="profile-input-group">
                                        <label>Country / Region</label>
                                        <div className="profile-input-wrapper">
                                            <FiGlobe className="profile-field-icon" />
                                            <select
                                                 name="country"
                                                 value={formData.country}
                                                 onChange={handleChange}
                                                 style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px 12px 12px 42px', outline: 'none' }}
                                             >
                                                 <option value="" disabled hidden>Select country</option>
                                                 {countriesList.map((c) => (
                                                     <option key={c} value={c}>{c}</option>
                                                 ))}
                                             </select>
                                        </div>
                                    </div>
                                </div>

                                {formError && (
                                    <div className="form-error-banner-right">
                                        <span>️ {formError}</span>
                                    </div>
                                )}

                                <div className="profile-form-actions">
                                    <button type="submit" className="btn-save-profile" disabled={isSaving}>
                                        <FiSave /> {isSaving ? 'SAVING TO DATABASE...' : 'SAVE CHANGES'}
                                    </button>
                                </div>
                            </form>

                        ) : (
                            /* Security Tab */
                            <div className="profile-security-section">
                                <div className="profile-form-header">
                                    <h3>Account Security</h3>
                                    <p>Your authentication token and database sessions are encrypted.</p>
                                </div>

                                <div className="security-status-box">
                                    <div className="security-status-icon"><FiShield /></div>
                                    <div className="security-status-text">
                                        <h4>Two-Factor & Encryption Active</h4>
                                        <p>Your credentials are protected using industry standard bcrypt hashing on MongoDB Atlas.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;
