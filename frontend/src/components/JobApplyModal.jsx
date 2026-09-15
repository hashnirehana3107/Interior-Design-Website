import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { BsCheckCircleFill, BsBriefcase, BsArrowRight } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';
import './JobApplyModal.css';
import API_BASE from '../config/api';

const JobApplyModal = ({ isOpen, onClose, selectedPosition = '' }) => {
    const { user, showToast } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        position: selectedPosition || 'Interior Designer',
        portfolioUrl: '',
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

        if (!validateForm()) {
            setFormError('Please complete all required fields.');
            if (showToast) showToast('Please complete required fields.', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_BASE}/api/careers/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
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

    return (
        <div className="jam-backdrop" onClick={onClose}>
            <div className="jam-container" onClick={(e) => e.stopPropagation()}>
                <button className="jam-close-btn" onClick={onClose} aria-label="Close modal">
                    <IoClose />
                </button>

                {!isSubmitted ? (
                    <>
                        <div className="jam-header">
                            <div className="jam-kicker-wrap">
                                <BsBriefcase className="jam-kicker-icon" />
                                <span className="jam-kicker">JOIN GOOD INTERIOR STUDIO</span>
                            </div>
                            <h2 className="jam-title">Apply for {formData.position}</h2>
                            <p className="jam-subtitle">
                                Submit your portfolio link and contact information to join our luxury interior architecture team in Colombo.
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
                                        <option value="Entry Level (0-1 Yrs)">Entry Level (0-1 Yrs)</option>
                                        <option value="Junior (1-2 Yrs)">Junior (1-2 Yrs)</option>
                                        <option value="Mid-Level (2-4 Yrs)">Mid-Level (2-4 Yrs)</option>
                                        <option value="Senior (5+ Yrs)">Senior (5+ Yrs)</option>
                                    </select>
                                </div>

                                <div className="jam-form-group">
                                    <label>PORTFOLIO / CV / LINKEDIN URL</label>
                                    <input
                                        type="url"
                                        name="portfolioUrl"
                                        placeholder="https://behance.net/yourprofile or Drive Link"
                                        value={formData.portfolioUrl}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="jam-form-group jam-full-width">
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
                                <div className="form-error-banner-right">
                                    <span>⚠️ {formError}</span>
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
