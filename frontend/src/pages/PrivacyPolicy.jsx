import React, { useState, useEffect } from 'react';
import {
 TbShieldCheck, TbLock, TbFileText, TbUserCheck,
 TbEye, TbCookie, TbMail, TbArrowRight, TbCircleCheck, TbClock
} from 'react-icons/tb';
import heroBg from '../assets/hero_bg.png';
import { useAuth } from '../context/AuthContext';
import './LegalPages.css';

const PrivacyPolicy = () => {
 const { openConsultation } = useAuth();
 const [activeSection, setActiveSection] = useState('overview');

 useEffect(() => {
 const handleScroll = () => {
 const sections = document.querySelectorAll('.legal-section');
 let current = 'overview';
 sections.forEach(section => {
 const sectionTop = section.offsetTop - 150;
 if (window.scrollY >= sectionTop) {
 current = section.getAttribute('id');
 }
 });
 setActiveSection(current);
 };
 window.addEventListener('scroll', handleScroll);
 return () => window.removeEventListener('scroll', handleScroll);
 }, []);

 const scrollToSection = (id) => {
 const el = document.getElementById(id);
 if (el) {
 el.scrollIntoView({ behavior: 'smooth' });
 }
 };

 return (
 <div className="legal-page">
 {/* Hero Section */}
 <section className="legal-hero" style={{ backgroundImage: `url(${heroBg})` }}>
 <div className="legal-hero-overlay">
 <div className="legal-hero-content">
 <span className="section-label">CLIENT CONFIDENTIALITY</span>
 <h1>Privacy Policy</h1>
 <p>How Good Interior Studio protects your personal data, residential architectural plans, and design consultations.</p>
 <div className="legal-meta-badge">
 <TbClock style={{ color: '#d4af37' }} /> Effective Date: January 1, 2025 &bull; Last Updated: September 2026
 </div>
 </div>
 </div>
 </section>

 {/* Container */}
 <div className="legal-container">
 {/* Table of Contents Sidebar */}
 <aside className="legal-toc-sidebar">
 <div className="legal-toc-title">
 <TbFileText style={{ color: '#b38058' }} /> Table of Contents
 </div>
 <ul className="legal-toc-list">
 {[
 { id: 'overview', title: '1. Overview & Commitment', num: '1' },
 { id: 'collection', title: '2. Information We Collect', num: '2' },
 { id: 'use-data', title: '3. How We Use Your Data', num: '3' },
 { id: 'design-privacy', title: '4. Architectural Confidentiality', num: '4' },
 { id: 'data-security', title: '5. Security & Storage', num: '5' },
 { id: 'third-parties', title: '6. Third-Party Partners', num: '6' },
 { id: 'cookies', title: '7. Cookies & Analytics', num: '7' },
 { id: 'your-rights', title: '8. Your Privacy Rights', num: '8' }
 ].map(item => (
 <li key={item.id}>
 <button
 onClick={() => scrollToSection(item.id)}
 className={`legal-toc-link ${activeSection === item.id ? 'active' : ''}`}
 style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
 >
 <span className="legal-toc-num">{item.num}</span>
 <span>{item.title}</span>
 </button>
 </li>
 ))}
 </ul>
 </aside>

 {/* Main Content Area */}
 <main className="legal-content">
 <div className="legal-intro-box">
 <p>
 At <strong>Good Interior Design Studio</strong>, we treat your privacy and residential confidentiality with the same care and precision we bring to our bespoke interior spaces. This Privacy Policy outlines the standards we uphold when handling your personal information, design requirements, and architectural documents.
 </p>
 </div>

 {/* Section 1 */}
 <section className="legal-section" id="overview">
 <div className="legal-section-header">
 <div className="legal-section-icon"><TbShieldCheck /></div>
 <h2>1. Overview & Commitment</h2>
 </div>
 <p>
 Good Interior Studio ("we", "our", or "us") operates the website and provides professional interior design, architectural planning, space styling, and consultation services. We are committed to maintaining the trust of our clients by securing all personal data shared with us.
 </p>
 <p>
 By interacting with our website, booking design consultations, or engaging our studio for residential or commercial interior projects, you consent to the practices described in this policy.
 </p>
 </section>

 {/* Section 2 */}
 <section className="legal-section" id="collection">
 <div className="legal-section-header">
 <div className="legal-section-icon"><TbUserCheck /></div>
 <h2>2. Information We Collect</h2>
 </div>
 <p>
 To deliver tailored interior design solutions, we collect specific categories of personal and project information:
 </p>
 <ul>
 <li><TbCircleCheck className="legal-check-icon" /> <strong>Identity & Contact Details:</strong> Full name, email address, phone number, and delivery or project site location.</li>
 <li><TbCircleCheck className="legal-check-icon" /> <strong>Design Preferences & Project Scope:</strong> Architectural floor plans, space dimensions, moodboard inputs, budget ranges, and lifestyle preferences.</li>
 <li><TbCircleCheck className="legal-check-icon" /> <strong>Consultation Bookings:</strong> Requested appointment dates, selected interior service types, and initial site notes.</li>
 <li><TbCircleCheck className="legal-check-icon" /> <strong>Financial Transactions:</strong> Payment receipts, invoice details, and deposit records processed securely via certified payment gateways.</li>
 </ul>
 </section>

 {/* Section 3 */}
 <section className="legal-section" id="use-data">
 <div className="legal-section-header">
 <div className="legal-section-icon"><TbEye /></div>
 <h2>3. How We Use Your Information</h2>
 </div>
 <p>
 Your information is exclusively used to provide exceptional design experiences and execute your project seamlessly:
 </p>
 <div className="legal-card-highlight">
 <h4>Primary Purposes</h4>
 <p>&bull; Preparing custom 2D/3D interior renderings and architectural layouts.<br />
 &bull; Coordinating site visits, contractor installations, and material deliveries.<br />
 &bull; Communicating project updates, timelines, and invoice milestones.</p>
 </div>
 </section>

 {/* Section 4 */}
 <section className="legal-section" id="design-privacy">
 <div className="legal-section-header">
 <div className="legal-section-icon"><TbLock /></div>
 <h2>4. Architectural & Residence Privacy</h2>
 </div>
 <p>
 We understand that your home is a personal sanctuary. All floor plans, structural layouts, and private residence photographs provided by clients remain strictly confidential.
 </p>
 <p>
 Before publishing completed project photography on our portfolio or social channels, we always obtain explicit client approval. Clients have the absolute right to request anonymous publication (omitting location details and family names).
 </p>
 </section>

 {/* Section 5 */}
 <section className="legal-section" id="data-security">
 <div className="legal-section-header">
 <div className="legal-section-icon"><TbLock /></div>
 <h2>5. Data Security & Storage</h2>
 </div>
 <p>
 We implement enterprise-grade technical and organizational measures to safeguard your personal data against unauthorized access, loss, or alteration. All client files and CAD drawings are stored on encrypted cloud servers accessible only by authorized studio personnel.
 </p>
 </section>

 {/* Section 6 */}
 <section className="legal-section" id="third-parties">
 <div className="legal-section-header">
 <div className="legal-section-icon"><TbShieldCheck /></div>
 <h2>6. Third-Party Partners</h2>
 </div>
 <p>
 We never sell or rent your personal information to third parties. We share limited, necessary details with trusted partners solely to fulfill your interior project:
 </p>
 <ul>
 <li><TbCircleCheck className="legal-check-icon" /> Subcontractors & Joinery Artisans for custom furniture manufacturing.</li>
 <li><TbCircleCheck className="legal-check-icon" /> Delivery & Logistics partners for furniture delivery to your site.</li>
 <li><TbCircleCheck className="legal-check-icon" /> Secure Cloud Hosting & Payment Processing vendors.</li>
 </ul>
 </section>

 {/* Section 7 */}
 <section className="legal-section" id="cookies">
 <div className="legal-section-header">
 <div className="legal-section-icon"><TbCookie /></div>
 <h2>7. Cookies & Analytics</h2>
 </div>
 <p>
 Our website uses essential cookies to ensure smooth navigation and analyze general visitor traffic patterns to enhance our digital showroom experience. You can manage or disable cookie preferences directly in your web browser settings.
 </p>
 </section>

 {/* Section 8 */}
 <section className="legal-section" id="your-rights">
 <div className="legal-section-header">
 <div className="legal-section-icon"><TbMail /></div>
 <h2>8. Your Privacy Rights</h2>
 </div>
 <p>
 You hold the right to access, update, or request the deletion of your personal data from our records at any time. For any privacy queries or formal requests, please contact our privacy compliance team.
 </p>
 </section>

 {/* Contact Callout */}
 <div className="legal-contact-card">
 <div>
 <h3>Have Questions About Your Privacy?</h3>
 <p>Our studio team is available to assist with any data protection queries.</p>
 </div>
 <button type="button" onClick={() => openConsultation()} className="btn-contact-gold">
 GET IN TOUCH <TbArrowRight />
 </button>
 </div>
 </main>
 </div>
 </div>
 );
};

export default PrivacyPolicy;
