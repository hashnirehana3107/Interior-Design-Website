import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BsArrowRight } from 'react-icons/bs';
import { RiSofaLine, RiMacbookLine, RiRestaurantLine, RiStackLine } from 'react-icons/ri';
import { MdOutlineBed, MdOutlineKitchen } from 'react-icons/md';
import { TbLayoutBoard, TbLamp } from 'react-icons/tb';
import { BiMessageRoundedDots, BiBulb, BiFile, BiCog, BiCheck, BiDiamond, BiStar, BiBadgeCheck, BiTimeFive } from 'react-icons/bi';
import { ImQuotesLeft } from 'react-icons/im';

import heroBg from '../assets/hero_bg.png';
import aboutImg from '../assets/about_img.png';
import detailImg from '../assets/detail_img.png';
import { servicesData } from '../data/servicesData';
import ServiceCard from '../components/ServiceCard';
import { useAuth } from '../context/AuthContext';
import './Services.css';

import API_BASE from '../config/api';

const defaultProcessSteps = [
 { stepNumber: '01', title: 'Initial Consultation', description: 'We listen to your ideas, needs and vision.', iconName: 'chat' },
 { stepNumber: '02', title: 'Concept & Design', description: 'Our team creates tailored design concepts.', iconName: 'bulb' },
 { stepNumber: '03', title: 'Planning & Selection', description: 'Detailed plans, materials and finishes are finalized.', iconName: 'file' },
 { stepNumber: '04', title: 'Execution', description: 'We bring the design to life with precision.', iconName: 'cog' },
 { stepNumber: '05', title: 'Final Reveal', description: 'Your dream space, ready to enjoy.', iconName: 'check' }
];

const defaultWhyFeatures = [
 { title: 'Creative Solutions', description: 'Unique designs tailored to your needs.', iconName: 'diamond' },
 { title: 'Expert Team', description: 'Skilled professionals with proven experience.', iconName: 'star' },
 { title: 'Quality Assurance', description: 'Premium materials and attention to detail.', iconName: 'badge' },
 { title: 'On-Time Delivery', description: 'We value your time and deliver as promised.', iconName: 'time' }
];

const renderProcessIcon = (iconName) => {
 switch (iconName) {
 case 'chat': return <BiMessageRoundedDots />;
 case 'bulb': return <BiBulb />;
 case 'file': return <BiFile />;
 case 'cog': return <BiCog />;
 case 'check': return <BiCheck />;
 case 'diamond': return <BiDiamond />;
 case 'star': return <BiStar />;
 default: return <BiMessageRoundedDots />;
 }
};

const renderWhyIcon = (iconName) => {
 switch (iconName) {
 case 'diamond': return <BiDiamond className="why-feature-icon" />;
 case 'star': return <BiStar className="why-feature-icon" />;
 case 'badge': return <BiBadgeCheck className="why-feature-icon" />;
 case 'time': return <BiTimeFive className="why-feature-icon" />;
 case 'bulb': return <BiBulb className="why-feature-icon" />;
 case 'check': return <BiCheck className="why-feature-icon" />;
 case 'cog': return <BiCog className="why-feature-icon" />;
 default: return <BiDiamond className="why-feature-icon" />;
 }
};

