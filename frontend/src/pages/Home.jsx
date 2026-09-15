import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    FaArrowRight, FaPlayCircle, FaPaintBrush, FaGem,
    FaRegClock, FaUserCheck, FaDraftingCompass,
    FaHome, FaTools, FaQuoteLeft, FaRegBuilding,
    FaArrowLeft, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { RiSofaLine, RiStackLine } from 'react-icons/ri';
import { TbLayoutBoard } from 'react-icons/tb';
import { MdOutlineBed } from 'react-icons/md';
import './Home.css';
import API_BASE from '../config/api';


import heroBg from '../assets/hero_bg.png';
import aboutImg from '../assets/about_img.png';
import detailImg from '../assets/detail_img.png';
import heroPng from '../assets/hero.png';
import ProjectCard from '../components/ProjectCard';
import ServiceCard from '../components/ServiceCard';
import { projectsData } from '../data/projectsData';
import { servicesData } from '../data/servicesData';
import { useAuth } from '../context/AuthContext';

const fallbackHeroSlides = [
    {
        image: heroBg,
        kicker: 'INTERIORS THAT REFLECT YOU',
        title: 'Designing Interiors That Inspire Living',
        subtitle: 'We create beautiful, functional and timeless spaces that reflect your style and enhance everyday living.',
    },
    {
        image: aboutImg,
        kicker: 'CRAFTED WITH PASSION',
        title: 'Spaces That Tell Your Unique Story',
        subtitle: 'Every room we design is a reflection of who you are — elegant, personal, and truly unforgettable.',
    },
    {
        image: detailImg,
        kicker: 'LUXURY IN EVERY DETAIL',
        title: 'Premium Design, Timeless Elegance',
        subtitle: 'We blend creativity and craftsmanship to create interiors that are as beautiful as they are functional.',
    },
    {
        image: heroPng,
        kicker: 'YOUR DREAM SPACE AWAITS',
        title: 'Transform Your Home Into a Masterpiece',
        subtitle: 'From concept to completion, we guide you every step of the way to deliver your perfect living space.',
    },
];

