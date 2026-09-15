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
import whyBg from '../assets/careers_why_bg.png';
import JobApplyModal from '../components/JobApplyModal';
import JobDetailModal from '../components/JobDetailModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const getIconComponent = (iconName) => {
    switch (iconName) {
        case 'architecture':
            return <TbBuildingSkyscraper className="job-card-icon-svg" />;
        case '3d':
            return <TbBox className="job-card-icon-svg" />;
        case 'marketing':
            return <TbSpeakerphone className="job-card-icon-svg" />;
        case 'project':
            return <TbSettings className="job-card-icon-svg" />;
        case 'office':
            return <TbFileText className="job-card-icon-svg" />;
        case 'design':
        default:
            return <TbPencil className="job-card-icon-svg" />;
    }
};

const defaultJobs = [
    {
        _id: 'job-1',
        title: 'Interior Designer',
        type: 'Full-time',
        location: 'Colombo, Sri Lanka',
        icon: 'design'
    },
    {
        _id: 'job-2',
        title: 'Interior Architect',
        type: 'Full-time',
        location: 'Colombo, Sri Lanka',
        icon: 'architecture'
    },
    {
        _id: 'job-3',
        title: '3D Visualizer',
        type: 'Full-time',
        location: 'Colombo, Sri Lanka',
        icon: '3d'
    },
    {
        _id: 'job-4',
        title: 'Marketing Executive',
        type: 'Full-time',
        location: 'Colombo, Sri Lanka',
        icon: 'marketing'
    },
    {
        _id: 'job-5',
        title: 'Project Manager',
        type: 'Full-time',
        location: 'Colombo, Sri Lanka',
        icon: 'project'
    },
    {
        _id: 'job-6',
        title: 'Office Administrator',
        type: 'Full-time',
        location: 'Colombo, Sri Lanka',
        icon: 'office'
    }
];

