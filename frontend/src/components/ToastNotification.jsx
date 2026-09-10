import React from 'react';
import { IoCheckmarkCircle, IoAlertCircle, IoInformationCircle, IoClose } from 'react-icons/io5';
import './ToastNotification.css';

const ToastNotification = ({ toast, onClose }) => {
 if (!toast) return null;

 const { type, message } = toast;

 const renderIcon = () => {
 switch (type) {
 case 'success':
 return <IoCheckmarkCircle className="toast-icon success" />;
 case 'error':
 return <IoAlertCircle className="toast-icon error" />;
 case 'info':
 default:
 return <IoInformationCircle className="toast-icon info" />;
 }
 };

 return (
 <div className={`toast-notification-wrapper ${type}`}>
 <div className="toast-content">
 {renderIcon()}
 <span className="toast-message">{message}</span>
 </div>
 <button className="toast-close-btn" onClick={onClose} aria-label="Close notification">
 <IoClose />
 </button>
 </div>
 );
};

export default ToastNotification;
