import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BsArrowRight } from 'react-icons/bs';
import { TbCalendarStats } from 'react-icons/tb';
import ProjectCard from '../components/ProjectCard';
import heroBg from '../assets/hero_bg.png';
import aboutImg from '../assets/about_img.png';
import { useAuth } from '../context/AuthContext';
import './Portfolio.css';

// Mock data import removed, now fetching from backend
const filterCategories = [
 { label: 'ALL PROJECTS', key: 'all' },
 { label: 'RESIDENTIAL', key: 'residential' },
 { label: 'COMMERCIAL', key: 'commercial' },
 { label: 'KITCHEN', key: 'kitchen' },
 { label: 'BEDROOM', key: 'bedroom' },
 { label: 'LIVING & DINING', key: 'living-dining' },
 { label: 'RENOVATION', key: 'renovation' },
 { label: 'OTHER', key: 'other' }
];

const Portfolio = () => {
 const { openConsultation } = useAuth();
 const [activeTab, setActiveTab] = useState('all');
 const [visibleCount, setVisibleCount] = useState(6);
 const [projects, setProjects] = useState([]);
 const [heroData, setHeroData] = useState({
 kicker: 'OUR PORTFOLIO',
 title: 'Spaces We\'ve Designed<br /><span class="gold-text">Stories We\'re Proud Of.</span>',
 subtitle: 'Explore a selection of our completed projects that<br />reflect creativity, functionality and timeless design.',
 bgImage: ''
 });

 useEffect(() => {
 const fetchData = async () => {
 try {
 // Fetch hero
 const heroRes = await fetch('http://localhost:5000/api/projects/hero');
 if (heroRes.ok) {
 const heroJson = await heroRes.json();
 if (heroJson) setHeroData(heroJson);
 }

 // Fetch projects
 const projRes = await fetch('http://localhost:5000/api/projects');
 if (projRes.ok) {
 const projJson = await projRes.json();
 setProjects(projJson.projects || []);
 }
 } catch (err) {
 console.error("Failed to load portfolio data", err);
 }
 };
 fetchData();
 }, []);

 const filteredProjects = activeTab === 'all'
 ? projects
 : projects.filter(item =>
 (item.filterCategory && item.filterCategory.toLowerCase() === activeTab.toLowerCase()) ||
 (item.subCategory && item.subCategory.toLowerCase() === activeTab.toLowerCase()) ||
 (item.category && item.category.toLowerCase() === activeTab.toLowerCase())
 );

 return (
 <div className="portfolio-page">
 {/* 1. Hero Section */}
 <section className="portfolio-hero" style={{ backgroundImage: `url(${heroData.bgImage || heroBg})` }}>
 <div className="portfolio-hero-overlay">
 <div className="portfolio-hero-content">
 <span className="portfolio-kicker">{heroData.kicker}</span>
 <h1 dangerouslySetInnerHTML={{ __html: heroData.title }}></h1>
 <p dangerouslySetInnerHTML={{ __html: heroData.subtitle }}></p>
 </div>
 </div>
 </section>

 {/* 2. Filter Navigation & Grid */}
 <section className="portfolio-content-section">
 {/* Category Filter Tabs */}
 <div className="filter-tabs-container">
 <div className="filter-tabs-list">
 {filterCategories.map(tab => (
 <button
 key={tab.key}
 className={`filter-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
 onClick={() => {
 setActiveTab(tab.key);
 setVisibleCount(6);
 }}
 >
 {tab.label}
 </button>
 ))}
 </div>
 </div>

 {/* Projects 3-Column Grid */}
 <div className="portfolio-grid-container">
 <div className="portfolio-projects-grid">
 {filteredProjects.slice(0, visibleCount).map((project, index) => (
 <ProjectCard key={project._id || project.id} project={project} index={index + 1} />
 ))}
 </div>

 {/* View More Projects Button */}
 {visibleCount < filteredProjects.length && (
 <div className="view-more-container">
 <button className="btn-view-more" onClick={() => setVisibleCount(prev => prev + 6)}>
 VIEW MORE PROJECTS <BsArrowRight className="btn-arrow-icon" />
 </button>
 </div>
 )}
 </div>
 </section>

 {/* 3. Pre-Footer CTA Strip */}
 <section
 className="portfolio-cta-strip"
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


export default Portfolio;
