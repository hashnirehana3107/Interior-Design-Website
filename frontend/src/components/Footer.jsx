import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import logo from '../assets/logo.svg';
import { FaFacebookF, FaInstagram, FaPinterestP, FaLinkedinIn, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock } from 'react-icons/fa';

import API_BASE from '../config/api';

const Footer = () => {
    const [services, setServices] = useState([]);
    const [contactInfo, setContactInfo] = useState(null);
    const [socialLinks, setSocialLinks] = useState({
        facebook: '',
        instagram: '',
        pinterest: '',
        linkedin: ''
    });

    const [globalSettings, setGlobalSettings] = useState(null);

    useEffect(() => {
        const fetchFooterData = async () => {
            try {
                const [servRes, contactRes, globalRes] = await Promise.all([
                    fetch(`${API_BASE}/api/services`),
                    fetch(`${API_BASE}/api/contact-settings`),
                    fetch(`${API_BASE}/api/global-settings`)
                ]);

                if (servRes.ok) {
                    const data = await servRes.json();
                    if (data.services && data.services.length > 0) {
                        setServices(data.services);
                    }
                }

                if (contactRes.ok) {
                    const data = await contactRes.json();
                    if (data.settings && data.settings.contactInfo) {
                        setContactInfo(data.settings.contactInfo);
                    }
                    if (data.settings?.journey?.socialLinks) {
                        setSocialLinks(data.settings.journey.socialLinks);
                    }
                }

                if (globalRes.ok) {
                    const data = await globalRes.json();
                    const settingsData = data.settings || data;
                    if (settingsData && (settingsData.siteTitle || settingsData.logoUrl || settingsData.footerCopyright)) {
                        setGlobalSettings(settingsData);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch footer data:", err);
            }
        };
        fetchFooterData();
    }, []);

    return (
        <footer className="site-footer">
            <div className="footer-top">
                <div className="footer-col brand-col">
                    <div className="logo-container footer-logo">
                        {(globalSettings?.logoUrl || logo) && (
                            <div className="logo-mark">
                                <img src={globalSettings?.logoUrl || logo} alt="Good Interior Logo" />
                            </div>
                        )}
                        <div className="logo-text">
                            <span className="logo-title">{globalSettings?.siteTitle || 'GOOD INTERIOR'}</span>
                            <span className="logo-subtitle">{globalSettings?.siteSubtitle || 'DESIGN STUDIO'}</span>
                        </div>
                    </div>
                    <p className="footer-desc">
                        {globalSettings?.footerDesc ? globalSettings.footerDesc.split('\n').map((line, i, arr) => <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>) : <>We design thoughtful interiors that<br />inspire and elevate the way you live.</>}
                    </p>
                    <div className="social-links">
                        {socialLinks.facebook && (
                            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
                        )}
                        {socialLinks.instagram && (
                            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                        )}
                        {socialLinks.pinterest && (
                            <a href={socialLinks.pinterest} target="_blank" rel="noopener noreferrer"><FaPinterestP /></a>
                        )}
                        {socialLinks.linkedin && (
                            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
                        )}
                        {/* Fallback: show placeholder icons if no links are set */}
                        {!socialLinks.facebook && !socialLinks.instagram && !socialLinks.pinterest && !socialLinks.linkedin && (
                            <>
                                <a href="#"><FaFacebookF /></a>
                                <a href="#"><FaInstagram /></a>
                                <a href="#"><FaPinterestP /></a>
                                <a href="#"><FaLinkedinIn /></a>
                            </>
                        )}
                    </div>
                </div>

                <div className="footer-col links-col">
                    <h4>QUICK LINKS</h4>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/services">Services</Link></li>
                        <li><Link to="/portfolio">Portfolio</Link></li>
                        <li><Link to="/testimonials">Testimonials</Link></li>
                        <li><Link to="/blog">Blog</Link></li>
                        <li><Link to="/careers">Careers</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                    </ul>
                </div>

                <div className="footer-col services-col">
                    <h4>SERVICES</h4>
                    <ul>
                        {services.length > 0 ? (
                            services.map((service, idx) => (
                                <li key={service._id || service.serviceId || idx}>
                                    <Link to={`/services#${service._id || service.serviceId || service.id}`}>{service.title}</Link>
                                </li>
                            ))
                        ) : (
                            <>
                                <li><Link to="/services">Interior Design</Link></li>
                                <li><Link to="/services">Interior Architecture</Link></li>
                                <li><Link to="/services">Space Planning</Link></li>
                                <li><Link to="/services">Styling & Décor</Link></li>
                                <li><Link to="/services">Renovation</Link></li>
                                <li><Link to="/services">Consultation</Link></li>
                            </>
                        )}
                    </ul>
                </div>

                <div className="footer-col contact-col">
                    <h4>CONTACT US</h4>
                    <ul className="contact-list">
                        <li>
                            <FaMapMarkerAlt className="contact-icon" />
                            <span dangerouslySetInnerHTML={{ __html: contactInfo?.address?.replace(/,\s*/g, ',<br />') || '123 Design Street, Colombo 05,<br />Sri Lanka' }} />
                        </li>
                        <li>
                            <FaPhoneAlt className="contact-icon" />
                            <span>
                                {contactInfo?.phone1 || '+94 77 123 4567'}
                                {contactInfo?.phone2 && <><br />{contactInfo.phone2}</>}
                            </span>
                        </li>
                        <li>
                            <FaEnvelope className="contact-icon" />
                            <span>
                                {contactInfo?.email1 || 'hello@goodinterior.lk'}
                                {contactInfo?.email2 && <><br />{contactInfo.email2}</>}
                            </span>
                        </li>
                        {(contactInfo?.hoursWeekday || contactInfo?.hoursSaturday || contactInfo?.hoursSunday) && (
                            <li>
                                <FaClock className="contact-icon" />
                                <span>
                                    {contactInfo.hoursWeekday && <>{contactInfo.hoursWeekday}</>}
                                    {contactInfo.hoursSaturday && contactInfo.hoursWeekday && <br />}
                                    {contactInfo.hoursSaturday && <>Sat: {contactInfo.hoursSaturday}</>}
                                    {contactInfo.hoursSunday && (contactInfo.hoursWeekday || contactInfo.hoursSaturday) && <br />}
                                    {contactInfo.hoursSunday && <>Sun/Hol: {contactInfo.hoursSunday}</>}
                                </span>
                            </li>
                        )}

                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>{globalSettings?.footerCopyright || ' 2025 Good Interior. All Rights Reserved.'}</p>
                <div className="footer-bottom-links">
                    <Link to="/privacy">Privacy Policy</Link>
                    <span className="separator">|</span>
                    <Link to="/terms">Terms & Conditions</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