const Home = () => {
    const { openConsultation } = useAuth();
    const [slides, setSlides] = useState(fallbackHeroSlides);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [prevSlide, setPrevSlide] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [projects, setProjects] = useState([]);
    const [services, setServices] = useState([]);
    const [homeSettings, setHomeSettings] = useState(null);
    const [topTestimonials, setTopTestimonials] = useState([]);
    const [currentTestiIdx, setCurrentTestiIdx] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/hero-slides');
                if (res.ok) {
                    const data = await res.json();
                    if (data.slides && data.slides.length > 0) {
                        setSlides(data.slides);
                    }
                }
            } catch (err) {
                console.warn('Hero slides API unavailable, using fallbacks:', err.message);
            }
            try {
                const projRes = await fetch(`${API_BASE}/api/projects`);
                if (projRes.ok) {
                    const projData = await projRes.json();
                    if (projData) setProjects(projData.projects || []);
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
            try {
                const servRes = await fetch(`${API_BASE}/api/services`);
                if (servRes.ok) {
                    const servData = await servRes.json();
                    if (servData.services && servData.services.length > 0) {
                        setServices(servData.services);
                    } else {
                        setServices(servicesData);
                    }
                }
            } catch (error) {
                console.error('Error fetching services:', error);
                setServices(servicesData);
            }
            try {
                const settingsRes = await fetch(`${API_BASE}/api/home-settings`);
                if (settingsRes.ok) {
                    const data = await settingsRes.json();
                    if (data.settings) setHomeSettings(data.settings);
                }
            } catch (error) {
                console.error('Error fetching home settings:', error);
            }
            try {
                const testiRes = await fetch(`${API_BASE}/api/testimonials`);
                if (testiRes.ok) {
                    const data = await testiRes.json();
                    if (data && data.length > 0) {
                        const top4 = data.sort((a, b) => (b.stars || 0) - (a.stars || 0)).slice(0, 4);
                        setTopTestimonials(top4);
                    }
                }
            } catch (error) {
                console.error('Error fetching testimonials:', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (topTestimonials.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentTestiIdx(prev => (prev + 1) % topTestimonials.length);
        }, 6000); // changes every 6 sec
        return () => clearInterval(interval);
    }, [topTestimonials]);

    const goToSlide = useCallback((index) => {
        if (isTransitioning || index === currentSlide) return;
        setPrevSlide(currentSlide);
        setIsTransitioning(true);
        setCurrentSlide(index);
        setTimeout(() => {
            setPrevSlide(null);
            setIsTransitioning(false);
        }, 800);
    }, [currentSlide, isTransitioning]);

    const goNext = useCallback(() => {
        if (!slides.length) return;
        goToSlide((currentSlide + 1) % slides.length);
    }, [currentSlide, goToSlide, slides.length]);

    const goPrev = useCallback(() => {
        if (!slides.length) return;
        goToSlide((currentSlide - 1 + slides.length) % slides.length);
    }, [currentSlide, goToSlide, slides.length]);

    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            goNext();
        }, 5000);
        return () => clearInterval(timer);
    }, [goNext, slides.length]);

    const activeSlide = slides[currentSlide] || fallbackHeroSlides[0];

    return (
        <div className="home-page">
            {/* 1. Hero Section */}
            <section className="hero-section">
                {/* Slide images layer */}
                {slides.map((slide, i) => (
                    <div
                        key={slide._id || i}
                        className={`hero-slide-bg ${i === currentSlide ? 'active' : i === prevSlide ? 'prev' : ''}`}
                        style={{ backgroundImage: `url(${slide.image})` }}
                    />
                ))}

                <div className="hero-overlay">
                    <div className="hero-content-wrapper">
                        {activeSlide.kicker && (
                            <p className="hero-kicker" key={`kicker-${currentSlide}`}>
                                {activeSlide.kicker}
                            </p>
                        )}
                        {activeSlide.title && (
                            <h1 className="hero-main-title" key={`title-${currentSlide}`}>
                                {activeSlide.title}
                            </h1>
                        )}
                        {(activeSlide.subtitle || activeSlide.desc) && (
                            <p className="hero-description" key={`desc-${currentSlide}`}>
                                {activeSlide.subtitle || activeSlide.desc}
                            </p>
                        )}
                        <div className="hero-buttons">
                            <Link to="/portfolio" className="btn-primary">EXPLORE OUR WORK <FaArrowRight /></Link>
                            <button type="button" onClick={() => openConsultation()} className="btn-secondary">
                                <FaPlayCircle className="btn-icon" /> BOOK A CONSULTATION
                            </button>
                        </div>
                    </div>
                </div>


                {/* Carousel controls */}
                {slides.length > 1 && (
                    <>
                        <button className="hero-arrow-btn hero-arrow-left" onClick={goPrev} aria-label="Previous slide">
                            <FaChevronLeft />
                        </button>
                        <button className="hero-arrow-btn hero-arrow-right" onClick={goNext} aria-label="Next slide">
                            <FaChevronRight />
                        </button>
                    </>
                )}

                <div className="hero-features-bar">
                    {/* Dot indicators anchored relative to features bar */}
                    {slides.length > 1 && (
                        <div className="hero-dots">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    className={`hero-dot ${i === currentSlide ? 'active' : ''}`}
                                    onClick={() => goToSlide(i)}
                                    aria-label={`Go to slide ${i + 1}`}
                                />
                            ))}
                        </div>
                    )}

                    <div className="feature-item">
                        <span className="feature-icon-svg">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#B38058" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(179,128,88,0.15)" />
                            </svg>
                        </span>
                        <span className="feature-text">Creative Designs</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon-svg">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 3L1 10L12 21L23 10L18 3H6Z" stroke="#B38058" strokeWidth="2" strokeLinejoin="round" fill="rgba(179,128,88,0.12)" />
                                <path d="M1 10H23" stroke="#B38058" strokeWidth="2" />
                                <path d="M12 21L9 10L6 3" stroke="#B38058" strokeWidth="1.5" strokeLinejoin="round" />
                                <path d="M12 21L15 10L18 3" stroke="#B38058" strokeWidth="1.5" strokeLinejoin="round" />
                                <path d="M12 3V10" stroke="#B38058" strokeWidth="1.5" />
                            </svg>
                        </span>
                        <span className="feature-text">Quality Materials</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon-svg">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="#B38058" strokeWidth="2" />
                                <path d="M12 6V12L16 14" stroke="#B38058" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <span className="feature-text">On-time Delivery</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon-svg">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 21V19C20 16.79 18.21 15 16 15H8C5.79 15 4 16.79 4 19V21" stroke="#B38058" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="12" cy="7" r="4" stroke="#B38058" strokeWidth="2" />
                                <path d="M16 3.13C17.79 3.57 19 5.14 19 7C19 8.86 17.79 10.43 16 10.87" stroke="#B38058" strokeWidth="2" strokeLinecap="round" />
                                <path d="M21 21V19C21 17.14 19.79 15.57 18 15.13" stroke="#B38058" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </span>
                        <span className="feature-text">Client Focused</span>
                    </div>
                </div>
            </section>

            {/* 2. About Section */}
            <section className="about-section">
                <div className="about-text-col">
                    <p className="section-kicker">{homeSettings?.about?.kicker || 'WHO WE ARE'}</p>
                    <h2 className="section-title" dangerouslySetInnerHTML={{ __html: (homeSettings?.about?.title || 'We are a passionate\ninterior design studio.').replace(/\n/g, ' <br />') }}></h2>
                    <div className="about-desc">
                        <p>{homeSettings?.about?.desc1 || 'At Good Interior, we believe that great design improves the way people live and work.'}</p>
                        <p>{homeSettings?.about?.desc2 || 'We blend creativity, functionality and detail to deliver spaces that are beautiful, comfortable and uniquely yours.'}</p>
                    </div>
                    <Link to={homeSettings?.about?.buttonLink || '/about'} className="btn-outline">{homeSettings?.about?.buttonText || 'ABOUT OUR STUDIO'} <FaArrowRight /></Link>
                </div>
                <div className="about-image-col">
                    <img src={homeSettings?.about?.image || aboutImg} alt="Our Studio Design" />
                </div>
            </section>

            {/* 3. Services Section */}
            <section className="services-section">
                <div className="section-heading-center">
                    <p className="section-kicker">WHAT WE OFFER</p>
                    <h2 className="section-title">Our Interior Design Services</h2>
                </div>
                <div className="home-services-grid">
                    {services.length > 0 ? services.slice(0, 4).map((serviceItem) => (
                        <ServiceCard
                            key={serviceItem._id || serviceItem.serviceId || serviceItem.title}
                            service={serviceItem}
                        />
                    )) : (
                        <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#94a3b8', padding: '40px 0' }}>Loading services...</p>
                    )}
                </div>
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Link to="/services" className="btn-outline">VIEW ALL SERVICES <FaArrowRight /></Link>
                </div>
            </section>

            {/* 4. Portfolio Section */}
            <section className="portfolio-section">
                <div className="portfolio-header">
                    <div>
                        <p className="section-kicker">OUR PORTFOLIO</p>
                        <h2 className="section-title">Featured Projects</h2>
                    </div>
                </div>
                <div className="portfolio-grid">
                    {projects.length > 0 ? [...projects].reverse().slice(0, 4).map((project, idx) => (
                        <ProjectCard key={project._id} project={project} index={idx} />
                    )) : (
                        <p style={{ textAlign: 'center', width: '100%', color: '#94a3b8', padding: '40px 0' }}>Loading portfolio projects...</p>
                    )}
                </div>
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Link to="/portfolio" className="btn-outline">VIEW ALL PROJECTS <FaArrowRight /></Link>
                </div>
            </section>

            {/* 5. Why Choose Us Section */}
            <section className="why-choose-section">
                <div className="why-section-inner">
                    <div className="why-header">
                        <div className="why-header-text">
                            <p className="section-kicker">{homeSettings?.whyChoose?.kicker || 'WHY CHOOSE US'}</p>
                            <h2 className="section-title" dangerouslySetInnerHTML={{ __html: (homeSettings?.whyChoose?.title || 'Because we care\nabout the details.').replace(/\n/g, '<br />') }}></h2>
                        </div>
                        <p className="why-header-tagline">
                            From the first consultation to the final reveal, we are dedicated to crafting spaces that are beautifully functional and uniquely yours.
                        </p>
                    </div>

                    <div className="why-cards-grid">
                        {homeSettings?.whyChoose?.features && homeSettings.whyChoose.features.length > 0 ? (
                            homeSettings.whyChoose.features.map((feat, idx) => (
                                <div className="why-card" key={idx}>
                                    <span className="why-card-number">{String(idx + 1).padStart(2, '0')}</span>
                                    <div className="why-icon">
                                        {feat.iconName === 'FaUserCheck' ? <FaUserCheck /> :
                                            feat.iconName === 'FaRegBuilding' ? <FaRegBuilding /> :
                                                feat.iconName === 'FaGem' ? <FaGem /> :
                                                    feat.iconName === 'FaRegClock' ? <FaRegClock /> : <FaGem />}
                                    </div>
                                    <h4 className="why-card-title">{feat.title}</h4>
                                    <p className="why-card-desc">{feat.description}</p>
                                </div>
                            ))
                        ) : (
                            <>
                                <div className="why-card">
                                    <span className="why-card-number">01</span>
                                    <div className="why-icon"><FaUserCheck /></div>
                                    <h4 className="why-card-title">Personalized Approach</h4>
                                    <p className="why-card-desc">We listen, understand and design spaces that reflect your lifestyle and personality.</p>
                                </div>
                                <div className="why-card">
                                    <span className="why-card-number">02</span>
                                    <div className="why-icon"><FaRegBuilding /></div>
                                    <h4 className="why-card-title">Experienced Team</h4>
                                    <p className="why-card-desc">Our creative team brings years of expertise and passion to every unique project.</p>
                                </div>
                                <div className="why-card">
                                    <span className="why-card-number">03</span>
                                    <div className="why-icon"><FaGem /></div>
                                    <h4 className="why-card-title">Quality &amp; Trust</h4>
                                    <p className="why-card-desc">We use premium materials and ensure the highest quality in every single detail.</p>
                                </div>
                                <div className="why-card">
                                    <span className="why-card-number">04</span>
                                    <div className="why-icon"><FaRegClock /></div>
                                    <h4 className="why-card-title">On-time Delivery</h4>
                                    <p className="why-card-desc">We value your time and always deliver projects as promised, without compromise.</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* 6. Testimonials Section */}
            <section className="testimonial-section">
                <div className="testi-header">
                    <div>
                        <p className="section-kicker">CLIENTS LOVE OUR WORK</p>
                        <h2 className="section-title">What Our Clients Say</h2>
                    </div>
                    <Link to="/testimonials" className="view-all-link">VIEW MORE <FaArrowRight /></Link>
                </div>
                {topTestimonials.length > 0 ? (() => {
                    const currentTesti = topTestimonials[currentTestiIdx];
                    return (
                        <div className="testi-row-container">
                            <div className="testi-quote-side">
                                <svg className="quote-line-icon" width="36" height="30" viewBox="0 0 44 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 4C7.03 4 3 8.03 3 13V31H21V13H12C12 9.13 15.13 6 19 6V4H12ZM35 4C30.03 4 26 8.03 26 13V31H44V13H35C35 9.13 38.13 6 42 6V4H35Z" stroke="#B38058" strokeWidth="2.2" fill="none" strokeLinejoin="round" />
                                </svg>
                                <p className="testi-quote-text" style={{ minHeight: '100px' }}>
                                    {currentTesti.quote}
                                </p>
                            </div>

                            <div className="testi-v-divider"></div>

                            <div className="testi-author-side" style={{ minHeight: '100px', display: 'flex', alignItems: 'center' }}>
                                <div className="avatar-gold-ring">
                                    <img src={currentTesti.avatar || 'https://randomuser.me/api/portraits/women/44.jpg'} alt={currentTesti.name} />
                                </div>
                                <div className="author-dash"></div>
                                <div className="author-details">
                                    <h4>– {currentTesti.name}</h4>
                                    <p>{currentTesti.role || 'Homeowner'}</p>
                                </div>
                            </div>

                            <div className="testi-dots-inline">
                                {topTestimonials.map((_, idx) => (
                                    <span
                                        key={idx}
                                        className={`dot-circle ${idx === currentTestiIdx ? 'active' : ''}`}
                                        onClick={() => setCurrentTestiIdx(idx)}
                                        style={{ cursor: 'pointer' }}
                                    ></span>
                                ))}
                            </div>
                        </div>
                    );
                })() : (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>Loading testimonials...</div>
                )}
            </section>

            {/* 7. CTA Section */}
            <section className="cta-section" style={{ backgroundImage: `url(${heroBg})` }}>
                <div className="cta-overlay">
                    <div className="cta-content">
                        <div className="cta-text">
                            <p className="section-kicker cta-kicker">READY TO START?</p>
                            <h2 className="section-title cta-title">Let's design a space<br />you'll love.</h2>
                        </div>
                        <div className="cta-buttons">
                            <button type="button" onClick={() => openConsultation()} className="btn-primary cta-btn">
                                <span>BOOK A CONSULTATION</span>
                                <span className="btn-arrow"><FaArrowRight /></span>
                            </button>
                            <Link to="/contact" className="btn-outline-dark cta-btn">
                                <span>CONTACT US TODAY</span>
                                <span className="btn-arrow"><FaArrowRight /></span>
                            </Link>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
