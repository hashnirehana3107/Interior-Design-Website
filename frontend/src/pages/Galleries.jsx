import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BsArrowRight } from 'react-icons/bs';
import {
 TbSofa, TbFridge, TbBed,
 TbToolsKitchen2, TbBath, TbBuilding, TbPlant,
 TbRefresh, TbChevronDown, TbArmchair, TbArrowRight, TbX
} from 'react-icons/tb';
import { FaLaptopHouse } from 'react-icons/fa';
import heroBgDefault from '../assets/hero_bg.png';
import './Galleries.css';

import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000';


const filterCategories = [
 { label: 'ALL PROJECTS', key: 'all', icon: null },
 { label: 'LIVING ROOM', key: 'living', icon: TbSofa },
 { label: 'KITCHEN', key: 'kitchen', icon: TbFridge },
 { label: 'BEDROOM', key: 'bedroom', icon: TbBed },
 { label: 'DINING ROOM', key: 'dining', icon: TbToolsKitchen2 },
 { label: 'BATHROOM', key: 'bathroom', icon: TbBath },
 { label: 'COMMERCIAL', key: 'commercial', icon: TbBuilding },
 { label: 'OUTDOOR', key: 'outdoor', icon: TbPlant },
 { label: 'OTHER', key: 'other', icon: null }
];

