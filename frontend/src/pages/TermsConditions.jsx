import React, { useState, useEffect } from 'react';
import {
 TbFileCheck, TbRuler2, TbCoin, TbBuildingSkyscraper,
 TbScale, TbClock, TbAlertCircle, TbArrowRight, TbCircleCheck
} from 'react-icons/tb';
import heroBg from '../assets/hero_bg.png';
import { useAuth } from '../context/AuthContext';
import './LegalPages.css';

const TermsConditions = () => {
 const { openConsultation } = useAuth();
 const [activeSection, setActiveSection] = useState('agreement');

 useEffect(() => {
 const handleScroll = () => {
 const sections = document.querySelectorAll('.legal-section');
 let current = 'agreement';
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
 <span className="section-label">TERMS OF SERVICE</span>
 <h1>Terms & Conditions</h1>
 <p>General terms governing our interior design services, consultations, site executions, and website usage.</p>
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
 <TbFileCheck style={{ color: '#b38058' }} /> Terms Outline
 </div>
 <ul className="legal-toc-list">
 {[
 { id: 'agreement', title: '1. Agreement & Acceptance', num: '1' },
 { id: 'services', title: '2. Design Scope & Services', num: '2' },
 { id: 'payment', title: '3. Fees & Payment Terms', num: '3' },
 { id: 'intellectual', title: '4. Intellectual Property & Drawings', num: '4' },
 { id: 'site-access', title: '5. Site Access & Client Duty', num: '5' },
 { id: 'revisions', title: '6. Revisions & Change Orders', num: '6' },
 { id: 'cancellation', title: '7. Cancellation & Refunds', num: '7' },
 { id: 'liability', title: '8. Liability & Governing Law', num: '8' }
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
 Welcome to <strong>Good Interior Design Studio</strong>. By booking a consultation, signing a design proposal, or utilizing our website, you agree to comply with and be bound by the following Terms & Conditions. Please review them carefully.
 </p>
 </div>

 {/* Section 1 */}
 <section className="legal-section" id="agreement">
 <div className="legal-section-header">
 <div className="legal-section-icon"><TbFileCheck /></div>
 <h2>1. Agreement & Acceptance</h2>
 </div>
 <p>
 These Terms & Conditions constitute a legally binding agreement between you ("Client") and Good Interior Studio ("Studio"). Formal client contracts, signed project proposals, or confirmed consultation bookings inherit these terms unless explicitly modified in writing.
 </p>
 </section>

 {/* Section 2 */}
 <section className="legal-section" id="services">
 <div className="legal-section-header">
 <div className="legal-section-icon"><TbRuler2 /></div>
 <h2>2. Interior Design Scope & Consultations</h2>
 </div>
 <p>
 Our studio provides residential and commercial interior design services, space planning, 3D visualization, material selection, custom joinery design, and project oversight.
 </p>
 <ul>
 <li><TbCircleCheck className="legal-check-icon" /> <strong>Initial Consultations:</strong> Consultations scheduled through our site provide expert guidance, site analysis, and preliminary space recommendations.</li>
 <li><TbCircleCheck className="legal-check-icon" /> <strong>Design Proposals:</strong> Formal design work commences upon signed agreement of the project proposal and receipt of the initial commitment deposit.</li>
 </ul>
 </section>

 {/* Section 3 */}
 <section className="legal-section" id="payment">
 <div className="legal-section-header">
 <div className="legal-section-icon"><TbCoin /></div>
 <h2>3. Fees, Quotations & Payment Schedules</h2>
 </div>
 <p>
 Quotations provided by the Studio remain valid for 30 calendar days from the date of issue.
 </p>
 <div className="legal-card-highlight">
 <h4>Standard Payment Milestones</h4>
 <p>&bull; <strong>Phase 1 (Concept & Layout):</strong> 30% Initial Deposit upon signing.<br />
 &bull; <strong>Phase 2 (3D Renders & Working Drawings):</strong> 40% Progress Payment.<br />
 &bull; <strong>Phase 3 (Final Execution & Handover):</strong> 30% Remaining Balance prior to final site sign-off.</p>
 </div>
 </section>

 {/* Section 4 */}
 <section className="legal-section" id="intellectual">
 <div className="legal-section-header">
 <div className="legal-section-icon"><TbBuildingSkyscraper /></div>
 <h2>4. Intellectual Property & Design Ownership</h2>
 </div>
 <p>
 All 2D floor plans, 3D renderings, CAD drawings, material boards, and architectural concepts created by Good Interior Studio remain the intellectual property of the Studio.
 </p>
 <p>
 Clients are granted an exclusive license to utilize the completed designs solely for the specified property. Designs may not be resold or re-used for other commercial developments without written permission.
 </p>
 </section>

 {/* Section 5 */}
 <section className="legal-section" id="site-access">
 <div className="legal-section-header">
 <div className="legal-section-icon"><TbCircleCheck /></div>
 <h2>5. Site Access & Client Responsibilities</h2>
 </div>
 <p>
 The Client agrees to provide timely site access, necessary building permissions, accurate structural measurements, and clear communication regarding preferences to prevent project delays.
 </p>
 </section>

 {/* Section 6 */}
 <section className="legal-section" id="revisions">
 <div className="legal-section-header">
 <div className="legal-section-icon"><TbAlertCircle /></div>
 <h2>6. Revisions & Change Orders</h2>
 </div>
 <p>
 Each design package includes two (2) complimentary rounds of revisions during the concept and 3D rendering phases. Subsequent revisions or structural changes requested after plan approval will be billed as change orders at standard hourly design rates.
 </p>
 </section>

 {/* Section 7 */}
 <section className="legal-section" id="cancellation">
 <div className="legal-section-header">
 <div className="legal-section-icon"><TbScale /></div>
 <h2>7. Cancellation & Refund Policy</h2>
 </div>
 <p>
 Consultation bookings can be rescheduled up to 24 hours prior to the appointment. Deposit refunds for full interior design projects are subject to work completed up to the cancellation request date.
 </p>
 </section>

 {/* Section 8 */}
 <section className="legal-section" id="liability">
 <div className="legal-section-header">
 <div className="legal-section-icon"><TbScale /></div>
 <h2>8. Limitation of Liability & Governing Law</h2>
 </div>
 <p>
 Good Interior Studio strives for absolute perfection in design execution. These terms are governed by the legal framework of Sri Lanka. Any disputes arising shall be handled with good faith mediation.
 </p>
 </section>

 {/* Contact Callout */}
 <div className="legal-contact-card">
 <div>
 <h3>Need Clarification on Our Terms?</h3>
 <p>Our team is happy to assist with any contract or terms questions.</p>
 </div>
 <button type="button" onClick={() => openConsultation()} className="btn-contact-gold">
 BOOK A CONSULTATION <TbArrowRight />
 </button>
 </div>
 </main>
 </div>
 </div>
 );
};

export default TermsConditions;
