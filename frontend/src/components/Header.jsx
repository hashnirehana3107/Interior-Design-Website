import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { FaBars, FaTimes } from 'react-icons/fa';
import { FiUser, FiLogOut, FiChevronDown, FiShield } from 'react-icons/fi';

import { useAuth } from '../context/AuthContext';
import API_BASE from '../config/api';

const Header = () => {
    const { user, isAuthenticated, logout, openConsultation } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const [globalSettings, setGlobalSettings] = useState(null);

    useEffect(() => {
        const fetchGlobalSettings = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/global-settings`);
                const data = await res.json();
                if (res.ok) {
                    const settingsData = data.settings || data;
                    if (settingsData && (settingsData.siteTitle || settingsData.logoUrl || settingsData.footerCopyright)) {
                        setGlobalSettings(settingsData);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch global settings:", err);
            }
        };
        fetchGlobalSettings();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleJoinUsClick = (e) => {
        e.preventDefault();
        closeMobileMenu();
        navigate('/login');
    };

    const handleNavigateProfile = () => {
        setIsProfileDropdownOpen(false);
        closeMobileMenu();
        navigate('/profile');
    };

    const handleLogoutClick = () => {
        setIsProfileDropdownOpen(false);
        closeMobileMenu();
        logout();
        navigate('/');
    };

    const userFirstName = user?.fullName?.split(' ')[0] || 'User';

    return (
        <header className="site-header">
            <div className="header-inner">
                <Link to="/" className="logo-container" onClick={closeMobileMenu}>
                    {(globalSettings?.logoUrl || logo) && (
                        <div className="logo-mark">
                            <img src={globalSettings?.logoUrl || logo} alt="Good Interior" />
                        </div>
                    )}
                    <div className="logo-text">
                        <span className="logo-title">{globalSettings?.siteTitle || 'GOOD INTERIOR'}</span>
                        <span className="logo-subtitle">{globalSettings?.siteSubtitle || 'DESIGN STUDIO'}</span>
                    </div>
                </Link>

                <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
                    {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                </div>

                <nav className={`main-nav ${isMobileMenuOpen ? 'active' : ''}`}>
                    <ul>
                        <li><NavLink to="/" onClick={closeMobileMenu}>HOME</NavLink></li>
                        <li><NavLink to="/about" onClick={closeMobileMenu}>ABOUT</NavLink></li>
                        <li><NavLink to="/services" onClick={closeMobileMenu}>SERVICES</NavLink></li>
                        <li><NavLink to="/portfolio" onClick={closeMobileMenu}>PORTFOLIO</NavLink></li>
                        <li><NavLink to="/galleries" onClick={closeMobileMenu}>GALLERIES</NavLink></li>
                        <li><NavLink to="/testimonials" onClick={closeMobileMenu}>TESTIMONIALS</NavLink></li>
                        <li><NavLink to="/blog" onClick={closeMobileMenu}>BLOG</NavLink></li>
                        <li><NavLink to="/contact" onClick={closeMobileMenu}>CONTACT</NavLink></li>

                        {/* Mobile Only Auth Links */}
                        {!isAuthenticated ? (
                            <li className="mobile-only-link">
                                <NavLink to="/login" onClick={closeMobileMenu}>LOG IN</NavLink>
                            </li>
                        ) : (
                            <>
                                <li className="mobile-only-link">
                                    {user?.role === 'admin' ? (
                                        <button className="btn-mobile-profile" onClick={() => { closeMobileMenu(); navigate('/admin'); }}>
                                            <FiShield /> ADMIN PANEL
                                        </button>
                                    ) : (
                                        <button className="btn-mobile-profile" onClick={handleNavigateProfile}>
                                            <FiUser /> MY PROFILE ({userFirstName})
                                        </button>
                                    )}
                                </li>
                                <li className="mobile-only-link">
                                    <button className="btn-mobile-logout" onClick={handleLogoutClick}>
                                        <FiLogOut /> LOG OUT
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>

                <div className="header-action">
                    {!isAuthenticated ? (
                        <Link to="/login" className="btn-login-outline nav-hide-sm" onClick={closeMobileMenu}>
                            LOG IN
                        </Link>
                    ) : (
                        /* User Profile Dropdown Pill (Matches user mockup image) */
                        <div className="user-dropdown-wrapper" ref={dropdownRef}>
                            <button
                                className={`user-profile-pill ${isProfileDropdownOpen ? 'active' : ''}`}
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                aria-label="User Menu"
                            >
                                <div className="user-pill-avatar">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt={userFirstName} className="pill-avatar-img" />
                                    ) : (
                                        <span>{userFirstName.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <span className="user-pill-name">{userFirstName}</span>
                                <div className="user-pill-icon">
                                    <FiChevronDown className={`chevron-icon ${isProfileDropdownOpen ? 'rotated' : ''}`} />
                                </div>
                            </button>

                            {/* Dropdown Menu Popup */}
                            {isProfileDropdownOpen && (
                                <div className="user-dropdown-menu">
                                    <div className="dropdown-user-header">
                                        <div className="dropdown-avatar-circle">
                                            {user?.avatar ? (
                                                <img src={user.avatar} alt={userFirstName} className="dropdown-avatar-img" />
                                            ) : (
                                                userFirstName.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="dropdown-user-info">
                                            <div className="dropdown-user-name">{user?.fullName}</div>
                                            <div className="dropdown-user-email">{user?.email}</div>
                                            <div className="dropdown-user-badge">
                                                <FiShield /> Verified Member
                                            </div>

                                        </div>
                                    </div>

                                    <div className="dropdown-divider"></div>

                                    {user?.role === 'admin' ? (
                                        <button className="dropdown-item" onClick={() => { setIsProfileDropdownOpen(false); navigate('/admin'); }}>
                                            <FiShield className="dropdown-item-icon" />
                                            <span>Admin Dashboard</span>
                                        </button>
                                    ) : (
                                        <button className="dropdown-item" onClick={handleNavigateProfile}>
                                            <FiUser className="dropdown-item-icon" />
                                            <span>My Profile</span>
                                        </button>
                                    )}

                                    <button className="dropdown-item dropdown-logout-item" onClick={handleLogoutClick}>
                                        <FiLogOut className="dropdown-item-icon" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <button onClick={handleJoinUsClick} className="btn-join-us">
                        JOIN US
                    </button>
                </div>
            </div>
        </header>
    );
};



export default Header;