const Careers = () => {
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState('');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedJobObj, setSelectedJobObj] = useState(null);
    const [detailJobTitle, setDetailJobTitle] = useState('');

    const [jobOpenings, setJobOpenings] = useState(defaultJobs);
    const [heroData, setHeroData] = useState({
        kicker: 'JOIN OUR TEAM',
        title: 'Build Your Career in Interior Design',
        description: "We're always looking for passionate, creative and talented individuals to join our team. If you love design and want to make a difference, we'd love to hear from you.",
        bgImage: ''
    });

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchHeroData();
        fetchJobsData();
    }, []);

    const fetchHeroData = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/careers/hero`);
            if (res.ok) {
                const data = await res.json();
                if (data.hero) {
                    setHeroData(data.hero);
                }
            }
        } catch (err) {
            console.error('Failed to fetch careers hero data:', err);
        }
    };

    const fetchJobsData = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/careers/jobs`);
            if (res.ok) {
                const data = await res.json();
                if (data.jobs && data.jobs.length > 0) {
                    setJobOpenings(data.jobs);
                }
            }
        } catch (err) {
            console.error('Failed to fetch careers jobs data:', err);
        }
    };

    const handleApplyClick = (positionTitle = 'General Resume Submission') => {
        setSelectedPosition(positionTitle);
        setIsApplyModalOpen(true);
    };

    const handleViewDetails = (job) => {
        if (typeof job === 'object' && job.title) {
            setSelectedJobObj(job);
            setDetailJobTitle(job.title);
        } else {
            setDetailJobTitle(job);
            setSelectedJobObj(null);
        }
        setIsDetailModalOpen(true);
    };

    const scrollToPositions = () => {
        const el = document.getElementById('open-positions');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="careers-page">
            {/* 1. HERO SECTION */}
            <section
                className="careers-hero"
                style={{ backgroundImage: `url(${heroData.bgImage || heroBg})` }}
            >
                <div className="careers-hero-overlay">
                    <div className="careers-hero-content">
                        <span className="careers-kicker">{heroData.kicker || 'JOIN OUR TEAM'}</span>
                        <h1 className="careers-hero-title">
                            {heroData.title ? (
                                heroData.title.includes('Interior Design') ? (
                                    <>
                                        Build Your Career<br />
                                        in <span className="gold-text-italic">Interior Design</span>
                                    </>
                                ) : (
                                    heroData.title
                                )
                            ) : (
                                <>
                                    Build Your Career<br />
                                    in <span className="gold-text-italic">Interior Design</span>
                                </>
                            )}
                        </h1>
                        <p className="careers-hero-desc">
                            {heroData.description || "We're always looking for passionate, creative and talented individuals to join our team. If you love design and want to make a difference, we'd love to hear from you."}
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
                            <span className="section-kicker">{heroData.aboutKicker || 'ABOUT OUR TEAM'}</span>
                            <div className="kicker-line-sep"></div>
                            <h2 className="section-heading">
                                {heroData.aboutTitle ? (
                                    heroData.aboutTitle.includes('\n') ? (
                                        heroData.aboutTitle.split('\n').map((line, idx) => (
                                            <React.Fragment key={idx}>
                                                {line}
                                                {idx < heroData.aboutTitle.split('\n').length - 1 && <br />}
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        heroData.aboutTitle
                                    )
                                ) : (
                                    <>
                                        Great People Build<br />
                                        Great Spaces
                                    </>
                                )}
                            </h2>
                            <p className="section-desc">
                                {heroData.aboutDesc || 'At Good Interior, we believe that a strong team creates extraordinary results. We foster a collaborative, creative and supportive work environment where your ideas matter and your growth is our priority.'}
                            </p>

                            <div className="careers-team-features">
                                <div className="team-feature-item">
                                    <div className="tf-icon-box">
                                        <TbBulb />
                                    </div>
                                    <span className="tf-label">
                                        {heroData.aboutF1 || 'Creative Environment'}
                                    </span>
                                </div>

                                <div className="team-feature-item">
                                    <div className="tf-icon-box">
                                        <TbTrendingUp />
                                    </div>
                                    <span className="tf-label">
                                        {heroData.aboutF2 || 'Professional Growth'}
                                    </span>
                                </div>

                                <div className="team-feature-item">
                                    <div className="tf-icon-box">
                                        <TbUsers />
                                    </div>
                                    <span className="tf-label">
                                        {heroData.aboutF3 || 'Collaborative Team'}
                                    </span>
                                </div>

                                <div className="team-feature-item">
                                    <div className="tf-icon-box">
                                        <TbHeart />
                                    </div>
                                    <span className="tf-label">
                                        {heroData.aboutF4 || 'Meaningful Impact'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Center Image */}
                        <div className="careers-about-center-img">
                            <img src={heroData.aboutImage || teamCollabImg} alt="Good Interior Team Collaborating" className="team-collab-img" />
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
                            <div key={job._id || job.id} className="job-opening-card">
                                <div className="job-card-top">
                                    <div className="job-icon-square">
                                        {getIconComponent(job.icon)}
                                    </div>
                                    <div className="job-card-title-group">
                                        <h3 className="job-title">{job.title}</h3>
                                        <div className="job-meta">
                                            <span className="job-type">{job.type || 'Full-time'}</span>
                                            <span className="job-meta-sep">•</span>
                                            <span className="job-loc">
                                                <TbMapPin className="pin-icon" /> {job.location || 'Colombo, Sri Lanka'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-card-actions">
                                    <button className="btn-view-details" onClick={() => handleViewDetails(job)}>
                                        VIEW DETAILS
                                    </button>
                                    <button className="btn-apply-link" onClick={() => handleApplyClick(job.title)}>
                                        APPLY NOW <TbArrowRight className="link-arrow" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. WHY WORK WITH US SECTION */}
            <section
                className="careers-why-sec"
                style={{ backgroundImage: `url(${heroData.whyBgImage || whyBg})` }}
            >
                <div className="careers-why-overlay">
                    <div className="careers-container">
                        <div className="why-sec-grid">
                            <div className="why-sec-left">
                                <span className="section-kicker gold-kicker">{heroData.whyKicker || 'WHY WORK WITH US'}</span>
                                <h2 className="section-heading white-heading">
                                    {heroData.whyTitle || 'More Than a Job'}<br />
                                    <span className="gold-text-italic">{heroData.whySubtitle || "It's a Place to Grow"}</span>
                                </h2>
                            </div>

                            <div className="why-sec-divider"></div>

                            <div className="why-sec-right">
                                <div className="why-benefit-item">
                                    <div className="why-icon-wrap">
                                        <TbPlant />
                                    </div>
                                    <h4>{heroData.whyB1Title || 'Competitive Salary & Benefits'}</h4>
                                </div>

                                <div className="why-benefit-item">
                                    <div className="why-icon-wrap">
                                        <TbSchool />
                                    </div>
                                    <h4>{heroData.whyB2Title || 'Learning & Development'}</h4>
                                </div>

                                <div className="why-benefit-item">
                                    <div className="why-icon-wrap">
                                        <TbUsers />
                                    </div>
                                    <h4>{heroData.whyB3Title || 'Supportive Team Culture'}</h4>
                                </div>

                                <div className="why-benefit-item">
                                    <div className="why-icon-wrap">
                                        <TbHeart />
                                    </div>
                                    <h4>{heroData.whyB4Title || 'Work-Life Balance'}</h4>
                                </div>
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
                            <img src={heroData.ctaImage || livingRoomImg} alt="Good Interior Luxury Living Space" className="cta-living-img" />
                        </div>

                        {/* Middle Text & Action */}
                        <div className="cta-text-col">
                            <span className="section-kicker">{heroData.ctaKicker || 'READY TO JOIN?'}</span>
                            <h2 className="section-heading">
                                {heroData.ctaTitle || "Let's Build Something Beautiful Together"}
                            </h2>
                            <p className="cta-desc">
                                {heroData.ctaDescription || "If you're passionate about interior design and want to be part of a creative team, we'd love to hear from you."}
                            </p>
                            <button className="btn-solid-gold btn-cta-apply" onClick={() => handleApplyClick('General Resume Submission')}>
                                {heroData.ctaButtonText || 'APPLY NOW'} <TbArrowRight className="btn-arrow-icon" />
                            </button>
                        </div>

                        {/* Right Quote Box */}
                        <div className="cta-quote-col">
                            <div className="quote-content-wrap">
                                <div className="quote-mark-gold">“</div>
                                <p className="quote-text">
                                    {heroData.ctaQuote || `"At Good Interior, we don't just design spaces — we create experiences. And we're always looking for great people to help us do it."`}
                                </p>
                                <span className="quote-author">— {heroData.ctaQuoteAuthor || 'OUR TEAM'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <JobDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                jobTitle={detailJobTitle}
                jobData={selectedJobObj}
                onApplyClick={handleApplyClick}
            />

            <JobApplyModal
                isOpen={isApplyModalOpen}
                onClose={() => setIsApplyModalOpen(false)}
                selectedPosition={selectedPosition}
            />
        </div>
    );
};

export default Careers;
