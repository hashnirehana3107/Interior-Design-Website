import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import ToastNotification from '../components/ToastNotification';
import ConsultationModal from '../components/ConsultationModal';
import API_BASE from '../config/api';

const AuthContext = createContext();

const sanitizeUserData = (u) => {
    if (!u) return null;
    const cleanUser = { ...u };
    if (cleanUser.phone && cleanUser.phone.includes('@')) {
        cleanUser.phone = '';
    }
    return cleanUser;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            if (!savedUser) return null;
            const parsed = JSON.parse(savedUser);
            return sanitizeUserData(parsed);
        } catch (e) {
            return null;
        }
    });
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [isConsultationOpen, setIsConsultationOpen] = useState(false);
    const [consultationService, setConsultationService] = useState('');

    const API_BASE_URL = `${API_BASE}/api/auth`;

    const showToast = useCallback((message, type = 'success', duration = 4000) => {
        setToast({ message, type });
        if (duration > 0) {
            setTimeout(() => {
                setToast(null);
            }, duration);
        }
    }, []);

    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    const openConsultation = useCallback((serviceName = '') => {
        setConsultationService(serviceName);
        setIsConsultationOpen(true);
    }, []);

    const closeConsultation = useCallback(() => {
        setIsConsultationOpen(false);
    }, []);


    // Verify token on mount
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const cleanUser = sanitizeUserData(data.user);
                    setUser(cleanUser);
                    localStorage.setItem('user', JSON.stringify(cleanUser));
                } else {
                    // Invalid token
                    logout(false); // don't show toast on initial silent token expiration check
                }
            } catch (err) {
                console.error('Auth verification error:', err);
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [token]);


    const register = async (userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.message || 'Registration failed.';
                showToast(`${errorMessage}`, 'error');
                throw new Error(errorMessage);
            }

            const cleanUser = sanitizeUserData(data.user);
            // Save session
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(cleanUser));
            setToken(data.token);
            setUser(cleanUser);

            showToast(`Account created successfully! Welcome to Good Interior, ${cleanUser.fullName.split(' ')[0]}!`, 'success', 5000);

            return data;
        } catch (error) {
            throw error;
        }
    };

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.message || 'Login failed. Invalid credentials.';
                showToast(`${errorMessage}`, 'error');
                throw new Error(errorMessage);
            }

            const cleanUser = sanitizeUserData(data.user);
            // Save session
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(cleanUser));
            setToken(data.token);
            setUser(cleanUser);

            showToast(`Logged in successfully! Welcome back, ${cleanUser.fullName.split(' ')[0]}.`, 'success', 4000);

            return data;
        } catch (error) {
            throw error;
        }
    };

    const loginWithGoogle = async (googleData = {}) => {
        try {
            const payload = {
                credential: googleData.credential || null,
                email: googleData.email || '',
                fullName: googleData.fullName || '',
                googleId: googleData.googleId || ''
            };

            const response = await fetch(`${API_BASE_URL}/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.message || 'Google authentication failed.';
                showToast(`${errorMessage}`, 'error');
                throw new Error(errorMessage);
            }

            const cleanUser = sanitizeUserData(data.user);
            // Save session
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(cleanUser));
            setToken(data.token);
            setUser(cleanUser);

            showToast(`Logged in with Google! Welcome, ${cleanUser.fullName.split(' ')[0]}.`, 'success', 4000);

            return data;
        } catch (error) {
            throw error;
        }
    };


    const updateProfile = async (updatedData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.message || 'Profile update failed.';
                showToast(`${errorMessage}`, 'error');
                throw new Error(errorMessage);
            }

            // Update user state & localStorage
            const cleanUser = sanitizeUserData(data.user);
            localStorage.setItem('user', JSON.stringify(cleanUser));
            setUser(cleanUser);

            showToast(`!`, 'success', 4000);

            return data;
        } catch (error) {
            throw error;
        }
    };

    const logout = (notify = true) => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken('');
        setUser(null);
        if (notify) {
            showToast('Logged out successfully. Have a great day!', 'info', 3500);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated: !!user,
            loading,
            register,
            login,
            loginWithGoogle,
            updateProfile,
            logout,
            showToast,
            hideToast,
            openConsultation,
            closeConsultation,
            isConsultationOpen
        }}>


            {children}
            <ToastNotification toast={toast} onClose={hideToast} />
            <ConsultationModal
                isOpen={isConsultationOpen}
                onClose={closeConsultation}
                initialService={consultationService}
            />
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);


