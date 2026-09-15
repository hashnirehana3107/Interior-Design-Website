import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { BsCheckCircleFill, BsBriefcase, BsArrowRight, BsUpload, BsFileEarmarkPdf, BsLock, BsExclamationTriangle } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';
import './JobApplyModal.css';
import API_BASE from '../config/api';

const JobApplyModal = ({ isOpen, onClose, selectedPosition = '' }) => {
    const { user, showToast } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        position: selectedPosition || 'Interior Designer',
        portfolioUrl: '',
        cvFile: '',
        cvFileName: '',
        experience: '2-4 Years',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (isOpen) {
            const validPhone = (user?.phone && !user.phone.includes('@')) ? user.phone : '';
            setFormData({
                fullName: user?.fullName || '',
                email: user?.email || '',
                phone: validPhone,
                position: selectedPosition || 'Interior Designer',
                portfolioUrl: '',
                cvFile: '',
                cvFileName: '',
                experience: '2-4 Years',
                message: ''
            });
            setIsSubmitted(false);
            setFieldErrors({});
            setFormError('');
        }
    }, [isOpen, selectedPosition, user]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            if (showToast) showToast('File size exceeds 10MB limit.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({
                ...prev,
                cvFile: reader.result,
                cvFileName: file.name
            }));
            if (showToast) showToast(`Attached CV: ${file.name}`, 'info', 3000);
        };
        reader.readAsDataURL(file);
    };

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
        if (!formData.phone.trim() || !phoneRegex.test(formData.phone.trim())) {
            errors.phone = 'Valid phone number is required (min 7 digits)';
        }
        if (!formData.position.trim()) {
            errors.position = 'Please select a position';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!user) {
            setFormError('Please log in to submit your job application.');
            if (showToast) showToast('Please log in to submit your job application.', 'error');
            return;
        }

        if (!validateForm()) {
            setFormError('Please complete all required fields.');
            if (showToast) showToast('Please complete required fields.', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                ...formData,
                userId: user?._id || user?.id || ''
            };

            const response = await fetch(`${API_BASE}/api/careers/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit application.');
            }

            setIsSubmitted(true);
            if (showToast) {
                showToast('Application submitted successfully!', 'success', 5000);
            }
        } catch (error) {
            setFormError(error.message || 'Failed to submit. Please try again.');
            if (showToast) showToast(`${error.message || 'Submission error'}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNavigateLogin = () => {
        onClose();
        navigate('/login');
    };

    return (
        <div className="jam-backdrop" onClick={onClose}>
            <div className="jam-container" onClick={(e) => e.stopPropagation()}>
                <button className="jam-close-btn" onClick={onClose} aria-label="Close modal">
                    <IoClose />
                </button>

                {!user ? (
                    <div className="jam-auth-required">
                        <div className="jam-auth-icon">
                            <BsLock style={{ color: '#b38058', fontSize: '2.8rem' }} />
                        </div>
                        <h3>Login Required to Apply</h3>
                        <p>
                            You must be logged into your account to apply for <strong>{formData.position}</strong>.
                            This helps us track your application status and contact you efficiently.
                        </p>
                        <button className="jam-submit-btn" onClick={handleNavigateLogin}>
                            LOG IN TO APPLY NOW <BsArrowRight />
                        </button>
                    </div>
                ) : !isSubmitted ? (
                    <>
                        <div className="jam-header">
                            <div className="jam-kicker-wrap">
                                <BsBriefcase className="jam-kicker-icon" />
                                <span className="jam-kicker">JOIN GOOD INTERIOR STUDIO</span>
                            </div>
                            <h2 className="jam-title">Apply for {formData.position}</h2>
                            <p className="jam-subtitle">
                                Submit your CV, portfolio link, and contact information to join our luxury interior architecture team in Colombo.
                            </p>
                        </div>

                        <form className="jam-form" onSubmit={handleSubmit} noValidate>
                            <div className="jam-form-grid">
                                <div className="jam-form-group">
                                    <label>FULL NAME *</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        placeholder="e.g. Ruwan Perera"
                                        className={fieldErrors.fullName ? 'input-has-error' : ''}
                                        value={formData.fullName}
                                        onChange={handleChange}
                                    />
                                    {fieldErrors.fullName && <span className="form-field-error-msg">{fieldErrors.fullName}</span>}
                                </div>

                                <div className="jam-form-group">
                                    <label>EMAIL ADDRESS *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="ruwan@example.com"
                                        className={fieldErrors.email ? 'input-has-error' : ''}
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                    {fieldErrors.email && <span className="form-field-error-msg">{fieldErrors.email}</span>}
                                </div>

                                <div className="jam-form-group">
                                    <label>PHONE NUMBER *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="+94 77 123 4567"
                                        className={fieldErrors.phone ? 'input-has-error' : ''}
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                    {fieldErrors.phone && <span className="form-field-error-msg">{fieldErrors.phone}</span>}
                                </div>

                                <div className="jam-form-group">
                                    <label>POSITION APPLIED *</label>
                                    <select name="position" value={formData.position} onChange={handleChange}>
                                        <option value="Interior Designer">Interior Designer</option>
                                        <option value="Interior Architect">Interior Architect</option>
                                        <option value="3D Visualizer">3D Visualizer</option>
                                        <option value="Marketing Executive">Marketing Executive</option>
                                        <option value="Project Manager">Project Manager</option>
                                        <option value="Office Administrator">Office Administrator</option>
                                        <option value="General Resume Submission">General Resume / CV</option>
                                    </select>
                                </div>

                                <div className="jam-form-group">
                                    <label>YEARS OF EXPERIENCE</label>
                                    <select name="experience" value={formData.experience} onChange={handleChange}>
                                        <option value="6 Months">6 Months</option>
                                        <option value="Entry Level (0-1 Yrs)">Entry Level (0-1 Yrs)</option>
                                        <option value="Junior (1-2 Yrs)">Junior (1-2 Yrs)</option>
                                        <option value="Mid-Level (2-4 Yrs)">Mid-Level (2-4 Yrs)</option>
                                        <option value="Senior (5+ Yrs)">Senior (5+ Yrs)</option>
                                    </select>
                                </div>

                                <div className="jam-form-group">
                                    <label>PORTFOLIO / LINKEDIN URL</label>
                                    <input
                                        type="url"
                                        name="portfolioUrl"
                                        placeholder="https://behance.net/yourprofile or Drive Link"
                                        value={formData.portfolioUrl}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* CHOOSE FILE / UPLOAD CV SECTION */}
                            <div className="jam-form-group jam-full-width">
                                <label>ATTACH CV / RESUME (CHOOSE FILE)</label>
                                <div className="jam-file-upload-box">
                                    <input
                                        type="file"
                                        id="cvFileInput"
                                        accept=".pdf,.doc,.docx,image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />
                                    {formData.cvFileName ? (
                                        <div className="jam-file-selected">
                                            <span className="jam-file-name" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                <BsFileEarmarkPdf style={{ fontSize: '1.1rem' }} /> {formData.cvFileName}
                                            </span>
                                            <button
                                                type="button"
                                                className="jam-remove-file-btn"
                                                onClick={() => setFormData(prev => ({ ...prev, cvFile: '', cvFileName: '' }))}
                                            >
                                                Remove File ×
                                            </button>
                                        </div>
                                    ) : (
                                        <label htmlFor="cvFileInput" className="jam-file-label">
                                            <BsUpload style={{ fontSize: '1.1rem' }} />
                                            <span>CHOOSE FILE TO ATTACH CV</span>
                                            <span className="jam-file-hint">(PDF, DOC, DOCX, Image)</span>
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="jam-form-group jam-full-width" style={{ marginTop: '10px' }}>
                                <label>COVER NOTE / INTRO</label>
                                <textarea
                                    name="message"
                                    rows="3"
                                    placeholder="Tell us briefly why you'd love to join Good Interior Studio..."
                                    value={formData.message}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            {formError && (
                                <div className="form-error-banner-right" style={{ marginTop: '10px' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                        <BsExclamationTriangle style={{ color: '#dc2626' }} /> {formError}
                                    </span>
                                </div>
                            )}

                            <div className="jam-form-footer">
                                <button type="submit" className="jam-submit-btn" disabled={isSubmitting}>
                                    {isSubmitting ? 'SUBMITTING APPLICATION...' : <>SUBMIT APPLICATION <BsArrowRight /></>}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="jam-success-view">
                        <div className="jam-success-icon-wrap">
                            <BsCheckCircleFill />
                        </div>
                        <h3>Application Submitted!</h3>
                        <p>
                            Thank you <strong>{formData.fullName}</strong>. We have received your application for <strong>{formData.position}</strong>.
                        </p>
                        <p className="jam-success-sub">
                            Our HR & Lead Architect team will review your profile and contact you at <strong>{formData.email}</strong>.
                        </p>
                        <button className="jam-submit-btn" onClick={onClose}>
                            CLOSE & CONTINUE
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobApplyModal;
