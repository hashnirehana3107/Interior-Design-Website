import React, { useState, useEffect, useCallback } from 'react';
import { IoClose } from 'react-icons/io5';
import { BsCheckCircleFill, BsCalendarCheck, BsArrowRight } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';
import './ConsultationModal.css';
import API_BASE from '../config/api';

const SERVICES_LIST = [
    'Residential Interior Design',
    'Commercial Interior Design',
    'Kitchen Design',
    'Bedroom Design',
    'Living & Dining Design',
    'Space Planning & Layout',
    'Material & Furniture Selection',
    'Styling & Décor'
];

/**
 * ConsultationModal — High-end Quick Booking Modal popup for interior design consultation.
 */
const ConsultationModal = ({ isOpen, onClose, initialService = '' }) => {
    const { user, token, showToast } = useAuth();
    const [availableServices, setAvailableServices] = useState(SERVICES_LIST);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        service: initialService || SERVICES_LIST[0],
        budget: '$10k - $25k',
        date: '',
        notes: ''
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [formError, setFormError] = useState('');

    // Fetch dynamic services list from backend
    useEffect(() => {
        const fetchBackendServices = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/services`);
                const data = await res.json();
                if (res.ok && data.services && data.services.length > 0) {
                    const fetchedTitles = data.services.map(s => s.title);
                    setAvailableServices(fetchedTitles);
                }
            } catch (err) {
                console.error('Error loading dynamic services in ConsultationModal:', err);
            }
        };
        fetchBackendServices();
    }, []);

    // Synchronize initial service and pre-fill user data when modal opens
    useEffect(() => {
        if (isOpen) {
            const validPhone = (user?.phone && !user.phone.includes('@')) ? user.phone : '';
            const defaultService = initialService || (availableServices.length > 0 ? availableServices[0] : SERVICES_LIST[0]);
            setFormData({
                fullName: user?.fullName || '',
                email: user?.email || '',
                phone: validPhone,
                service: defaultService,
                budget: '$10k - $25k',
                date: '',
                notes: ''
            });
            setIsSubmitted(false);
            setFieldErrors({});
            setFormError('');
        }
    }, [isOpen, initialService, user, availableServices]);


    // Close on ESC key & prevent body scrolling
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape' && isOpen) {
            onClose();
        }
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, handleKeyDown]);

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

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!validateForm()) {
            setFormError('Please check highlighted fields for errors.');
            if (showToast) showToast('Please fix consultation booking errors.', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            const headers = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE}/api/consultations`, {
                method: 'POST',
                headers,
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.message || 'Failed to submit consultation request.';
                setFormError(errorMsg);
                if (showToast) showToast(`${errorMsg}`, 'error');
                return;
            }

            setIsSubmitted(true);
            if (showToast) {
                showToast('Consultation booked successfully!', 'success', 5000);
            }
        } catch (error) {
            console.error('Consultation booking error:', error);
            const networkError = 'Network error. Please check backend server connection.';
            setFormError(networkError);
            if (showToast) showToast(`${networkError}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <div className="cm-backdrop" onClick={onClose}>
            <div className="cm-container" onClick={(e) => e.stopPropagation()}>

                {/* Close Button */}
                <button className="cm-close-btn" onClick={onClose} aria-label="Close modal">
                    <IoClose />
                </button>

                {!isSubmitted ? (
                    <>
                        {/* Header */}
                        <div className="cm-header">
                            <div className="cm-kicker-wrap">
                                <BsCalendarCheck className="cm-kicker-icon" />
                                <span className="cm-kicker">INTERIOR DESIGN CONSULTATION</span>
                            </div>
                            <h2 className="cm-title">Book Your Personal Design Session</h2>
                            <p className="cm-subtitle">
                                Schedule a 1-on-1 consultation with our senior designers. We'll discuss your vision, layout options, materials, and project timeline.
                            </p>
                        </div>

                        {/* Booking Form */}
                        <form className="cm-form" onSubmit={handleSubmit} noValidate>
                            <div className="cm-form-grid">

                                {/* Full Name */}
                                <div className="cm-form-group">
                                    <label>FULL NAME *</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        autoComplete="name"
                                        placeholder="e.g. Eleanor Vance"
                                        className={fieldErrors.fullName ? 'input-has-error' : ''}
                                        value={formData.fullName}
                                        onChange={handleChange}
                                    />
                                    {fieldErrors.fullName && (
                                        <span className="form-field-error-msg">️ {fieldErrors.fullName}</span>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="cm-form-group">
                                    <label>EMAIL ADDRESS *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        autoComplete="email"
                                        placeholder="eleanor@example.com"
                                        className={fieldErrors.email ? 'input-has-error' : ''}
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                    {fieldErrors.email && (
                                        <span className="form-field-error-msg">️ {fieldErrors.email}</span>
                                    )}
                                </div>

                                {/* Phone */}
                                <div className="cm-form-group">
                                    <label>PHONE NUMBER *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        autoComplete="tel"
                                        placeholder="+1 (555) 000-0000"
                                        className={fieldErrors.phone ? 'input-has-error' : ''}
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                    {fieldErrors.phone && (
                                        <span className="form-field-error-msg">️ {fieldErrors.phone}</span>
                                    )}
                                </div>


                                {/* Service Selected */}
                                <div className="cm-form-group">
                                    <label>SERVICE REQUIRED</label>
                                    <select
                                        name="service"
                                        value={formData.service}
                                        onChange={handleChange}
                                    >
                                        {availableServices.map((srv, i) => (
                                            <option key={i} value={srv}>{srv}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Budget Scope */}
                                <div className="cm-form-group">
                                    <label>ESTIMATED BUDGET</label>
                                    <select
                                        name="budget"
                                        value={formData.budget}
                                        onChange={handleChange}
                                    >
                                        <option value="Under $10,000">Under $10,000</option>
                                        <option value="$10k - $25k">$10,000 - $25,000</option>
                                        <option value="$25k - $50k">$25,000 - $50,000</option>
                                        <option value="$50k+">$50,000+</option>
                                    </select>
                                </div>

                                {/* Preferred Date */}
                                <div className="cm-form-group">
                                    <label>PREFERRED DATE</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                    />
                                </div>

                            </div>

                            {/* Additional Notes */}
                            <div className="cm-form-group cm-full-width">
                                <label>TELL US ABOUT YOUR SPACE / VISION</label>
                                <textarea
                                    name="notes"
                                    rows="3"
                                    placeholder="Room sizes, aesthetic preferences, timeline expectations..."
                                    value={formData.notes}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            {formError && (
                                <div className="form-error-banner-right">
                                    <span>️ {formError}</span>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="cm-form-footer">
                                <button type="submit" className="cm-submit-btn" disabled={isSubmitting}>
                                    {isSubmitting ? 'CONFIRMING BOOKING...' : <>CONFIRM CONSULTATION BOOKING <BsArrowRight /></>}
                                </button>
                                <span className="cm-privacy-note">
                                    Your privacy is protected. No spam, ever.
                                </span>
                            </div>
                        </form>
                    </>

                ) : (
                    /* Success Confirmation View */
                    <div className="cm-success-view">
                        <div className="cm-success-icon-wrap">
                            <BsCheckCircleFill />
                        </div>
                        <h3>Consultation Request Received!</h3>
                        <p>
                            Thank you <strong>{formData.fullName}</strong>. We have received your request for <strong>{formData.service}</strong>.
                        </p>
                        <p className="cm-success-sub">
                            Our senior interior lead will contact you via <strong>{formData.email}</strong> within 24 hours to confirm your consultation details.
                        </p>
                        <button className="cm-submit-btn" onClick={onClose}>
                            CLOSE & CONTINUE BROWSING
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ConsultationModal;
