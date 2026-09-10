import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiShieldOff, FiLock } from 'react-icons/fi';

const AdminRoute = ({ children }) => {
 const { user, token } = useAuth();

 // Check if logged in and has admin role
 if (!token || !user) {
 return <Navigate to="/login" replace />;
 }

 if (user.role !== 'admin') {
 return (
 <div style={{
 minHeight: '70vh',
 display: 'flex',
 flexDirection: 'column',
 alignItems: 'center',
 justifyContent: 'center',
 backgroundColor: '#0f1115',
 color: '#ffffff',
 textAlign: 'center',
 padding: '40px 20px',
 fontFamily: 'Montserrat, sans-serif'
 }}>
 <div style={{
 background: 'rgba(239, 68, 68, 0.1)',
 border: '1px solid rgba(239, 68, 68, 0.3)',
 padding: '20px',
 borderRadius: '50%',
 marginBottom: '20px',
 color: '#ef4444',
 fontSize: '2.5rem',
 display: 'inline-flex'
 }}>
 <FiShieldOff />
 </div>
 <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '2rem', marginBottom: '10px' }}>Access Denied</h2>
 <p style={{ color: '#9ca3af', maxWidth: '480px', marginBottom: '24px', lineHeight: '1.6' }}>
 You do not have Administrator permissions to access the Control Panel. Please log in with an official Administrator account.
 </p>
 <div style={{ display: 'flex', gap: '14px' }}>
 <a href="/" style={{
 background: 'transparent',
 border: '1px solid rgba(255, 255, 255, 0.2)',
 color: '#ffffff',
 padding: '12px 24px',
 borderRadius: '8px',
 textDecoration: 'none',
 fontWeight: '600'
 }}>Return Home</a>
 <a href="/login" style={{
 background: '#b38058',
 color: '#ffffff',
 padding: '12px 24px',
 borderRadius: '8px',
 textDecoration: 'none',
 fontWeight: '600'
 }}>Log In as Admin</a>
 </div>
 </div>
 );
 }

 return children;
};

export default AdminRoute;