const Services = () => {
 const { openConsultation } = useAuth();
 const [heroData, setHeroData] = useState(null);
 const [servicesList, setServicesList] = useState(servicesData);
 const [processSteps, setProcessSteps] = useState(defaultProcessSteps);
 const [whyFeatures, setWhyFeatures] = useState(defaultWhyFeatures);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchServicePageData = async () => {
 try {
 const [heroRes, servRes, procRes, whyRes] = await Promise.all([
 fetch(`${API_BASE}/api/services/hero`),
 fetch(`${API_BASE}/api/services`),
 fetch(`${API_BASE}/api/services/process`),
 fetch(`${API_BASE}/api/services/why-features`)
 ]);

 if (heroRes && heroRes.ok) {
 const heroJson = await heroRes.json();
 setHeroData(heroJson.hero);
 }

 if (servRes && servRes.ok) {
 const servJson = await servRes.json();
 if (servJson.services && servJson.services.length > 0) {
 setServicesList(servJson.services);
 } else {
 setServicesList(servicesData);
 }
 }

 if (procRes && procRes.ok) {
 const procJson = await procRes.json();
 if (procJson.steps && procJson.steps.length > 0) {
 setProcessSteps(procJson.steps);
 }
 }

 if (whyRes && whyRes.ok) {
 const whyJson = await whyRes.json();
 if (whyJson.features && whyJson.features.length > 0) {
 setWhyFeatures(whyJson.features);
 }
 }
 } catch (err) {
 console.error('Failed to fetch services page data:', err);
 setServicesList(servicesData);
 } finally {
 setLoading(false);
 }
 };

 fetchServicePageData();
 }, []);

 const heroImage = heroData?.bgImage || heroBg;
 const heroTitleHtml = heroData?.title || 'Comprehensive<br /><span class="highlight-text">Interior Design</span> Services';

 return (
 <div className="services-page">
 {/* 1. Hero Section */}
 <section className="services-hero" style={{ backgroundImage: `url(${heroImage})` }}>
 <div className="services-hero-overlay">
 <div className="services-hero-content">
 <span className="section-label">{heroData?.kicker || 'OUR SERVICES'}</span>
 <h1 dangerouslySetInnerHTML={{ __html: heroTitleHtml }}></h1>
 <p dangerouslySetInnerHTML={{ __html: heroData?.subtitle || 'From concept to completion, we offer a full range of interior<br />design services tailored to your unique needs.' }}></p>
 </div>
 </div>
 </section>

 {/* 2. What We Offer (Service Grid) */}
 <section className="services-offer-section">
 <div className="services-offer-header">
 <div className="offer-header-left">
 <span className="section-subtitle">{heroData?.offerKicker || 'WHAT WE OFFER'}</span>
 <h2>{heroData?.offerTitle || 'Our Interior Design Services'}</h2>
 </div>
 <div className="offer-header-right">
 <p>{heroData?.offerDesc || 'We provide end-to-end interior design solutions, combining creativity, functionality and attention to detail to create spaces that truly feel like home.'}</p>
 </div>
 </div>

 <div className="services-grid">
 {servicesList.map((serviceItem) => (
 <ServiceCard
 key={serviceItem._id || serviceItem.serviceId || serviceItem.title}
 service={serviceItem}
 />
 ))}
 </div>
 </section>

 {/* 3. Our Process */}
 <section className="services-process-section">
 <div className="process-header">
 <div className="process-header-left">
 <span className="dark-section-subtitle">{heroData?.processKicker || 'OUR PROCESS'}</span>
 <h2>{heroData?.processTitle || 'A Simple & Transparent Process'}</h2>
 </div>
 <div className="process-header-right">
 <p>{heroData?.processDesc || 'We follow a structured process to ensure a smooth, enjoyable and successful design experience.'}</p>
 </div>
 </div>

 <div className="process-timeline">
 {processSteps.map((step, index) => (
 <React.Fragment key={step._id || index}>
 <div className="process-step">
 <div className="process-icon">{renderProcessIcon(step.iconName)}</div>
 <div className="process-info">
 <h4>{step.stepNumber}</h4>
 <h5>{step.title}</h5>
 <p>{step.description}</p>
 </div>
 {index < processSteps.length - 1 && <BsArrowRight className="process-arrow" />}
 </div>
 </React.Fragment>
 ))}
 </div>
 </section>

 {/* 4. Why Choose Us */}
 <section className="services-why-section">
 <div className="why-left-col">
 <span className="section-subtitle">{heroData?.whyKicker || 'WHY CHOOSE US'}</span>
 <h2 dangerouslySetInnerHTML={{ __html: heroData?.whyTitle || 'More Than Design.<br />A Better Way of Living.' }} />
 <p className="why-desc">{heroData?.whyDesc || 'We combine creativity, expertise and a client-focused approach to deliver interiors that inspire and endure.'}</p>

 <div className="why-features-grid">
 {whyFeatures.map((feat, idx) => (
 <div className="why-feature" key={feat._id || idx}>
 {renderWhyIcon(feat.iconName)}
 <h4>{feat.title}</h4>
 <p>{feat.description}</p>
 </div>
 ))}
 </div>
 </div>
 <div className="why-right-col">
 <div className="why-img-container">
 <img src={heroData?.whyImage || aboutImg} alt="Interior Setup" />
 <div className="quote-box">
 <ImQuotesLeft className="quote-icon-mark" />
 <h3>{heroData?.whyQuote || 'Good design creates spaces where life happens beautifully.'}</h3>
 <span className="quote-author" dangerouslySetInnerHTML={{ __html: heroData?.whyQuoteAuthor ? heroData.whyQuoteAuthor.replace(/\n/g, '<br />') : 'GOOD INTERIOR<br /><span>DESIGN STUDIO</span>' }} />
 </div>
 </div>
 </div>
 </section>

 {/* 5. CTA Section */}
 <section className="services-cta-section" style={{ backgroundImage: `url(${heroImage})` }}>
 <div className="services-cta-overlay">
 <span className="cta-subtitle">READY TO TRANSFORM YOUR SPACE?</span>
 <h2>Let's Create Something Beautiful Together.</h2>
 <div className="cta-buttons">
 <button type="button" onClick={() => openConsultation()} className="btn-solid-gold">
 BOOK A CONSULTATION <BsArrowRight className="btn-icon" />
 </button>
 </div>
 </div>
 </section>
 </div>
 );
};

export default Services;
