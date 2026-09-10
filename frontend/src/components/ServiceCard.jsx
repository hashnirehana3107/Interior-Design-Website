import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BsArrowRight, BsChevronLeft, BsChevronRight, BsCheckCircleFill } from 'react-icons/bs';
import { IoClose } from 'react-icons/io5';
import { RiSofaLine, RiMacbookLine, RiRestaurantLine, RiStackLine } from 'react-icons/ri';
import { MdOutlineBed, MdOutlineKitchen } from 'react-icons/md';
import { TbLayoutBoard, TbLamp } from 'react-icons/tb';
import { servicesData } from '../data/servicesData';
import { useAuth } from '../context/AuthContext';
import './ServiceCard.css';

const renderIcon = (icon) => {
 if (React.isValidElement(icon)) return icon;
 switch (icon) {
 case 'sofa': return <RiSofaLine />;
 case 'macbook': return <RiMacbookLine />;
 case 'kitchen': return <MdOutlineKitchen />;
 case 'bed': return <MdOutlineBed />;
 case 'restaurant': return <RiRestaurantLine />;
 case 'layout': return <TbLayoutBoard />;
 case 'stack': return <RiStackLine />;
 case 'lamp': return <TbLamp />;
 default: return <RiSofaLine />;
 }
};

/**
 * ServiceCard — includes an interactive detail modal with 5-image gallery slider,
 * detailed service breakdown, key features, and instant consultation booking modal.
 */