const Galleries = () => {
 const { openConsultation } = useAuth();
 const [activeTab, setActiveTab] = useState('all');
 const [sortOpen, setSortOpen] = useState(false);
 const [sortLabel, setSortLabel] = useState('SORT BY DEFAULT ORDER');
 const [sortOption, setSortOption] = useState('ORDER');
 const sortRef = useRef(null);
 const [selectedImage, setSelectedImage] = useState(null);

 const [galleryImages, setGalleryImages] = useState([]);
 const [loading, setLoading] = useState(true);
 const [heroData, setHeroData] = useState({
 kicker: 'OUR GALLERY',
 title: 'A Collection of',
 highlightTitle: 'Beautiful Spaces',
 subtitle: 'Explore our gallery of stunning interior designs that blend creativity, functionality and timeless elegance.',
 heroBg: ''
 });

 const getInitialVisible = (tab) => (tab === 'all' ? 8 : 6);
 const [visibleCount, setVisibleCount] = useState(8);

 const sortOptions = ['DEFAULT ORDER', 'LATEST', 'OLDEST', 'A – Z', 'Z – A'];

 useEffect(() => {
 window.scrollTo(0, 0);
 fetchGalleryData();
 }, []);

 useEffect(() => {
 setVisibleCount(getInitialVisible(activeTab));
 }, [activeTab, sortOption]);

 const fetchGalleryData = async () => {
 setLoading(true);
 try {
 // Fetch Hero
 const resHero = await fetch(`${API_BASE}/api/gallery/hero`);
 if (resHero.ok) {
 const dataHero = await resHero.json();
 if (dataHero.hero) {
 setHeroData(dataHero.hero);
 }
 }

 // Fetch Items — backend only, no fallback
 const resItems = await fetch(`${API_BASE}/api/gallery/items`);
 if (resItems.ok) {
 const dataItems = await resItems.json();
 setGalleryImages(dataItems.items || []);
 }
 } catch (err) {
 console.error('Error loading gallery backend data:', err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 const handleClickOutside = (e) => {
 if (sortRef.current && !sortRef.current.contains(e.target)) {
 setSortOpen(false);
 }
 };
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 // Process items based on sorting
 const getSortedImages = () => {
 let items = [...galleryImages];
 if (sortOption === 'ORDER') {
 items.sort((a, b) => {
 const orderA = (a.order !== undefined && a.order !== null) ? Number(a.order) : 9999;
 const orderB = (b.order !== undefined && b.order !== null) ? Number(b.order) : 9999;
 return orderA - orderB;
 });
 } else if (sortOption === 'LATEST') {
 items.sort((a, b) => {
 const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
 const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
 return dateB - dateA;
 });
 } else if (sortOption === 'OLDEST') {
 items.sort((a, b) => {
 const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
 const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
 return dateA - dateB;
 });
 } else if (sortOption === 'A – Z') {
 items.sort((a, b) => (a.title || a.type).localeCompare(b.title || b.type));
 } else if (sortOption === 'Z – A') {
 items.sort((a, b) => (b.title || b.type).localeCompare(a.title || a.type));
 }
 return items;
 };

 const sortedImages = getSortedImages();
 const filteredImages = sortedImages.filter(img => activeTab === 'all' || img.type === activeTab);
 const displayedImages = filteredImages.slice(0, visibleCount);
 const heroImageBg = heroData.heroBg || heroBgDefault;

 const handleLoadMore = () => {
 setVisibleCount(prev => prev + 6);
 };

 return (
 <div className="galleries-page">
 {/* 1. Hero Section */}
 <section className="galleries-hero" style={{ backgroundImage: `url(${heroImageBg})` }}>
 <div className="galleries-hero-overlay">
 <div className="galleries-hero-content">
 <span className="galleries-kicker">{heroData.kicker || 'OUR GALLERY'}</span>
 <h1>
 {heroData.title || 'A Collection of'}<br />
 <span className="gold-text">{heroData.highlightTitle || 'Beautiful Spaces'}</span>
 </h1>
 <p>
 {heroData.subtitle || 'Explore our gallery of stunning interior designs that blend creativity, functionality and timeless elegance.'}
 </p>
 </div>
 </div>
 </section>

 {/* 2. Filter & Sort Section */}
 <section className="galleries-filter-section">
 <div className="filter-container">
 <div className="filter-list">
 {filterCategories.map(tab => {
 const Icon = tab.icon;
 const isActive = activeTab === tab.key;
 return (
 <button
 key={tab.key}
 className={`filter-btn ${isActive ? 'active' : ''} ${!Icon ? 'btn-no-icon' : ''}`}
 onClick={() => setActiveTab(tab.key)}
 >
 {Icon && <Icon className="filter-icon" />}
 <span className="filter-label">{tab.label}</span>
 </button>
 );
 })}
 </div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
 {(activeTab !== 'all' || sortOption !== 'ORDER') && (
 <button
 className="sort-btn"
 style={{ gap: '10px', color: '#B38058', borderColor: '#B38058' }}
 onClick={() => {
 setActiveTab('all');
 setSortOption('ORDER');
 setSortLabel('SORT BY DEFAULT ORDER');
 }}
 >
 CLEAR <TbX style={{ fontSize: '16px' }} />
 </button>
 )}
 <div className="sort-dropdown" ref={sortRef}>
 <button
 className={`sort-btn ${sortOpen ? 'open' : ''}`}
 onClick={() => setSortOpen(prev => !prev)}
 >
 {sortLabel} <TbChevronDown className={`sort-icon ${sortOpen ? 'rotated' : ''}`} />
 </button>
 {sortOpen && (
 <ul className="sort-dropdown-menu">
 {sortOptions.map(opt => (
 <li
 key={opt}
 className={`sort-option ${sortLabel === `SORT BY ${opt}` ? 'active' : ''}`}
 onClick={() => {
 setSortLabel(`SORT BY ${opt}`);
 setSortOption(opt === 'DEFAULT ORDER' ? 'ORDER' : opt);
 setSortOpen(false);
 }}
 >
 {opt}
 </li>
 ))}
 </ul>
 )}
 </div>
 </div>
 </div>
 </section>

 {/* 3. Collage Grid Section */}
 <section className="galleries-collage-section">
 {loading ? (
 <div className="gallery-loading-state">
 <div className="gallery-loading-spinner"></div>
 <p>Loading gallery...</p>
 </div>
 ) : displayedImages.length === 0 ? (
 <div className="gallery-empty-state">
 <div className="gallery-empty-icon">
 <FaLaptopHouse />
 </div>
 <h3>No Gallery Items Yet</h3>
 <p>{activeTab === 'all' ? 'Gallery images will appear here once added from the Admin panel.' : `No items found for this category. Try another filter or add items from the Admin panel.`}</p>
 </div>
 ) : (
 <div className={`gallery-collage ${activeTab !== 'all' ? 'filtered' : ''}`}>
 {displayedImages.map((img, index) => {
 let itemClass = 'gallery-item';
 if (activeTab === 'all') {
 if (index < 11) {
 itemClass += ` item-${index + 1}`;
 } else {
 itemClass += ` extra-item ${img.shape ? `shape-${img.shape}` : ''}`;
 }
 } else {
 itemClass += ' filtered-item';
 }

 return (
 <div key={img._id || img.id || index} className={itemClass} onClick={() => setSelectedImage(img)}>
 <img src={img.src} alt={img.title || `Gallery ${index + 1}`} />
 <div className="img-overlay">
 <div className="img-overlay-content">
 <FaLaptopHouse className="overlay-icon" />
 <span>{img.title ? img.title.toUpperCase() : 'VIEW'}</span>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}

 {visibleCount < filteredImages.length && (
 <div className="load-more-container">
 <button className="btn-load-more" onClick={handleLoadMore}>
 LOAD MORE ({filteredImages.length - visibleCount} REMAINING) <TbRefresh className="load-icon" />
 </button>
 </div>
 )}
 </section>

 {/* 4. Pre-Footer Light CTA */}
 <section
 className="galleries-light-cta"
 style={{ background: `linear-gradient(rgba(26, 26, 25, 0.92), rgba(26, 26, 25, 0.92)), url(${heroImageBg}) center/cover no-repeat` }}
 >
 <div className="light-cta-content">
 <div className="light-cta-left">
 <div className="light-cta-icon-box">
 <TbArmchair className="light-cta-icon" />
 </div>
 <div className="light-cta-v-divider"></div>
 <div className="light-cta-text">
 <span className="light-cta-subtitle">READY TO TRANSFORM YOUR SPACE?</span>
 <h2 className="light-cta-title">Let's Create Something Beautiful Together.</h2>
 </div>
 </div>
 <div className="light-cta-right">
 <button type="button" onClick={() => openConsultation()} className="btn-solid-gold">
 BOOK A CONSULTATION <TbArrowRight className="btn-arrow-icon" />
 </button>
 </div>
 </div>
 </section>

 {/* 5. Lightbox Modal */}
 {selectedImage && (
 <div className="gallery-modal-overlay" onClick={() => setSelectedImage(null)}>
 <div className="gallery-modal-content" onClick={e => e.stopPropagation()}>
 {/* Left Info Panel */}
 <div className="gallery-modal-panel">
 <div className="gallery-modal-panel-top">
 <span className="gallery-modal-kicker">GOOD INTERIOR</span>
 <div className="gallery-modal-gold-line"></div>
 <span className="gallery-modal-category">
 {filterCategories.find(c => c.key === selectedImage.type)?.label || (selectedImage.type ? selectedImage.type.toUpperCase() : 'UNCATEGORIZED')}
 </span>
 <h3 className="gallery-modal-title">{selectedImage.title || 'Untitled Project'}</h3>
 </div>
 <div className="gallery-modal-panel-bottom">
 <div className="gallery-modal-meta">
 <div className="gallery-modal-meta-item">
 <span className="gallery-modal-meta-label">CATEGORY</span>
 <span className="gallery-modal-meta-value">{filterCategories.find(c => c.key === selectedImage.type)?.label || 'Design'}</span>
 </div>
 </div>
 <button className="gallery-modal-cta" onClick={() => openConsultation()}>
 BOOK A CONSULTATION
 </button>
 </div>
 <button className="gallery-modal-close" onClick={() => setSelectedImage(null)}>
 <TbX />
 </button>
 </div>
 {/* Right Image Panel */}
 <div className="gallery-modal-img-container">
 <img src={selectedImage.src} alt={selectedImage.title || 'Gallery Preview'} />
 <div className="gallery-modal-img-overlay">
 <span className="gallery-modal-img-counter">PREMIUM DESIGN</span>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

export default Galleries;
