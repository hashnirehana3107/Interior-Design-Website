import React, { useState, useEffect } from 'react';
import {
    TbArrowRight,
    TbMapPin,
    TbPencil,
    TbBuildingSkyscraper,
    TbBox,
    TbSpeakerphone,
    TbSettings,
    TbFileText,
    TbPlant,
    TbSchool,
    TbUsers,
    TbHeart,
    TbBulb,
    TbTrendingUp
} from 'react-icons/tb';
import './Careers.css';
import heroBg from '../assets/careers_hero_bg.png';
import teamCollabImg from '../assets/careers_team_collab.png';
import livingRoomImg from '../assets/careers_cta_livingroom.png';
import JobApplyModal from '../components/JobApplyModal';

const Careers = () => {
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleApplyClick = (positionTitle = 'General Resume Submission') => {
        setSelectedPosition(positionTitle);
        setIsApplyModalOpen(true);
    };

    const scrollToPositions = () => {
        const el = document.getElementById('open-positions');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const jobOpenings = [
        {
            id: 'job-1',
            title: 'Interior Designer',
            type: 'Full-time',
            location: 'Colombo, Sri Lanka',
            icon: <TbPencil className="job-card-icon-svg" />
        },
        {
            id: 'job-2',
            title: 'Interior Architect',
            type: 'Full-time',
            location: 'Colombo, Sri Lanka',
            icon: <TbBuildingSkyscraper className="job-card-icon-svg" />
        },
        {
            id: 'job-3',
            title: '3D Visualizer',
            type: 'Full-time',
            location: 'Colombo, Sri Lanka',
            icon: <TbBox className="job-card-icon-svg" />
        },
        {
            id: 'job-4',
            title: 'Marketing Executive',
            type: 'Full-time',
            location: 'Colombo, Sri Lanka',
            icon: <TbSpeakerphone className="job-card-icon-svg" />
        },
        {
            id: 'job-5',
            title: 'Project Manager',
            type: 'Full-time',
            location: 'Colombo, Sri Lanka',
            icon: <TbSettings className="job-card-icon-svg" />
        },
        {
            id: 'job-6',
            title: 'Office Administrator',
            type: 'Full-time',
            location: 'Colombo, Sri Lanka',
            icon: <TbFileText className="job-card-icon-svg" />
        }
    ];

    return (
        <div className="careers-page">
            {/* 1. HERO SECTION */}
            <section
                className="careers-hero"
                style={{ backgroundImage: `url(${heroBg})` }}
            >
                <div className="careers-hero-overlay">
                    <div className="careers-hero-content">
                        <span className="careers-kicker">JOIN OUR TEAM</span>
                        <h1 className="careers-hero-title">
                            Build Your Career<br />
                            in <span className="gold-text-italic">Interior Design</span>
                        </h1>
                        <p className="careers-hero-desc">
                            We're always looking for passionate, creative and talented individuals to join our team. If you love design and want to make a difference, we'd love to hear from you.
                        </p>
                        <button className="btn-solid-gold btn-careers-hero" onClick={scrollToPositions}>
                            EXPLORE OPEN POSITIONS <TbArrowRight className="btn-arrow-icon" />
                        </button>
                    </div>
                </div>
            </section>

            {/* 2. ABOUT OUR TEAM SECTION */}
            <section className="careers-about-sec">
                <div className="careers-container">
                    <div className="careers-about-grid">
                        {/* Left Side Info */}
                        <div className="careers-about-left">
                            <span className="section-kicker">ABOUT OUR TEAM</span>
                            <div className="kicker-line-sep"></div>
                            <h2 className="section-heading">
                                Great People Build<br />
                                Great Spaces
                            </h2>
                            <p className="section-desc">
                                At Good Interior, we believe that a strong team creates extraordinary results. We foster a collaborative, creative and supportive work environment where your ideas matter and your growth is our priority.
                            </p>

                            <div className="careers-team-features">
                                <div className="team-feature-item">
                                    <div className="tf-icon-box">
                                        <TbBulb />
                                    </div>
                                    <span className="tf-label">Creative<br />Environment</span>
                                </div>

                                <div className="team-feature-item">
                                    <div className="tf-icon-box">
                                        <TbTrendingUp />
                                    </div>
                                    <span className="tf-label">Professional<br />Growth</span>
                                </div>

                                <div className="team-feature-item">
                                    <div className="tf-icon-box">
                                        <TbUsers />
                                    </div>
                                    <span className="tf-label">Collaborative<br />Team</span>
                                </div>

                                <div className="team-feature-item">
                                    <div className="tf-icon-box">
                                        <TbHeart />
                                    </div>
                                    <span className="tf-label">Meaningful<br />Impact</span>
                                </div>
                            </div>
                        </div>

                        {/* Center Image */}
                        <div className="careers-about-center-img">
                            <img src={teamCollabImg} alt="Good Interior Team Collaborating" className="team-collab-img" />
                        </div>

                        {/* Right Side Cursive Accent */}
                        <div className="careers-about-right-script">
                            <div className="cursive-accent-text">
                                <span>Design</span>
                                <span>Together</span>
                                <span>Grow</span>
                                <span>Together</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. OPEN POSITIONS SECTION */}
            <section className="careers-open-positions" id="open-positions">
                <div className="careers-container">
                    <div className="positions-header-bar">
                        <div className="pos-header-left">
                            <span className="section-kicker">OPEN POSITIONS</span>
                            <h2 className="section-heading">Current Job Openings</h2>
                        </div>
                        <div className="pos-header-right">
                            <span className="cv-prompt-text">Not seeing the right role? Send us your resume.</span>
                            <button className="btn-outline-gold" onClick={() => handleApplyClick('General Resume Submission')}>
                                SEND YOUR CV
                            </button>
                        </div>
                    </div>

                    <div className="job-cards-grid">
                        {jobOpenings.map((job) => (
                            <div key={job.id} className="job-opening-card">
                                <div className="job-card-top">
                                    <div className="job-icon-square">
                                        {job.icon}
                                    </div>
                                    <div className="job-card-title-group">
                                        <h3 className="job-title">{job.title}</h3>
                                        <div className="job-meta">
                                            <span className="job-type">{job.type}</span>
                                            <span className="job-meta-sep">•</span>
                                            <span className="job-loc">
                                                <TbMapPin className="pin-icon" /> {job.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button className="btn-apply-link" onClick={() => handleApplyClick(job.title)}>
                                    APPLY NOW <TbArrowRight className="link-arrow" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. WHY WORK WITH US SECTION */}
            <section className="careers-why-sec">
                <div className="careers-container">
                    <div className="why-sec-grid">
                        <div className="why-sec-left">
                            <span className="section-kicker gold-kicker">WHY WORK WITH US</span>
                            <h2 className="section-heading white-heading">
                                More Than a Job<br />
                                <span className="gold-text-italic">It's a Place to Grow</span>
                            </h2>
                        </div>

                        <div className="why-sec-divider"></div>

                        <div className="why-sec-right">
                            <div className="why-benefit-item">
                                <div className="why-icon-wrap">
                                    <TbPlant />
                                </div>
                                <h4>Competitive<br />Salary & Benefits</h4>
                            </div>

                            <div className="why-benefit-item">
                                <div className="why-icon-wrap">
                                    <TbSchool />
                                </div>
                                <h4>Learning &<br />Development</h4>
                            </div>

                            <div className="why-benefit-item">
                                <div className="why-icon-wrap">
                                    <TbUsers />
                                </div>
                                <h4>Supportive<br />Team Culture</h4>
                            </div>

                            <div className="why-benefit-item">
                                <div className="why-icon-wrap">
                                    <TbHeart />
                                </div>
                                <h4>Work-Life<br />Balance</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. READY TO JOIN / APPLY CTA SECTION */}
            <section className="careers-cta-sec">
                <div className="careers-container">
                    <div className="careers-cta-grid">
                        {/* Left Image */}
                        <div className="cta-img-col">
                            <img src={livingRoomImg} alt="Good Interior Luxury Living Space" className="cta-living-img" />
                        </div>

                        {/* Middle Text & Action */}
                        <div className="cta-text-col">
                            <span className="section-kicker">READY TO JOIN?</span>
                            <h2 className="section-heading">
                                Let's Build Something<br />
                                Beautiful Together
                            </h2>
                            <p className="cta-desc">
                                If you're passionate about interior design and want to be part of a creative team, we'd love to hear from you.
                            </p>
                            <button className="btn-solid-gold btn-cta-apply" onClick={() => handleApplyClick('General Resume Submission')}>
                                APPLY NOW <TbArrowRight className="btn-arrow-icon" />
                            </button>
                        </div>

                        {/* Right Quote Box */}
                        <div className="cta-quote-col">
                            <div className="quote-card">
                                <div className="quote-mark">“</div>
                                <p className="quote-text">
                                    "At Good Interior, we don't just design spaces — we create experiences. And we're always looking for great people to help us do it."
                                </p>
                                <span className="quote-author">— Our Team</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <JobApplyModal
                isOpen={isApplyModalOpen}
                onClose={() => setIsApplyModalOpen(false)}
                selectedPosition={selectedPosition}
            />
        </div>
    );
};

export default Careers;
