import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser } from 'react-icons/fi';
import { MdOutlineEmail, MdOutlinePhone, MdOutlineSubject, MdOutlineChatBubbleOutline } from 'react-icons/md';
import {
 TbMapPin, TbPhone, TbMail, TbClock,
 TbBrandFacebook, TbBrandInstagram, TbBrandPinterest, TbBrandLinkedin,
 TbArrowRight, TbHome, TbUsers, TbShieldCheck
} from 'react-icons/tb';
import './Contact.css';
import heroBg from '../assets/hero_bg.png';
import { useAuth } from '../context/AuthContext';
import ConsultationModal from '../components/ConsultationModal';

const API_BASE = 'http://localhost:5000';

const Contact = () => {
 const { user, token, isAuthenticated, showToast } = useAuth();
 const navigate = useNavigate();

 const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
 const [formSubmitted, setFormSubmitted] = useState(false);
 const [formError, setFormError] = useState('');
 const [fieldErrors, setFieldErrors] = useState({});
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [formData, setFormData] = useState({
 fullName: '',
 email: '',
 phone: '',
 subject: '',
 message: ''
 });

 // ── Page Settings & Data from Backend ──
 const [pageSettings, setPageSettings] = useState(null);
 const [journeyGalleryImages, setJourneyGalleryImages] = useState([]);
 const [contactFeatures, setContactFeatures] = useState([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 window.scrollTo(0, 0);
 fetchContactData();
 }, []);

 useEffect(() => {
 if (user) {
 const validPhone = (user?.phone && !user.phone.includes('@')) ? user.phone : '';
 setFormData(prev => ({
 ...prev,
 fullName: user.fullName || '',
 email: user.email || '',
 phone: validPhone,
 }));
 }
 }, [user]);

 const fetchContactData = async () => {
 try {
 setLoading(true);
 const [settingsRes, galleryRes, featuresRes] = await Promise.all([
 fetch(`${API_BASE}/api/contact-settings`),
 fetch(`${API_BASE}/api/gallery/items`),
 fetch(`${API_BASE}/api/contact-settings/features`)
 ]);

 if (settingsRes.ok) {
 const settingsData = await settingsRes.json();
 if (settingsData.settings) {
 setPageSettings(settingsData.settings);
 }
 }

 if (galleryRes.ok) {
 const galleryData = await galleryRes.json();
 if (galleryData.items && galleryData.items.length > 0) {
 setJourneyGalleryImages(galleryData.items.slice(0, 4));
 }
 }

 if (featuresRes.ok) {
 const featuresData = await featuresRes.json();
 if (featuresData.features && featuresData.features.length > 0) {
 setContactFeatures(featuresData.features);
 }
 }
 } catch (err) {
 console.error('Failed to fetch contact page data:', err);
 } finally {
 setLoading(false);
 }
 };

 const handleConsultationClick = () => {
 if (!isAuthenticated) {
 navigate('/login', {
 state: { returnUrl: '/contact', message: 'Please log in as a registered user to book a consultation.' }
 });
 } else {
 setIsConsultationModalOpen(true);
 }
 };

 const validateForm = () => {
 const errors = {};
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]{6,}$/;

 if (!formData.fullName.trim() || formData.fullName.trim().length < 2) errors.fullName = 'Full name must be at least 2 characters';
 if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) errors.email = 'Valid email address is required';
 if (!formData.phone.trim() || !phoneRegex.test(formData.phone.trim())) errors.phone = 'Valid phone number is required (min 7 digits)';
 if (!formData.subject.trim() || formData.subject.trim().length < 3) errors.subject = 'Subject must be at least 3 characters';
 if (!formData.message.trim() || formData.message.trim().length < 10) errors.message = 'Message must be at least 10 characters';

 setFieldErrors(errors);
 return Object.keys(errors).length === 0;
 };

 const handleInputChange = (field, value) => {
 setFormData(prev => ({ ...prev, [field]: value }));
 if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: '' }));
 };

 const handleFormSubmit = async (e) => {
 e.preventDefault();
 setFormError('');
 if (!isAuthenticated) {
 navigate('/login', { state: { returnUrl: '/contact', message: 'Please log in as a registered user to send us a message.' } });
 return;
 }
 if (!validateForm()) {
 setFormError('Please check form fields for errors.');
 if (showToast) showToast('Please complete all required fields.', 'error');
 return;
 }
 setIsSubmitting(true);
 try {
 const headers = { 'Content-Type': 'application/json' };
 if (token) headers['Authorization'] = `Bearer ${token}`;
 const response = await fetch(`${API_BASE}/api/contact`, {
 method: 'POST',
 headers,
 body: JSON.stringify(formData)
 });
 const data = await response.json();
 if (!response.ok) throw new Error(data.message || 'Failed to send message.');
 setFormSubmitted(true);
 if (showToast) showToast('Changes saved successfully', 'success');
 const validPhone = (user?.phone && !user.phone.includes('@')) ? user.phone : '';
 setFormData({ fullName: user?.fullName || '', email: user?.email || '', phone: validPhone, subject: '', message: '' });
 setFieldErrors({});
 setTimeout(() => setFormSubmitted(false), 7000);
 } catch (error) {
 setFormError(error.message || 'Failed to submit message. Please try again.');
 if (showToast) showToast(`${error.message || 'Failed to submit message'}`, 'error');
 } finally {
 setIsSubmitting(false);
 }
 };

 const hero = pageSettings?.hero || {};
 const contactInfo = pageSettings?.contactInfo || {};
 const map = pageSettings?.map || {};
 const heroImageBg = hero?.heroBg || heroBg;
 const mapEmbedUrl = (map?.latitude && map?.longitude)
 ? `https://www.google.com/maps?q=${map.latitude},${map.longitude}&z=16&output=embed`
 : 'https://www.google.com/maps?q=6.8921,79.8612&z=16&output=embed';

 return (
 <div className="contact-page">
 {/* 1. HERO SECTION */}
 <section className="contact-hero" style={{ backgroundImage: `url(${heroImageBg})` }}>
 <div className="contact-hero-overlay">
 <div className="contact-hero-content">
 {hero?.kicker && <span className="contact-kicker">{hero.kicker}</span>}
 <h1 className="contact-title">
 {hero?.title || ''}<br />
 {hero?.highlightText && <span className="gold-text-italic">{hero.highlightText}</span>}
 </h1>
 {hero?.subtitle && <p className="contact-desc">{hero.subtitle}</p>}
 <div className="contact-hero-actions">
 <button className="btn-solid-gold" onClick={handleConsultationClick}>
 BOOK A CONSULTATION <TbArrowRight className="hero-btn-icon" />
 </button>
 <Link to="/portfolio" className="btn-outline-white">VIEW OUR PROJECTS</Link>
 </div>
 </div>
 </div>
 </section>

 {/* 2. CONTACT CONTENT SECTION */}
 <section className="contact-content-sec">
 <div className="contact-content-container">
 {/* Left Form Side Card */}
 <div className="contact-form-side contact-luxury-card">
 <div className="card-header-badge">DIRECT INQUIRY</div>
 <h2 className="contact-sec-heading">SEND US A MESSAGE</h2>
 <div className="contact-separator"></div>
 <p className="contact-subtext">Fill out the form below and our senior interior design team will get back to you within 24 hours.</p>

 {!isAuthenticated && (
 <div className="login-required-banner" onClick={() => navigate('/login', { state: { returnUrl: '/contact', message: 'Please log in to submit a contact message.' } })}>
 <span><strong>Login Required:</strong> Please log in to send a message or book a consultation. <span className="underline-text">Log In Here</span></span>
 </div>
 )}

 {formSubmitted && (
 <div className="form-success-banner">
 Thank you! Your message has been sent successfully. Our team will contact you shortly.
 </div>
 )}

 <form className="contact-form" onSubmit={handleFormSubmit} noValidate>
 <div className="form-row">
 <div className="input-field-wrapper">
 <label className="input-label">FULL NAME *</label>
 <div className="input-icon-box">
 <FiUser className="input-inner-icon" />
 <input type="text" name="fullName" autoComplete="name" placeholder="Enter your full name"
 className={fieldErrors.fullName ? 'input-has-error' : ''}
 value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} />
 </div>
 {fieldErrors.fullName && <span className="form-field-error-msg">️ {fieldErrors.fullName}</span>}
 </div>
 <div className="input-field-wrapper">
 <label className="input-label">EMAIL ADDRESS *</label>
 <div className="input-icon-box">
 <MdOutlineEmail className="input-inner-icon" />
 <input type="email" name="email" autoComplete="email" placeholder="Enter your email address"
 className={fieldErrors.email ? 'input-has-error' : ''}
 value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
 </div>
 {fieldErrors.email && <span className="form-field-error-msg">️ {fieldErrors.email}</span>}
 </div>
 </div>
 <div className="form-row">
 <div className="input-field-wrapper">
 <label className="input-label">PHONE NUMBER *</label>
 <div className="input-icon-box">
 <MdOutlinePhone className="input-inner-icon" />
 <input type="tel" name="phone" autoComplete="tel" placeholder="Enter phone number"
 className={fieldErrors.phone ? 'input-has-error' : ''}
 value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
 </div>
 {fieldErrors.phone && <span className="form-field-error-msg">️ {fieldErrors.phone}</span>}
 </div>
 <div className="input-field-wrapper">
 <label className="input-label">SUBJECT *</label>
 <div className="input-icon-box">
 <MdOutlineSubject className="input-inner-icon" />
 <input type="text" name="subject" placeholder="Project topic or inquiry type"
 className={fieldErrors.subject ? 'input-has-error' : ''}
 value={formData.subject} onChange={(e) => handleInputChange('subject', e.target.value)} />
 </div>
 {fieldErrors.subject && <span className="form-field-error-msg">️ {fieldErrors.subject}</span>}
 </div>
 </div>
 <div className="input-field-wrapper">
 <label className="input-label">YOUR MESSAGE *</label>
 <div className="input-icon-box textarea-icon-box">
 <MdOutlineChatBubbleOutline className="input-inner-icon textarea-icon" />
 <textarea name="message" placeholder="Describe your design vision, timeline, space size, or any specific questions..."
 rows="5" className={fieldErrors.message ? 'input-has-error' : ''}
 value={formData.message} onChange={(e) => handleInputChange('message', e.target.value)}>
 </textarea>
 </div>
 {fieldErrors.message && <span className="form-field-error-msg">️ {fieldErrors.message}</span>}
 </div>

 {formError && (
 <div className="form-error-banner-right"><span>️ {formError}</span></div>
 )}

 <button type="submit" className="btn-solid-gold btn-send-luxury" disabled={isSubmitting}>
 <span>{isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}</span>
 <TbArrowRight className="btn-arrow-icon" />
 </button>
 </form>
 </div>

 {/* Right Info Side Card */}
 <div className="contact-info-side contact-luxury-card info-luxury-card">
 <div className="card-header-badge gold-badge">STUDIO DETAILS</div>
 <h2 className="contact-sec-heading">CONTACT INFORMATION</h2>
 <div className="contact-separator"></div>
 <div className="info-list">
 {contactInfo?.address && (
 <div className="info-item">
 <div className="info-icon-gold"><TbMapPin /></div>
 <div className="info-text">
 <strong>Our Studio Headquarters</strong>
 <p>{contactInfo.address}</p>
 </div>
 </div>
 )}
 {(contactInfo?.phone1 || contactInfo?.phone2) && (
 <div className="info-item">
 <div className="info-icon-gold"><TbPhone /></div>
 <div className="info-text">
 <strong>Phone & Hotline</strong>
 <p>
 {contactInfo.phone1}
 {contactInfo.phone2 && <><br />{contactInfo.phone2}</>}
 </p>
 </div>
 </div>
 )}
 {(contactInfo?.email1 || contactInfo?.email2) && (
 <div className="info-item">
 <div className="info-icon-gold"><TbMail /></div>
 <div className="info-text">
 <strong>Email Address</strong>
 <p>
 {contactInfo.email1}
 {contactInfo.email2 && <><br />{contactInfo.email2}</>}
 </p>
 </div>
 </div>
 )}
 {(contactInfo?.hoursWeekday || contactInfo?.hoursSaturday || contactInfo?.hoursSunday) && (
 <div className="info-item">
 <div className="info-icon-gold"><TbClock /></div>
 <div className="info-text">
 <div className="hours-title-row">
 <strong>Business Hours</strong>
 <span className="status-badge-open"> OPEN TODAY</span>
 </div>
 <div className="hours-grid">
 {contactInfo.hoursWeekday && <><span>Monday - Friday</span><span>: {contactInfo.hoursWeekday}</span></>}
 {contactInfo.hoursSaturday && <><span>Saturday</span><span>: {contactInfo.hoursSaturday}</span></>}
 {contactInfo.hoursSunday && <><span>Sunday</span><span>: {contactInfo.hoursSunday}</span></>}
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </section>

 {/* 3. MAP SECTION — Real Google Maps Embed */}
 <section className="contact-map-sec">
 <div className="map-container map-iframe-container">
 <iframe
 title="Studio Location"
 src={mapEmbedUrl}
 width="100%"
 height="100%"
 style={{ border: 0, display: 'block' }}
 allowFullScreen=""
 loading="lazy"
 referrerPolicy="no-referrer-when-downgrade"
 ></iframe>
 {(map?.label || map?.address || contactInfo?.address) && (
 <div className="map-label-chip">
 <TbMapPin style={{ marginRight: '6px', flexShrink: 0 }} />
 <span>{map?.label || 'Studio Location'} — {map?.address || contactInfo?.address}</span>
 </div>
 )}
 </div>
 </section>

 {/* 4. FEATURES STRIP — Dynamic from Backend */}
 <section className="contact-features-sec">
 <div className="features-grid">
 {(contactFeatures.length > 0 ? contactFeatures : [
 { _id: 'f1', iconName: 'home', title: 'Personalized Approach', description: 'We listen, understand and design spaces that reflect your lifestyle.' },
 { _id: 'f2', iconName: 'team', title: 'Experienced Team', description: 'Our creative team brings years of expertise and passion to every project.' },
 { _id: 'f3', iconName: 'quality', title: 'Quality & Trust', description: 'We use premium materials and ensure quality in every detail.' },
 { _id: 'f4', iconName: 'clock', title: 'On-time Delivery', description: 'We value your time and deliver projects as promised.' }
 ]).map((feature) => (
 <div key={feature._id} className="feature-item">
 <div className="feature-icon-wrap">
 {feature.iconName === 'home' && (
 <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
 <path d="M24 4L40 10V22C40 32.5 33 40.5 24 44C15 40.5 8 32.5 8 22V10L24 4Z" stroke="#c48b59" strokeWidth="1.5" fill="rgba(196,139,89,0.06)" />
 <path d="M24 8L36 12.8V21.6C36 29.8 30.6 36.1 24 39C17.4 36.1 12 29.8 12 21.6V12.8L24 8Z" stroke="#c48b59" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />
 <path d="M19 30V22H29V30" stroke="#c48b59" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
 <path d="M16 23L24 16L32 23" stroke="#c48b59" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
 </svg>
 )}
 {feature.iconName === 'team' && (
 <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
 <path d="M24 4L40 10V22C40 32.5 33 40.5 24 44C15 40.5 8 32.5 8 22V10L24 4Z" stroke="#c48b59" strokeWidth="1.5" fill="rgba(196,139,89,0.06)" />
 <path d="M24 8L36 12.8V21.6C36 29.8 30.6 36.1 24 39C17.4 36.1 12 29.8 12 21.6V12.8L24 8Z" stroke="#c48b59" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />
 <path d="M17 18H31M17 30H31M20 18V30M24 18V30M28 18V30" stroke="#c48b59" strokeWidth="1.5" strokeLinecap="round" />
 <path d="M15 30H33V32H15V30Z" fill="#c48b59" />
 <path d="M24 14L33 18H15L24 14Z" fill="#c48b59" />
 </svg>
 )}
 {feature.iconName === 'quality' && (
 <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
 <path d="M24 4L40 10V22C40 32.5 33 40.5 24 44C15 40.5 8 32.5 8 22V10L24 4Z" stroke="#c48b59" strokeWidth="1.5" fill="rgba(196,139,89,0.06)" />
 <path d="M24 8L36 12.8V21.6C36 29.8 30.6 36.1 24 39C17.4 36.1 12 29.8 12 21.6V12.8L24 8Z" stroke="#c48b59" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />
 <rect x="17" y="17" width="14" height="14" rx="2" stroke="#c48b59" strokeWidth="1.5" />
 <circle cx="24" cy="24" r="3" stroke="#c48b59" strokeWidth="1.5" />
 </svg>
 )}
 {feature.iconName === 'clock' && (
 <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
 <path d="M24 4L40 10V22C40 32.5 33 40.5 24 44C15 40.5 8 32.5 8 22V10L24 4Z" stroke="#c48b59" strokeWidth="1.5" fill="rgba(196,139,89,0.06)" />
 <path d="M24 8L36 12.8V21.6C36 29.8 30.6 36.1 24 39C17.4 36.1 12 29.8 12 21.6V12.8L24 8Z" stroke="#c48b59" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />
 <circle cx="24" cy="25" r="7" stroke="#c48b59" strokeWidth="1.5" />
 <path d="M24 21V25H27" stroke="#c48b59" strokeWidth="1.5" strokeLinecap="round" />
 <path d="M22 15H26" stroke="#c48b59" strokeWidth="1.5" strokeLinecap="round" />
 </svg>
 )}
 {!['home', 'team', 'quality', 'clock'].includes(feature.iconName) && (
 <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
 <path d="M24 4L40 10V22C40 32.5 33 40.5 24 44C15 40.5 8 32.5 8 22V10L24 4Z" stroke="#c48b59" strokeWidth="1.5" fill="rgba(196,139,89,0.06)" />
 <circle cx="24" cy="24" r="6" stroke="#c48b59" strokeWidth="1.5" />
 <path d="M24 18V24L28 28" stroke="#c48b59" strokeWidth="1.5" strokeLinecap="round" />
 </svg>
 )}
 </div>
 <div className="feature-text">
 <h4>{feature.title}</h4>
 <p>{feature.description}</p>
 </div>
 </div>
 ))}
 </div>
 </section>

 {/* 5. FOLLOW OUR JOURNEY (Backend Connected Section) */}
 <section className="contact-journey-sec">
 <div className="journey-container">
 <div className="journey-left">
 <h2 className="journey-heading">{pageSettings?.journey?.title || 'FOLLOW OUR JOURNEY'}</h2>
 <div className="journey-separator"></div>
 <p className="journey-desc">{pageSettings?.journey?.description || 'Get inspired by our latest projects, behind-the-scenes and design tips.'}</p>
 <div className="journey-socials">
 <a
 href={pageSettings?.journey?.socialLinks?.facebook || '#'}
 target={pageSettings?.journey?.socialLinks?.facebook ? "_blank" : undefined}
 rel="noopener noreferrer"
 title="Facebook"
 >
 <TbBrandFacebook />
 </a>
 <a
 href={pageSettings?.journey?.socialLinks?.instagram || '#'}
 target={pageSettings?.journey?.socialLinks?.instagram ? "_blank" : undefined}
 rel="noopener noreferrer"
 title="Instagram"
 >
 <TbBrandInstagram />
 </a>
 <a
 href={pageSettings?.journey?.socialLinks?.pinterest || '#'}
 target={pageSettings?.journey?.socialLinks?.pinterest ? "_blank" : undefined}
 rel="noopener noreferrer"
 title="Pinterest"
 >
 <TbBrandPinterest />
 </a>
 <a
 href={pageSettings?.journey?.socialLinks?.linkedin || '#'}
 target={pageSettings?.journey?.socialLinks?.linkedin ? "_blank" : undefined}
 rel="noopener noreferrer"
 title="LinkedIn"
 >
 <TbBrandLinkedin />
 </a>
 </div>
 </div>
 <div className="journey-right-grid">
 {(pageSettings?.journey?.images && pageSettings.journey.images.filter(Boolean).length > 0)
 ? pageSettings.journey.images.filter(Boolean).map((imgUrl, idx) => (
 <img key={idx} src={imgUrl} alt={`Journey image ${idx + 1}`} />
 ))
 : journeyGalleryImages.map((item, idx) => (
 <img key={item._id || idx} src={item.src} alt={item.title || `Gallery ${idx + 1}`} />
 ))
 }
 </div>
 </div>
 </section>

 {/* 6. BOTTOM CTA */}
 <section
 className="contact-bottom-cta"
 style={{ background: `linear-gradient(rgba(26, 26, 25, 0.92), rgba(26, 26, 25, 0.92)), url(${heroImageBg}) center/cover no-repeat` }}
 >
 <div className="contact-cta-wrapper">
 <div className="cta-left-box">
 <div className="cta-home-icon"><TbHome /></div>
 <div className="cta-text-content">
 <span className="cta-kicker">HAVE A DESIGN IDEA IN MIND?</span>
 <h2>Let's Bring Your Vision to Life.</h2>
 </div>
 </div>
 <div className="cta-right-box">
 <button className="btn-solid-gold" onClick={handleConsultationClick}>
 BOOK A CONSULTATION <TbArrowRight className="hero-btn-icon" />
 </button>
 </div>
 </div>
 </section>

 <ConsultationModal
 isOpen={isConsultationModalOpen}
 onClose={() => setIsConsultationModalOpen(false)}
 />
 </div>
 );
};

export default Contact;
