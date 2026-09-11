import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BsArrowRight, BsCheckCircleFill } from 'react-icons/bs';
import { FiTarget, FiEye, FiHeart } from 'react-icons/fi';
import { VscWorkspaceTrusted } from 'react-icons/vsc';
import { BiCalendarStar, BiSmile, BiTrophy, BiBuildingHouse } from 'react-icons/bi';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { RiPencilRuler2Line } from 'react-icons/ri';
import { MdOutlineDateRange } from 'react-icons/md';

import heroImg from '../assets/hero_bg.png';
import aboutImg from '../assets/about_img.png';
import detailImg from '../assets/detail_img.png';
import teamBg from '../assets/team_bg.png';
import { useAuth } from '../context/AuthContext';
import './About.css';

import API_BASE from '../config/api';

const IconMapper = ({ name, className }) => {
    const icons = {
        BiCalendarStar: <BiCalendarStar className={className} />,
        HiOutlineUserGroup: <HiOutlineUserGroup className={className} />,
        BiTrophy: <BiTrophy className={className} />,
        BiSmile: <BiSmile className={className} />,
        VscWorkspaceTrusted: <VscWorkspaceTrusted className={className} />,
        FiHeart: <FiHeart className={className} />,
        RiPencilRuler2Line: <RiPencilRuler2Line className={className} />,
        BiBuildingHouse: <BiBuildingHouse className={className} />
    };
    return icons[name] || <BsCheckCircleFill className={className} />;
};

const About = () => {
    const { openConsultation } = useAuth();
    const [aboutData, setAboutData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAboutData = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/about`);
                const data = await res.json();
                if (res.ok) setAboutData(data);
            } catch (err) {
                console.error('Error fetching about data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAboutData();
    }, []);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0b0d11' }}>
                <div style={{ color: '#d4af37', fontSize: '1.2rem', letterSpacing: '2px' }}>LOADING EXPERIENCES...</div>
            </div>
        );
    }

    if (!aboutData) return null;

    const { heroInfo, whoWeAre, purpose, achievements, philosophy, team } = aboutData;

    return (
        <div className="about-page">
            {/* 1. Hero Section */}
            <section className="about-hero" style={{ backgroundImage: `url(${heroInfo?.bgImage || heroImg})` }}>
                <div className="about-hero-overlay">
                    <div className="about-hero-content">
                        <span className="section-label">ABOUT US</span>
                        <h1 dangerouslySetInnerHTML={{ __html: heroInfo?.title }}></h1>
                        <p>{heroInfo?.subtitle}</p>
                    </div>
                </div>
            </section>

            {/* 2. Who We Are Section */}
            <section className="about-who-section">
                <div className="about-who-content">
                    <span className="section-subtitle">WHO WE ARE</span>
                    <h2>{whoWeAre?.title}</h2>
                    <p>{whoWeAre?.paragraph1}</p>
                    <p>{whoWeAre?.paragraph2}</p>
                    <Link to="/portfolio" className="btn-outline-gold">
                        OUR JOURNEY <BsArrowRight className="btn-icon" />
                    </Link>
                </div>
                <div className="about-who-image">
                    <img src={whoWeAre?.image || aboutImg} alt="Interior Design Studio" />
                </div>
            </section>

            {/* 3. Mission & Vision */}
            <section className="about-purpose-section">
                <div className="section-heading-center">
                    <span className="section-subtitle">OUR PURPOSE</span>
                    <h2>Mission & Vision</h2>
                </div>
                <div className="purpose-cards-container">
                    <div className="purpose-card">
                        <div className="purpose-icon"><FiTarget /></div>
                        <div className="purpose-text">
                            <h3>{purpose?.missionTitle || 'Our Mission'}</h3>
                            <p>{purpose?.missionText}</p>
                        </div>
                    </div>
                    <div className="purpose-card">
                        <div className="purpose-icon"><FiEye /></div>
                        <div className="purpose-text">
                            <h3>{purpose?.visionTitle || 'Our Vision'}</h3>
                            <p>{purpose?.visionText}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Achievements */}
            <section className="about-achievements-section">
                <span className="dark-section-subtitle">OUR ACHIEVEMENTS</span>
                <h2>Experience That Builds Confidence</h2>
                <div className="achievements-grid">
                    {achievements?.map((ach, idx) => (
                        <div className="achievement-item" key={idx}>
                            <IconMapper name={ach.icon} className="achievement-icon" />
                            <h3>{ach.value}</h3>
                            <p>{ach.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. Philosophy */}
            <section className="about-philosophy-section">
                <div className="about-philosophy-content">
                    <span className="section-subtitle">OUR PHILOSOPHY</span>
                    <h2 dangerouslySetInnerHTML={{ __html: philosophy?.title }}></h2>
                    <p>{philosophy?.desc}</p>

                    <ul className="philosophy-list">
                        {philosophy?.points?.map((pt, idx) => (
                            <li key={idx}><BsCheckCircleFill className="check-icon" /> {pt}</li>
                        ))}
                    </ul>
                </div>
                <div className="about-philosophy-image">
                    <img src={philosophy?.image || detailImg} alt="Modern Interior Space" />
                </div>
            </section>

            {/* 6. Team */}
            <section className="about-team-section" style={{
                backgroundImage: `linear-gradient(rgba(26, 26, 26, 0.9), rgba(26, 26, 26, 0.93)), url(${teamBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}>
                <div className="about-team-row">
                    <div className="team-left-col">
                        <span className="dark-section-subtitle">OUR TEAM</span>
                        <h2 dangerouslySetInnerHTML={{ __html: team?.title || 'A Team Of Creatives<br />And Problem Solvers' }}></h2>
                        <p>{team?.desc || 'Our team of designers, architects and project managers work together to ensure a smooth process and exceptional results from start to finish.'}</p>
                    </div>

                    <div className="team-right-col">
                        <div className="team-traits-grid">
                            {(team?.traits && team.traits.length > 0 ? team.traits : [
                                { icon: 'HiOutlineUserGroup', title: 'Creative Designers', desc: 'Bringing ideas to life with creativity.' },
                                { icon: 'RiPencilRuler2Line', title: 'Detail Oriented', desc: 'Precision in every detail makes perfection.' },
                                { icon: 'BiBuildingHouse', title: 'Project Management', desc: 'Seamless execution from start to finish.' },
                                { icon: 'FiHeart', title: 'Client Focused', desc: 'Your satisfaction is at the heart of what we do.' }
                            ]).map((trait, idx) => (
                                <div className="trait-card" key={idx}>
                                    <IconMapper name={trait.icon} className="trait-icon" />
                                    <h4>{trait.title}</h4>
                                    <p>{trait.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. CTA Strip */}
            <section className="about-cta-strip">
                <div className="cta-strip-inner">
                    <div className="cta-strip-left">
                        <MdOutlineDateRange className="cta-strip-icon" />
                        <div className="cta-vertical-divider"></div>
                        <div className="cta-strip-text">
                            <span className="cta-strip-subtitle">READY TO START YOUR JOURNEY?</span>
                            <h3>Let's Design A Space You'll Love.</h3>
                        </div>
                    </div>
                    <div className="cta-strip-right">
                        <button type="button" onClick={() => openConsultation()} className="btn-solid-gold">
                            BOOK A CONSULTATION <BsArrowRight className="btn-icon" />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