const ServiceCard = ({ id, img, icon, title, desc, details, service }) => {
 const { isAuthenticated, openConsultation } = useAuth();
 const navigate = useNavigate();
 const location = useLocation();
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [activeImageIndex, setActiveImageIndex] = useState(0);

 // Resolve service data from passed service prop, details prop, or fallback matching
 const currentService = service || details || servicesData.find(s => s.id === id || s.serviceId === id || s.title?.toLowerCase() === title?.toLowerCase()) || {
 title: title,
 kicker: 'OUR SERVICE',
 desc: desc,
 fullDesc: desc || 'We offer personalized interior design solutions tailored to your space, style, and functional needs.',
 images: [
 img,
 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80'
 ],
 highlights: [
 'Tailored Interior Design Concepts',
 'High Quality 3D Visualizations & Floor Plans',
 'Material & Furniture Selection',
 'Professional Project Management & Delivery'
 ],
 deliverables: 'Moodboards, 3D Renderings, Layout Plans'
 };

 const cardTitle = currentService.title || title;
 const cardDesc = currentService.desc || desc;
 const cardImg = currentService.image || img || (currentService.images && currentService.images[0]);
 const cardIcon = currentService.iconName ? renderIcon(currentService.iconName) : (icon ? renderIcon(icon) : <RiSofaLine />);
 const serviceIdentifier = currentService._id || currentService.serviceId || currentService.id || id;

 const imagesList = currentService.images && currentService.images.length > 0
 ? currentService.images
 : [cardImg];

 const openModal = (e) => {
 e.preventDefault();
 setActiveImageIndex(0);
 setIsModalOpen(true);
 };

 const closeModal = useCallback(() => {
 setIsModalOpen(false);
 // Clear hash from URL so reopening works smoothly using React Router
 if (location.hash === `#${serviceIdentifier}`) {
 navigate(location.pathname + location.search, { replace: true });
 }
 }, [serviceIdentifier, location, navigate]);

 const handleOpenBookingModal = () => {
 setIsModalOpen(false);
 openConsultation(cardTitle);
 };

 const nextImage = useCallback(() => {
 setActiveImageIndex((prev) => (prev + 1) % imagesList.length);
 }, [imagesList.length]);

 const prevImage = useCallback(() => {
 setActiveImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
 }, [imagesList.length]);

 // Handle ESC key to close modal & prevent background scrolling
 useEffect(() => {
 const handleKeyDown = (e) => {
 if (e.key === 'Escape' && isModalOpen) {
 closeModal();
 }
 };

 if (isModalOpen) {
 document.body.style.overflow = 'hidden';
 window.addEventListener('keydown', handleKeyDown);
 } else {
 document.body.style.overflow = 'auto';
 }

 return () => {
 document.body.style.overflow = 'auto';
 window.removeEventListener('keydown', handleKeyDown);
 };
 }, [isModalOpen, closeModal]);

 // Check URL location hash for direct linking from footer or external links
 useEffect(() => {
 if (!serviceIdentifier) return;
 const hash = location.hash.replace('#', '');

 if (hash === serviceIdentifier) {
 setIsModalOpen(true);
 setActiveImageIndex(0);

 // Allow slight delay for modal to render before scrolling to the card
 setTimeout(() => {
 const el = document.getElementById(`service-${serviceIdentifier}`);
 if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
 }, 50);
 }
 }, [location.hash, serviceIdentifier]);

 return (
 <>
 {/* Card UI */}
 <div className="sc-card" id={serviceIdentifier ? `service-${serviceIdentifier}` : undefined}>
 <div className="sc-img" onClick={openModal} style={{ cursor: 'pointer' }}>
 <img src={cardImg} alt={cardTitle} />
 <div className="sc-img-hover-overlay">
 <span>CLICK TO VIEW DETAILS</span>
 </div>
 </div>
 <div className="sc-content">
 <div className="sc-icon-wrap">{cardIcon}</div>
 <h3>{cardTitle}</h3>
 <p>{cardDesc}</p>
 <button type="button" className="sc-link" onClick={openModal}>
 LEARN MORE <BsArrowRight />
 </button>
 </div>
 </div>

 {/* Service Details Lightbox Modal Popup */}
 {isModalOpen && (
 <div className="sc-modal-backdrop" onClick={closeModal}>
 <div className="sc-modal-container" onClick={(e) => e.stopPropagation()}>

 {/* Close button */}
 <button className="sc-modal-close-btn" onClick={closeModal} aria-label="Close modal">
 <IoClose />
 </button>

 {/* Modal Header */}
 <div className="sc-modal-header">
 <span className="sc-modal-kicker">{currentService.kicker || 'OUR SERVICE'}</span>
 <h2 className="sc-modal-title">{cardTitle}</h2>
 </div>

 {/* Modal Main Grid (Left Carousel | Right Details) */}
 <div className="sc-modal-body">

 {/* Left: 5-Image Carousel */}
 <div className="sc-carousel-col">
 <div className="sc-carousel-main">
 <img
 src={imagesList[activeImageIndex]}
 alt={`${cardTitle} image ${activeImageIndex + 1}`}
 className="sc-carousel-img"
 />

 {/* Arrow Controls */}
 {imagesList.length > 1 && (
 <>
 <button className="sc-carousel-arrow left" onClick={prevImage} aria-label="Previous image">
 <BsChevronLeft />
 </button>
 <button className="sc-carousel-arrow right" onClick={nextImage} aria-label="Next image">
 <BsChevronRight />
 </button>
 <div className="sc-carousel-counter">
 {activeImageIndex + 1} / {imagesList.length}
 </div>
 </>
 )}
 </div>

 {/* Thumbnails Row */}
 {imagesList.length > 1 && (
 <div className="sc-thumbnails-row">
 {imagesList.map((thumb, idx) => (
 <button
 key={idx}
 className={`sc-thumb-btn ${idx === activeImageIndex ? 'active' : ''}`}
 onClick={() => setActiveImageIndex(idx)}
 >
 <img src={thumb} alt={`Thumbnail ${idx + 1}`} />
 </button>
 ))}
 </div>
 )}
 </div>

 {/* Right: Detailed Description & Features */}
 <div className="sc-info-col">
 <div className="sc-info-block">
 <h4>OVERVIEW</h4>
 <p className="sc-full-desc">{currentService.fullDesc || cardDesc}</p>
 </div>

 {currentService.highlights && currentService.highlights.length > 0 && (
 <div className="sc-info-block">
 <h4>KEY HIGHLIGHTS</h4>
 <ul className="sc-highlights-list">
 {currentService.highlights.map((item, idx) => (
 <li key={idx}>
 <BsCheckCircleFill className="sc-check-icon" />
 <span>{item}</span>
 </li>
 ))}
 </ul>
 </div>
 )}

 {currentService.deliverables && (
 <div className="sc-info-block sc-deliverables-box">
 <span className="sc-deliverables-label">WHAT YOU RECEIVE:</span>
 <p className="sc-deliverables-text">{currentService.deliverables}</p>
 </div>
 )}

 <div className="sc-modal-actions">
 <button className="sc-btn-gold" onClick={handleOpenBookingModal}>
 BOOK A CONSULTATION <BsArrowRight />
 </button>
 <button className="sc-btn-outline" onClick={closeModal}>
 CLOSE WINDOW
 </button>
 </div>
 </div>

 </div>

 </div>
 </div>
 )}
 </>
 );
};

export default ServiceCard;
