import React, { useState, useEffect, useCallback } from 'react';
import { IoClose } from 'react-icons/io5';
import { MdOutlineEmail, MdOutlineMarkEmailRead } from 'react-icons/md';
import { BsArrowRight } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';
import './ForgotPasswordModal.css';

/**
 * ForgotPasswordModal — Popup modal for password recovery.
 */
const ForgotPasswordModal = ({ isOpen, onClose }) => {
 const { showToast } = useAuth();
 const [email, setEmail] = useState('');
 const [isSubmitted, setIsSubmitted] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);

 const [errorMsg, setErrorMsg] = useState('');

 useEffect(() => {
 if (isOpen) {
 setEmail('');
 setErrorMsg('');
 setIsSubmitted(false);
 setIsSubmitting(false);
 }
 }, [isOpen]);

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

 const handleSubmit = (e) => {
 e.preventDefault();
 setErrorMsg('');
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 if (!email.trim() || !emailRegex.test(email.trim())) {
 setErrorMsg('Please enter a valid email address.');
 if (showToast) showToast('Please complete all required fields.', 'error');
 return;
 }

 setIsSubmitting(true);

 setTimeout(() => {
 setIsSubmitting(false);
 setIsSubmitted(true);
 if (showToast) {
 showToast(`${email}`, 'success', 5000);
 }
 }, 700);
 };


 return (
 <div className="fpm-backdrop" onClick={onClose}>
 <div className="fpm-container" onClick={(e) => e.stopPropagation()}>

 {/* Close Button */}
 <button className="fpm-close-btn" onClick={onClose} aria-label="Close modal">
 <IoClose />
 </button>

 {!isSubmitted ? (
 <>
 <div className="fpm-header">
 <div className="fpm-icon-badge">
 <MdOutlineEmail />
 </div>
 <h2 className="fpm-title">Forgot Password?</h2>
 <p className="fpm-subtitle">
 Don't worry! Enter your registered email address below and we'll send you instructions to reset your password.
 </p>
 </div>

 <form className="fpm-form" onSubmit={handleSubmit} noValidate>
 <div className="fpm-input-group">
 <label>Registered Email Address</label>
 <div className="fpm-input-wrapper">
 <MdOutlineEmail className="fpm-input-icon" />
 <input
 type="email"
 placeholder="e.g. alex@example.com"
 className={errorMsg ? 'input-has-error' : ''}
 value={email}
 onChange={(e) => {
 setEmail(e.target.value);
 if (errorMsg) setErrorMsg('');
 }}
 />
 </div>
 {errorMsg && (
 <span className="form-field-error-msg">️ {errorMsg}</span>
 )}
 </div>


 <button type="submit" className="fpm-submit-btn" disabled={isSubmitting}>
 {isSubmitting ? 'SENDING RESET LINK...' : <>SEND RESET LINK <BsArrowRight /></>}
 </button>
 </form>
 </>
 ) : (
 /* Success Confirmation State */
 <div className="fpm-success-view">
 <div className="fpm-success-badge">
 <MdOutlineMarkEmailRead />
 </div>
 <h3>Password Reset Link Sent!</h3>
 <p>
 We have sent a password reset link to:
 </p>
 <div className="fpm-email-highlight">{email}</div>
 <p className="fpm-instructions">
 Please check your inbox (and spam/junk folder). Click the link in the email to set a new password for your account.
 </p>
 <button className="fpm-submit-btn" onClick={onClose}>
 RETURN TO LOG IN
 </button>
 </div>
 )}

 </div>
 </div>
 );
};

export default ForgotPasswordModal;
