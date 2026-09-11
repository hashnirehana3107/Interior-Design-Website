import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import { TbMapPin, TbRulerMeasure, TbCalendarStats, TbChevronLeft, TbChevronRight } from 'react-icons/tb';
import { BiHomeAlt, BiCheckCircle, BiLayer, BiTargetLock, BiStar } from 'react-icons/bi';
import { MdOutlineLightbulb } from 'react-icons/md';
import ProjectCard from '../components/ProjectCard';
// Removed projectsData mock import
import heroBg from '../assets/hero_bg.png';
import { useAuth } from '../context/AuthContext';
import './ProjectDetails.css';
import API_BASE from '../config/api';

const ProjectDetails = () => {
    const { openConsultation } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [projectInfo, setProjectInfo] = useState(null);
    const [relatedProjects, setRelatedProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Scroll to top when loaded
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        const fetchProjectDetails = async () => {
            setLoading(true);
            try {
                let project = null;
                // Fetch specific project
                const projRes = await fetch(`${API_BASE}/api/projects/${id}`);
                if (projRes.ok) {
                    project = await projRes.json();
                } else {
                    // Fallback to fetch all and find (in case backend wasn't restarted and route is missing)
                    const tempRes = await fetch(`${API_BASE}/api/projects`);
                    if (tempRes.ok) {
                        const tempJson = await tempRes.json();
                        project = (tempJson.projects || []).find(p => p._id === id || String(p.id) === String(id));
                    }
                }

                if (!project) throw new Error('Project not found');
                setProjectInfo(project);

                // Fetch all projects for "Related Projects"
                const allRes = await fetch(`${API_BASE}/api/projects`);
                if (allRes.ok) {
                    const allJson = await allRes.json();
                    const filtered = (allJson.projects || []).filter(p => (p._id || p.id) !== (project._id || project.id)).slice(0, 4);
                    setRelatedProjects(filtered);
                }
            } catch (err) {
                console.error("Failed to load project details", err);
                navigate('/portfolio');
            } finally {
                setLoading(false);
            }
        };
        fetchProjectDetails();
    }, [id, navigate]);

    if (loading || !projectInfo) {
        return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a19', color: '#c48b59' }}>Loading Project...</div>;
    }

    return (
        <div className="project-details-page">
            {/* 1. Hero Section */}
            <section className="detail-hero" style={{ backgroundImage: `url(${projectInfo.image})` }}>
                <div className="detail-hero-overlay">
                    <div className="detail-hero-content">
                        <Link to="/portfolio" className="back-to-portfolio">
                            <BsArrowLeft className="back-icon" /> BACK TO PORTFOLIO
                        </Link>
                        <h1>{projectInfo.title}</h1>
                        <div className="detail-hero-meta">
                            <span className="meta-item">
                                <BiHomeAlt className="meta-icon" /> {projectInfo.category}
                            </span>
                            <span className="meta-item">
                                <BiCheckCircle className="meta-icon" /> {projectInfo.status || 'Completed'}
                            </span>
                        </div>
                        <p className="detail-hero-desc">
                            {projectInfo.description}
                        </p>
                    </div>
                </div>
            </section>

            {/* 2. Overview Strip */}
            <section className="overview-strip">
                <div className="overview-container">
                    <div className="overview-left">
                        {projectInfo.projectOverview && (
                            <>
                                <h4>PROJECT OVERVIEW</h4>
                                <p>{projectInfo.projectOverview}</p>
                            </>
                        )}
                    </div>
                    <div className="overview-right">
                        <div className="stat-box">
                            <TbMapPin className="stat-icon" />
                            <div className="stat-text">
                                <span className="stat-label">Location</span>
                                <span className="stat-value">{projectInfo.location}</span>
                            </div>
                        </div>
                        <div className="stat-box">
                            <TbRulerMeasure className="stat-icon" />
                            <div className="stat-text">
                                <span className="stat-label">Area</span>
                                <span className="stat-value">{projectInfo.area || '1,850 sq ft'}</span>
                            </div>
                        </div>
                        <div className="stat-box">
                            <TbCalendarStats className="stat-icon" />
                            <div className="stat-text">
                                <span className="stat-label">Completion Date</span>
                                <span className="stat-value">{projectInfo.year}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Specs / Concept Details */}
            {(projectInfo.requirements?.length > 0 || projectInfo.designConcept || projectInfo.keyFeatures?.length > 0) && (
                <section className="concept-section">
                    <div className="concept-grid">
                        {projectInfo.requirements?.length > 0 && (
                            <div className="concept-col">
                                <div className="concept-icon-wrap"><BiLayer className="concept-icon" /></div>
                                <h4>CLIENT REQUIREMENTS</h4>
                                <ul>
                                    {projectInfo.requirements.map((reqItem, i) => (
                                        <li key={i}>{reqItem}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {projectInfo.designConcept && (
                            <div className="concept-col">
                                <div className="concept-icon-wrap"><MdOutlineLightbulb className="concept-icon" /></div>
                                <h4>DESIGN CONCEPT</h4>
                                <p>{projectInfo.designConcept}</p>
                            </div>
                        )}
                        {projectInfo.keyFeatures?.length > 0 && (
                            <div className="concept-col">
                                <div className="concept-icon-wrap"><BiStar className="concept-icon" /></div>
                                <h4>KEY FEATURES</h4>
                                <ul>
                                    {projectInfo.keyFeatures.map((feature, i) => (
                                        <li key={i}>{feature}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* 4. Before & After */}
            {(projectInfo.beforeImg || projectInfo.afterImg) && (
                <section className="before-after-section">
                    <div className="section-header">
                        <h3>BEFORE & AFTER</h3>
                    </div>
                    <div className="before-after-grid">
                        {projectInfo.beforeImg && (
                            <div className="img-box">
                                <span className="img-badge">BEFORE</span>
                                <img src={projectInfo.beforeImg} alt="Before" />
                            </div>
                        )}
                        {projectInfo.afterImg && (
                            <div className="img-box">
                                <span className="img-badge">AFTER</span>
                                <img src={projectInfo.afterImg} alt="After" />
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* 5. Project Gallery */}
            {projectInfo.galleryImages?.length > 0 && (
                <section className="gallery-section">
                    <div className="section-header gallery-header">
                        <h3>PROJECT GALLERY</h3>
                        <div className="gallery-arrows">
                            <button className="arrow-btn"><TbChevronLeft /></button>
                            <button className="arrow-btn"><TbChevronRight /></button>
                        </div>
                    </div>
                    <div className="gallery-grid">
                        {projectInfo.galleryImages.map((src, index) => (
                            <div key={index} className="gallery-img-wrap">
                                <img src={src} alt={`Gallery ${index}`} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 6. Specifications & Testimonial Card */}
            <section className="specs-testimonial-section">
                <div className="specs-test-container">
                    <div className="specs-left">
                        <h4>PROJECT SPECIFICATIONS</h4>
                        <div className="spec-row">
                            <span className="spec-label">Project Type</span>
                            <span className="spec-val">{projectInfo.category}</span>
                        </div>
                        <div className="spec-row">
                            <span className="spec-label">Location</span>
                            <span className="spec-val">{projectInfo.location}</span>
                        </div>
                        <div className="spec-row">
                            <span className="spec-label">Area</span>
                            <span className="spec-val">{projectInfo.area || '1,850 sq ft'}</span>
                        </div>
                        <div className="spec-row">
                            <span className="spec-label">Completion Date</span>
                            <span className="spec-val">{projectInfo.year}</span>
                        </div>
                        <div className="spec-row">
                            <span className="spec-label">Design Style</span>
                            <span className="spec-val">{projectInfo.title}</span>
                        </div>
                        <div className="spec-row">
                            <span className="spec-label">Principal Designer</span>
                            <span className="spec-val">Good Interior Design Studio</span>
                        </div>
                        <div className="spec-row">
                            <span className="spec-label">Scope of Work</span>
                            <span className="spec-val">Interior Design, Custom Furniture, Lighting, Decor & Styling</span>
                        </div>
                    </div>

                    <div className="testimonial-right">
                        {projectInfo.testimonialQuote ? (
                            <div className="testimonial-card">
                                <span className="quote-mark">“</span>
                                <p className="test-text">
                                    {projectInfo.testimonialQuote}
                                </p>
                                <div className="test-author">
                                    <span className="author-line"></span>
                                    <div className="author-info">
                                        <span className="author-name">{projectInfo.testimonialAuthor}</span>
                                        <span className="author-role">{projectInfo.testimonialRole}</span>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </section>

            {/* 7. Related Projects */}
            <section className="related-projects-section">
                <div className="section-header related-header">
                    <h3>RELATED PROJECTS</h3>
                    <Link to="/portfolio" className="view-all-link">
                        VIEW ALL PROJECTS <BsArrowRight className="btn-arrow-icon" />
                    </Link>
                </div>
                <div className="related-grid">
                    {relatedProjects.map((project, index) => (
                        <ProjectCard key={project._id || project.id} project={project} index={index + 1} />
                    ))}
                </div>
            </section>

            {/* 8. Pre-Footer CTA */}
            <section
                className="portfolio-cta-strip cta-dark"
                style={{
                    background: `linear-gradient(rgba(26, 26, 25, 0.92), rgba(26, 26, 25, 0.92)), url(${heroBg}) center/cover no-repeat`
                }}
            >
                <div className="cta-strip-content">
                    <div className="cta-strip-left">
                        <div className="cta-icon-box">
                            <TbCalendarStats className="cta-date-icon" />
                        </div>
                        <div className="cta-strip-text">
                            <span className="cta-strip-subtitle">READY TO START YOUR PROJECT?</span>
                            <h2 className="cta-strip-title">Let's Design A Space<br />You'll Love.</h2>
                        </div>
                    </div>

                    <div className="cta-strip-middle">
                        <p>Share your ideas with us and let our team<br />create something extraordinary for you.</p>
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

export default ProjectDetails;
