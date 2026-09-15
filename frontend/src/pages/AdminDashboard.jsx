import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaPlayCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import {
    TbSlideshow, TbBriefcase, TbLayoutGrid, TbCalendarEvent,
    TbMail, TbPlus, TbTrash, TbEdit, TbCheck, TbX, TbEye,
    TbRefresh, TbPhoto, TbUserCheck, TbShieldCheck, TbSearch,
    TbArrowLeft, TbHome, TbTrendingUp, TbCircleCheck, TbClock,
    TbPhoneCall, TbMailForward, TbExternalLink, TbFilter, TbFolder,
    TbLogout, TbMapPin, TbAddressBook, TbStar, TbInfoCircle, TbUsers, TbShield, TbLock, TbPackage, TbQuote, TbLayoutBoard, TbHeart,
    TbFileText, TbSend, TbDownload, TbBulb
} from 'react-icons/tb';
import logo from '../assets/logo.svg';
import aboutImg from '../assets/about_img.png';
import careersHeroBg from '../assets/careers_hero_bg.png';
import careersWhyBg from '../assets/careers_why_bg.png';
import careersCtaLivingRoom from '../assets/careers_cta_livingroom.png';
import teamCollabImg from '../assets/careers_team_collab.png';
import './AdminDashboard.css';

import API_BASE from '../config/api';

// ── Image Compression Utility ──
const compressImage = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // Compress to JPEG with 0.8 quality
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
        };
    });
};

// ── Interactive Map Picker Component ──
const InteractiveMapPicker = ({ lat, lng, onLocationSelect }) => {
    const mapRef = React.useRef(null);
    const leafletMap = React.useRef(null);
    const markerRef = React.useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);

    const initialLat = parseFloat(lat) || 6.9271;
    const initialLng = parseFloat(lng) || 79.8612;

    useEffect(() => {
        if (!mapRef.current) return;

        const initMap = () => {
            if (!window.L) {
                setTimeout(initMap, 200);
                return;
            }
            if (leafletMap.current) return;

            const map = window.L.map(mapRef.current).setView([initialLat, initialLng], 14);
            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: ' OpenStreetMap'
            }).addTo(map);

            const marker = window.L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
            markerRef.current = marker;
            leafletMap.current = map;

            // Invalidate size to ensure container renders correctly
            setTimeout(() => map.invalidateSize(), 300);

            // Click on map to set position
            map.on('click', (e) => {
                const { lat: newLat, lng: newLng } = e.latlng;
                marker.setLatLng([newLat, newLng]);
                onLocationSelect(newLat.toFixed(6), newLng.toFixed(6));
            });

            // Drag marker to set position
            marker.on('dragend', () => {
                const pos = marker.getLatLng();
                onLocationSelect(pos.lat.toFixed(6), pos.lng.toFixed(6));
            });
        };

        initMap();

        return () => {
            if (leafletMap.current) {
                leafletMap.current.remove();
                leafletMap.current = null;
            }
        };
    }, []);

    // Sync marker when lat/lng change from input boxes
    useEffect(() => {
        if (leafletMap.current && markerRef.current) {
            const parsedLat = parseFloat(lat);
            const parsedLng = parseFloat(lng);
            if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
                const cur = markerRef.current.getLatLng();
                if (Math.abs(cur.lat - parsedLat) > 0.0001 || Math.abs(cur.lng - parsedLng) > 0.0001) {
                    markerRef.current.setLatLng([parsedLat, parsedLng]);
                    leafletMap.current.panTo([parsedLat, parsedLng]);
                }
            }
        }
    }, [lat, lng]);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const foundLat = parseFloat(data[0].lat);
                const foundLng = parseFloat(data[0].lon);
                onLocationSelect(foundLat.toFixed(6), foundLng.toFixed(6));
                if (leafletMap.current && markerRef.current) {
                    markerRef.current.setLatLng([foundLat, foundLng]);
                    leafletMap.current.setView([foundLat, foundLng], 15);
                }
            } else {
                alert('Location not found. Try searching with city name or street name.');
            }
        } catch (err) {
            console.error('Search location error:', err);
        } finally {
            setSearching(false);
        }
    };

    return (
        <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                    type="text"
                    placeholder="Search place name or city (e.g. Colombo 07, Kandy)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(e); }}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '6px', border: '1px solid #334155', background: '#1e293b', color: '#fff', fontSize: '0.85rem' }}
                />
                <button
                    type="button"
                    onClick={handleSearch}
                    disabled={searching}
                    style={{ background: '#b38058', color: '#fff', border: 'none', borderRadius: '6px', padding: '0 16px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' }}
                >
                    {searching ? 'Searching...' : 'Find Place'}
                </button>
            </div>
            <div style={{ background: '#0f172a', padding: '8px 14px', borderRadius: '6px 6px 0 0', border: '1px solid #334155', borderBottom: 'none', fontSize: '0.78rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span><strong>Click anywhere on the map or drag the pin:</strong> Latitude & Longitude update automatically!</span>
            </div>
            <div ref={mapRef} style={{ height: '240px', width: '100%', borderRadius: '0 0 8px 8px', border: '1px solid #334155', zIndex: 1 }} />
        </div>
    );
};

const AdminDashboard = () => {
    const { user, logout, showToast } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    // ── Data States ──
    const [aboutData, setAboutData] = useState(null);
    const [activeAboutSubTab, setActiveAboutSubTab] = useState('hero');
    const [aboutFormImages, setAboutFormImages] = useState({ hero: '', whoWeAre: '', philosophy: '' });
    const [heroSlides, setHeroSlides] = useState([]);
    const [homeSubTab, setHomeSubTab] = useState('slides');
    const [homeSettings, setHomeSettings] = useState({
        about: { kicker: 'WHO WE ARE', title: 'We are a passionate<br />interior design studio.', desc1: 'At Good Interior, we believe that great design improves the way people live and work.', desc2: 'We blend creativity, functionality and detail to deliver spaces that are beautiful, comfortable and uniquely yours.', buttonText: 'ABOUT OUR STUDIO', buttonLink: '/about', image: '' },
        whyChoose: {
            kicker: 'WHY CHOOSE US', title: 'Because we care<br />about the details.', features: [
                { iconName: 'FaUserCheck', title: 'Personalized Approach', description: 'We listen, understand and design spaces that reflect your lifestyle.' },
                { iconName: 'FaRegBuilding', title: 'Experienced Team', description: 'Our creative team brings years of expertise and passion to every project.' },
                { iconName: 'FaGem', title: 'Quality & Trust', description: 'We use premium materials and ensure quality in every detail.' },
                { iconName: 'FaRegClock', title: 'On-time Delivery', description: 'We value your time and deliver projects as promised.' }
            ]
        }
    });
    const [projects, setProjects] = useState([]);
    const [services, setServices] = useState([]);
    const [consultations, setConsultations] = useState([]);
    const [contactMessages, setContactMessages] = useState([]);
    const [galleryItems, setGalleryItems] = useState([]);
    const [galleryHero, setGalleryHero] = useState({
        kicker: 'OUR GALLERY',
        title: 'A Collection of',
        highlightTitle: 'Beautiful Spaces',
        subtitle: 'Explore our gallery of stunning interior designs that blend creativity, functionality and timeless elegance.',
        heroBg: ''
    });
    const [contactPageSettings, setContactPageSettings] = useState(null);

    // ── Global Site Branding State ──
    const [globalSettings, setGlobalSettings] = useState(null);
    const [globalSettingsModalOpen, setGlobalSettingsModalOpen] = useState(false);
    const [globalSettingsForm, setGlobalSettingsForm] = useState({
        logoUrl: '',
        siteTitle: '',
        siteSubtitle: '',
        footerDesc: '',
        footerCopyright: ''
    });


    // ── Loading States ──
    const [loading, setLoading] = useState(true);

    // ── Search & Filter ──
    const [searchQuery, setSearchQuery] = useState('');
    const [consultationFilter, setConsultationFilter] = useState('ALL');

    // ── Modal States ──
    const [slideModalOpen, setSlideModalOpen] = useState(false);
    const [livePreviewSlide, setLivePreviewSlide] = useState(null);
    const [editingSlide, setEditingSlide] = useState(null);
    const [slideForm, setSlideForm] = useState({
        image: '',
        kicker: '',
        title: '',
        subtitle: '',
        order: 1,
        active: true
    });

    const [projectModalOpen, setProjectModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [portfolioSubTab, setPortfolioSubTab] = useState('projects'); // 'projects' | 'hero'
    const [portfolioHero, setPortfolioHero] = useState({
        kicker: 'OUR PORTFOLIO',
        title: 'Spaces We\'ve Designed<br /><span class="gold-text">Stories We\'re Proud Of.</span>',
        subtitle: 'Explore a selection of our completed projects that<br />reflect creativity, functionality and timeless design.',
        bgImage: ''
    });
    const [portfolioHeroModalOpen, setPortfolioHeroModalOpen] = useState(false);
    const [portfolioHeroForm, setPortfolioHeroForm] = useState({
        kicker: '', title: '', subtitle: '', bgImage: ''
    });

    const [projectForm, setProjectForm] = useState({
        title: '',
        category: 'RESIDENTIAL',
        filterCategory: 'residential',
        subCategory: 'living-dining',
        image: '',
        beforeImg: '',
        afterImg: '',
        galleryImages: '', // Storing as comma-separated string for simple editing
        description: '',
        client: '',
        location: '',
        year: '2026',
        area: '1,850 sq ft',
        status: 'Completed',
        projectOverview: '',
        requirements: '', // Storing as newline or comma separated
        designConcept: '',
        keyFeatures: '', // Storing as newline or comma separated
        testimonialQuote: '',
        testimonialAuthor: '',
        testimonialRole: ''
    });

    const [servicesSubTab, setServicesSubTab] = useState('cards'); // 'cards' | 'hero'
    const [serviceHero, setServiceHero] = useState({
        kicker: 'OUR SERVICES',
        title: 'Comprehensive <br /><span class="highlight-text">Interior Design</span> Services',
        subtitle: 'From concept to completion, we offer a full range of interior design services tailored to your unique needs.',
        bgImage: '',
        offerKicker: 'WHAT WE OFFER',
        offerTitle: 'Our Interior Design Services',
        offerDesc: 'We provide end-to-end interior design solutions, combining creativity, functionality and attention to detail to create spaces that truly feel like home.',
        processKicker: 'OUR PROCESS',
        processTitle: 'A Simple & Transparent Process',
        processKicker: 'OUR PROCESS',
        processTitle: 'A Simple & Transparent Process',
        processDesc: 'We follow a structured process to ensure a smooth, enjoyable and successful design experience.',
        whyKicker: 'WHY CHOOSE US',
        whyTitle: 'More Than Design.<br />A Better Way of Living.',
        whyDesc: 'We combine creativity, expertise and a client-focused approach to deliver interiors that inspire and endure.',
        whyImage: '',
        whyQuote: 'Good design creates spaces where life happens beautifully.',
        whyQuoteAuthor: 'GOOD INTERIOR DESIGN STUDIO'
    });
    const [serviceHeroModalOpen, setServiceHeroModalOpen] = useState(false);
    const [serviceHeroForm, setServiceHeroForm] = useState({
        kicker: '',
        title: '',
        titleLine1: '',
        titleHighlight: '',
        titleSuffix: '',
        subtitle: '',
        bgImage: '',
        offerKicker: '',
        offerTitle: '',
        offerDesc: '',
        processKicker: '',
        processTitle: '',
        processDesc: '',
        whyKicker: '',
        whyTitle: '',
        whyDesc: '',
        whyImage: '',
        whyQuote: '',
        whyQuoteAuthor: ''
    });

    const [processSteps, setProcessSteps] = useState([]);
    const [processModalOpen, setProcessModalOpen] = useState(false);
    const [editingProcess, setEditingProcess] = useState(null);
    const [processForm, setProcessForm] = useState({
        stepNumber: '01',
        title: '',
        description: '',
        iconName: 'chat',
        order: 1
    });

    const [whyFeatures, setWhyFeatures] = useState([]);
    const [whyFeatureModalOpen, setWhyFeatureModalOpen] = useState(false);
    const [editingWhyFeature, setEditingWhyFeature] = useState(null);
    const [whyFeatureForm, setWhyFeatureForm] = useState({
        title: '',
        description: '',
        iconName: 'diamond',
        order: 1
    });

    const [serviceModalOpen, setServiceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [serviceForm, setServiceForm] = useState({
        serviceId: '',
        title: '',
        kicker: 'OUR SERVICE',
        desc: '',
        fullDesc: '',
        image: '',
        images: ['', '', '', '', ''],
        iconName: 'sofa',
        highlights: '',
        deliverables: '',
        order: 1
    });

    // ── Reply Modal States ──
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [selectedMsgForReply, setSelectedMsgForReply] = useState(null);
    const [sendingReply, setSendingReply] = useState(false);
    const [replyForm, setReplyForm] = useState({
        replySubject: '',
        replyMessage: ''
    });

    // ── Gallery Modal States ──
    const [galleryItemModalOpen, setGalleryItemModalOpen] = useState(false);
    const [editingGalleryItem, setEditingGalleryItem] = useState(null);
    const [galleryItemForm, setGalleryItemForm] = useState({
        title: '',
        type: 'living',
        src: '',
        shape: 'standard',
        order: 1
    });

    const [galleryHeroModalOpen, setGalleryHeroModalOpen] = useState(false);
    const [galleryHeroForm, setGalleryHeroForm] = useState({
        kicker: '',
        title: '',
        highlightTitle: '',
        subtitle: '',
        heroBg: ''
    });

    // ── Contact Page Settings Modal States ──
    const [contactHeroModalOpen, setContactHeroModalOpen] = useState(false);
    const [contactHeroForm, setContactHeroForm] = useState({ kicker: '', title: '', highlightText: '', subtitle: '', heroBg: '' });

    const [contactInfoModalOpen, setContactInfoModalOpen] = useState(false);
    const [contactInfoForm, setContactInfoForm] = useState({ address: '', phone1: '', phone2: '', email1: '', email2: '', hoursWeekday: '', hoursSaturday: '', hoursSunday: '' });

    const [contactMapModalOpen, setContactMapModalOpen] = useState(false);
    const [contactMapForm, setContactMapForm] = useState({ latitude: '', longitude: '', label: '', address: '' });

    const [contactJourneyModalOpen, setContactJourneyModalOpen] = useState(false);
    const [contactJourneyForm, setContactJourneyForm] = useState({
        title: '',
        description: '',
        facebook: '',
        instagram: '',
        pinterest: '',
        linkedin: '',
        img1: '',
        img2: '',
        img3: '',
        img4: ''
    });

    const [contactFeatures, setContactFeatures] = useState([]);
    const [contactFeatureModalOpen, setContactFeatureModalOpen] = useState(false);
    const [editingContactFeature, setEditingContactFeature] = useState(null);
    const [contactFeatureForm, setContactFeatureForm] = useState({ iconName: 'home', title: '', description: '', order: 1 });

    // ── Blog Management States ──
    const [blogPosts, setBlogPosts] = useState([]);
    const [blogHero, setBlogHero] = useState({
        kicker: 'OUR BLOG',
        title: 'Ideas, Inspiration & Interior Tips',
        subtitle: 'Explore expert advice, design trends, and creative ideas to help you create beautiful, functional spaces.',
        bgImage: ''
    });
    const [blogSubTab, setBlogSubTab] = useState('articles'); // 'articles' | 'hero'

    const [blogPostModalOpen, setBlogPostModalOpen] = useState(false);
    const [editingBlogPost, setEditingBlogPost] = useState(null);
    const [blogPostForm, setBlogPostForm] = useState({
        badge: 'INTERIOR TRENDS',
        title: '',
        date: '',
        readTime: '5 MIN READ',
        desc: '',
        img: '',
        content: '',
        author: 'Sarah Thompson',
        authorRole: 'Interior Designer',
        authorImg: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
        authorBio: 'Sarah is an interior designer with over 10 years of experience creating beautiful and functional spaces.',
        tags: 'Interior Trends, Modern Home',
        isFeatured: false,
        isPopular: false
    });

    const [blogHeroModalOpen, setBlogHeroModalOpen] = useState(false);
    const [blogHeroForm, setBlogHeroForm] = useState({
        kicker: '',
        title: '',
        subtitle: '',
        bgImage: ''
    });

    // ── Testimonials Management States ──
    const [testimonials, setTestimonials] = useState([]);
    const [testiHero, setTestiHero] = useState({
        kicker: 'TESTIMONIALS',
        title: 'Trusted By Clients.<br /><span class="gold-text-italic">Loved</span> For Our Work.',
        subtitle: 'We take pride in creating spaces that inspire<br />and relationships that last.',
        bgImage: '',
        quoteText: 'Design is not just what it looks like and feels like.<br />Design is how it works.',
        quoteAuthor: '– Steve Jobs',
        quoteImage: '',
        statRating: '4.9',
        statClients: '120+',
        statProjects: '150+',
        statSatisfaction: '98%'
    });
    const [testiSubTab, setTestiSubTab] = useState('reviews'); // 'reviews' | 'hero' | 'quote' | 'stats'

    const [testiModalOpen, setTestiModalOpen] = useState(false);
    const [editingTesti, setEditingTesti] = useState(null);
    const [testiForm, setTestiForm] = useState({
        name: '', role: '', quote: '', category: 'RESIDENTIAL', avatar: '', image: '', stars: 5
    });

    const [testiHeroModalOpen, setTestiHeroModalOpen] = useState(false);
    const [testiHeroForm, setTestiHeroForm] = useState({
        kicker: '', titleLine1: '', titleGold: '', titleLine2: '', subtitle: '', bgImage: ''
    });

    const [testiQuoteModalOpen, setTestiQuoteModalOpen] = useState(false);
    const [testiQuoteForm, setTestiQuoteForm] = useState({
        quoteText: '', quoteAuthor: '', quoteImage: ''
    });

    const [testiStatsModalOpen, setTestiStatsModalOpen] = useState(false);
    const [testiStatsForm, setTestiStatsForm] = useState({
        statRating: '', statClients: '', statProjects: '', statSatisfaction: ''
    });

    // ── User Management & Auth Branding States ──
    const [userSubTab, setUserSubTab] = useState('accounts'); // 'accounts' | 'authBranding'
    const [users, setUsers] = useState([]);
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('ALL');
    const [userForm, setUserForm] = useState({
        fullName: '', email: '', phone: '', country: '', password: '', role: 'user'
    });

    const [authBrandingData, setAuthBrandingData] = useState({
        loginTitle: '',
        loginSubtitle: '',
        signupTitle: '',
        signupSubtitle: '',
        signupFeatures: []
    });

    // ── Careers Management States ──
    const [careersSubTab, setCareersSubTab] = useState('jobs'); // 'jobs' | 'hero' | 'about' | 'why' | 'cta' | 'applications'
    const [jobOpenings, setJobOpenings] = useState([]);
    const [jobApplications, setJobApplications] = useState([]);
    const [careersHero, setCareersHero] = useState({
        kicker: 'JOIN OUR TEAM',
        title: 'Build Your Career in Interior Design',
        description: "We're always looking for passionate, creative and talented individuals to join our team. If you love design and want to make a difference, we'd love to hear from you.",
        bgImage: '',
        aboutKicker: 'ABOUT OUR TEAM',
        aboutTitle: 'Great People Build Great Spaces',
        aboutDesc: 'At Good Interior, we believe that a strong team creates extraordinary results. We foster a collaborative, creative and supportive work environment where your ideas matter and your growth is our priority.',
        aboutImage: '',
        aboutF1: 'Creative Environment',
        aboutF2: 'Professional Growth',
        aboutF3: 'Collaborative Team',
        aboutF4: 'Meaningful Impact',
        whyKicker: 'WHY WORK WITH US',
        whyTitle: 'More Than a Job',
        whySubtitle: "It's a Place to Grow",
        whyBgImage: '',
        whyB1Title: 'Competitive Salary & Benefits',
        whyB2Title: 'Learning & Development',
        whyB3Title: 'Supportive Team Culture',
        whyB4Title: 'Work-Life Balance',
        ctaKicker: 'READY TO JOIN?',
        ctaTitle: "Let's Build Something Beautiful Together",
        ctaDescription: "If you're passionate about interior design and want to be part of a creative team, we'd love to hear from you.",
        ctaImage: '',
        ctaButtonText: 'APPLY NOW',
        ctaQuote: `"At Good Interior, we don't just design spaces — we create experiences. And we're always looking for great people to help us do it."`,
        ctaQuoteAuthor: 'OUR TEAM'
    });

    const [careersAboutModalOpen, setCareersAboutModalOpen] = useState(false);
    const [careersAboutForm, setCareersAboutForm] = useState({
        aboutKicker: '', aboutTitle: '', aboutDesc: '', aboutImage: '',
        aboutF1: '', aboutF2: '', aboutF3: '', aboutF4: ''
    });

    const [careersWhyModalOpen, setCareersWhyModalOpen] = useState(false);
    const [careersWhyForm, setCareersWhyForm] = useState({
        whyKicker: '', whyTitle: '', whySubtitle: '', whyBgImage: '',
        whyB1Title: '', whyB2Title: '', whyB3Title: '', whyB4Title: ''
    });

    const [careersCtaModalOpen, setCareersCtaModalOpen] = useState(false);
    const [careersCtaForm, setCareersCtaForm] = useState({
        ctaKicker: '', ctaTitle: '', ctaDescription: '', ctaImage: '',
        ctaButtonText: '', ctaQuote: '', ctaQuoteAuthor: ''
    });
    const [jobModalOpen, setJobModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [jobForm, setJobForm] = useState({
        title: '',
        department: 'Design Studio',
        type: 'Full-time',
        location: 'Colombo, Sri Lanka',
        experience: '2 - 4 Years Experience',
        salaryRange: 'Negotiable',
        overview: '',
        responsibilities: '',
        requirements: '',
        benefits: '',
        icon: 'design',
        order: 1,
        isActive: true
    });
    const [careersHeroModalOpen, setCareersHeroModalOpen] = useState(false);
    const [careersHeroForm, setCareersHeroForm] = useState({
        kicker: '', title: '', description: '', bgImage: ''
    });

    // ── Candidate Email Response Modal States ──
    const [candidateEmailModalOpen, setCandidateEmailModalOpen] = useState(false);
    const [selectedAppForEmail, setSelectedAppForEmail] = useState(null);
    const [emailForm, setEmailForm] = useState({
        subject: '',
        bodyMessage: '',
        statusTag: 'Pending',
        isSending: false
    });

    const handleOpenEmailModal = (app) => {
        setSelectedAppForEmail(app);
        setEmailForm({
            subject: `Update regarding your application for ${app.position} - Good Interior Studio`,
            bodyMessage: `Dear ${app.fullName},\n\nThank you for applying for the ${app.position} position at Good Interior Studio.\n\nOur HR & Lead Architecture team has evaluated your profile and CV. We would like to connect with you regarding the next steps in our hiring process.\n\nPlease let us know your availability for a brief discussion or interview.\n\nBest regards,\nRecruitment & Talent Team\nGood Interior Studio, Colombo`,
            statusTag: app.status || 'Pending',
            isSending: false
        });
        setCandidateEmailModalOpen(true);
    };

    const handleApplyEmailTemplate = (templateType) => {
        if (!selectedAppForEmail) return;
        const name = selectedAppForEmail.fullName;
        const pos = selectedAppForEmail.position;

        if (templateType === 'select') {
            setEmailForm(prev => ({
                ...prev,
                subject: `🎉 Interview Invitation - ${pos} | Good Interior Studio`,
                bodyMessage: `Dear ${name},\n\nWe are pleased to inform you that after reviewing your CV and portfolio for the ${pos} position, you have been SHORTLISTED for an interview with our lead architectural team!\n\nPlease reply to this email or call us at +94 77 123 4567 to confirm your availability for an interview at our Colombo Studio or via Google Meet.\n\nWe look forward to meeting you!\n\nBest regards,\nRecruitment & Talent Team\nGood Interior Studio`,
                statusTag: 'Contacted'
            }));
        } else if (templateType === 'review') {
            setEmailForm(prev => ({
                ...prev,
                subject: `Application Under Review - ${pos} | Good Interior Studio`,
                bodyMessage: `Dear ${name},\n\nThank you for submitting your application for the ${pos} position at Good Interior Studio.\n\nYour application and CV are currently under active evaluation by our Studio Directors. We will update you as soon as the review process concludes.\n\nThank you for your patience.\n\nBest regards,\nGood Interior Studio HR Team`,
                statusTag: 'Reviewed'
            }));
        } else if (templateType === 'reject') {
            setEmailForm(prev => ({
                ...prev,
                subject: `Update regarding your application for ${pos} - Good Interior Studio`,
                bodyMessage: `Dear ${name},\n\nThank you for your interest in joining Good Interior Studio and taking the time to share your application for the ${pos} role.\n\nAfter careful review, we regret to inform you that we have decided to proceed with candidates whose experience more closely matches our immediate project requirements.\n\nWe wish you every success in your career and will keep your profile in our database for future opportunities.\n\nWarm regards,\nGood Interior Studio HR Team`,
                statusTag: 'Rejected'
            }));
        }
    };

    const handleSendCandidateEmail = async (e) => {
        if (e) e.preventDefault();
        if (!selectedAppForEmail || !emailForm.subject || !emailForm.bodyMessage) return;

        setEmailForm(prev => ({ ...prev, isSending: true }));
        try {
            const res = await fetch(`${API_BASE}/api/careers/send-candidate-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    applicationId: selectedAppForEmail._id,
                    recipientEmail: selectedAppForEmail.email,
                    recipientName: selectedAppForEmail.fullName,
                    position: selectedAppForEmail.position,
                    subject: emailForm.subject,
                    bodyMessage: emailForm.bodyMessage,
                    statusTag: emailForm.statusTag
                })
            });

            const data = await res.json();
            if (res.ok) {
                if (showToast) showToast(`Email successfully sent to ${selectedAppForEmail.email}!`, 'success');
                setCandidateEmailModalOpen(false);
                fetchJobApplications();
            } else {
                if (showToast) showToast(data.message || 'Failed to send email', 'error');
            }
        } catch (err) {
            if (showToast) showToast('An error occurred while sending email', 'error');
        } finally {
            setEmailForm(prev => ({ ...prev, isSending: false }));
        }
    };

    const fetchCareersHero = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/careers/hero`);
            const data = await res.json();
            if (res.ok && data.hero) setCareersHero(data.hero);
        } catch (err) {
            console.error('Error fetching careers hero:', err);
        }
    };

    const fetchJobOpenings = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/careers/jobs`);
            const data = await res.json();
            if (res.ok && data.jobs) setJobOpenings(data.jobs);
        } catch (err) {
            console.error('Error fetching job openings:', err);
        }
    };

    const fetchJobApplications = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/careers/applications`);
            const data = await res.json();
            if (res.ok && data.applications) setJobApplications(data.applications);
        } catch (err) {
            console.error('Error fetching job applications:', err);
        }
    };

    const handleOpenAddJob = () => {
        setEditingJob(null);
        setJobForm({
            title: '',
            department: 'Design Studio',
            type: 'Full-time',
            location: 'Colombo, Sri Lanka',
            experience: '2 - 4 Years Experience',
            salaryRange: 'Negotiable',
            overview: '',
            responsibilities: '',
            requirements: '',
            benefits: '',
            icon: 'design',
            order: jobOpenings.length + 1,
            isActive: true
        });
        setJobModalOpen(true);
    };

    const handleOpenEditJob = (job) => {
        setEditingJob(job);
        setJobForm({
            title: job.title || '',
            department: job.department || 'Design Studio',
            type: job.type || 'Full-time',
            location: job.location || 'Colombo, Sri Lanka',
            experience: job.experience || '2 - 4 Years Experience',
            salaryRange: job.salaryRange || 'Negotiable',
            overview: job.overview || '',
            responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : (job.responsibilities || ''),
            requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : (job.requirements || ''),
            benefits: Array.isArray(job.benefits) ? job.benefits.join('\n') : (job.benefits || ''),
            icon: job.icon || 'design',
            order: job.order || 1,
            isActive: job.isActive !== undefined ? job.isActive : true
        });
        setJobModalOpen(true);
    };

    const handleSaveJob = async (e) => {
        if (e) e.preventDefault();
        try {
            const method = editingJob ? 'PUT' : 'POST';
            const url = editingJob ? `${API_BASE}/api/careers/jobs/${editingJob._id}` : `${API_BASE}/api/careers/jobs`;
            const payload = {
                ...jobForm,
                responsibilities: jobForm.responsibilities ? jobForm.responsibilities.split('\n').filter(Boolean) : [],
                requirements: jobForm.requirements ? jobForm.requirements.split('\n').filter(Boolean) : [],
                benefits: jobForm.benefits ? jobForm.benefits.split('\n').filter(Boolean) : []
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                if (showToast) showToast(`Job opening ${editingJob ? 'updated' : 'created'} successfully!`, 'success');
                setJobModalOpen(false);
                fetchJobOpenings();
            } else {
                if (showToast) showToast(data.message || 'Failed to save job opening', 'error');
            }
        } catch (err) {
            if (showToast) showToast('An error occurred while saving job opening', 'error');
        }
    };

    const handleDeleteJob = async (id) => {
        if (!(await confirmAction('Are you sure you want to delete this job opening?'))) return;
        try {
            const res = await fetch(`${API_BASE}/api/careers/jobs/${id}`, { method: 'DELETE' });
            if (res.ok) {
                if (showToast) showToast('Job opening deleted successfully!', 'success');
                fetchJobOpenings();
            }
        } catch (err) {
            if (showToast) showToast('Failed to delete job opening', 'error');
        }
    };

    const handleDeleteJobApplication = async (id) => {
        if (!(await confirmAction('Are you sure you want to delete this candidate application?'))) return;
        try {
            const res = await fetch(`${API_BASE}/api/careers/applications/${id}`, { method: 'DELETE' });
            if (res.ok) {
                if (showToast) showToast('Candidate application deleted successfully!', 'success');
                fetchJobApplications();
            }
        } catch (err) {
            if (showToast) showToast('Failed to delete candidate application', 'error');
        }
    };

    const handleUpdateJobAppStatus = async (id, newStatus) => {
        try {
            const res = await fetch(`${API_BASE}/api/careers/applications/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                if (showToast) showToast(`Application status updated to "${newStatus}"`, 'success');
                fetchJobApplications();
            }
        } catch (err) {
            if (showToast) showToast('Failed to update status', 'error');
        }
    };

    const handleSaveCareersHero = async (e) => {
        if (e) e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/careers/hero`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(careersHeroForm)
            });
            if (res.ok) {
                if (showToast) showToast('Careers Hero updated successfully!', 'success');
                setCareersHeroModalOpen(false);
                fetchCareersHero();
            } else {
                if (showToast) showToast('Failed to update Careers Hero', 'error');
            }
        } catch (err) {
            if (showToast) showToast('An error occurred while saving Careers Hero', 'error');
        }
    };

    const handleSaveCareersAbout = async (e) => {
        if (e) e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/careers/hero`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(careersAboutForm)
            });
            if (res.ok) {
                if (showToast) showToast('"About Our Team" section updated successfully!', 'success');
                setCareersAboutModalOpen(false);
                fetchCareersHero();
            } else {
                if (showToast) showToast('Failed to update section', 'error');
            }
        } catch (err) {
            if (showToast) showToast('An error occurred while saving section', 'error');
        }
    };

    const handleSaveCareersWhy = async (e) => {
        if (e) e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/careers/hero`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(careersWhyForm)
            });
            if (res.ok) {
                if (showToast) showToast('"Why Work With Us" section updated successfully!', 'success');
                setCareersWhyModalOpen(false);
                fetchCareersHero();
            } else {
                if (showToast) showToast('Failed to update section', 'error');
            }
        } catch (err) {
            if (showToast) showToast('An error occurred while saving section', 'error');
        }
    };

    const handleSaveCareersCta = async (e) => {
        if (e) e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/careers/hero`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(careersCtaForm)
            });
            if (res.ok) {
                if (showToast) showToast('"Ready To Join" CTA section updated successfully!', 'success');
                setCareersCtaModalOpen(false);
                fetchCareersHero();
            } else {
                if (showToast) showToast('Failed to update CTA section', 'error');
            }
        } catch (err) {
            if (showToast) showToast('An error occurred while saving CTA section', 'error');
        }
    };

    const fetchAuthBranding = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/auth-branding`);
            const data = await res.json();
            if (res.ok) {
                const brandingObj = data.branding || data;
                if (brandingObj) setAuthBrandingData(brandingObj);
            }
        } catch (err) {
            console.error('Error fetching auth branding:', err);
        }
    };

    const handleSaveAuthBranding = async (e) => {
        if (e) e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/auth-branding`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authBrandingData)
            });
            if (res.ok) {
                if (showToast) showToast('Why Choose Us features saved successfully!', 'success');
                fetchAuthBranding();
            } else {
                if (showToast) showToast('An error occurred. Please try again.', 'error');
            }
        } catch (err) {
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        }
    };


    // ── Unified Confirm Modal State ──
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        message: '',
        resolve: null
    });

    const confirmAction = (message) => {
        return new Promise((resolve) => {
            setConfirmState({
                isOpen: true,
                message,
                resolve
            });
        });
    };

    const handleConfirmYes = () => {
        if (confirmState.resolve) confirmState.resolve(true);
        setConfirmState({ isOpen: false, message: '', resolve: null });
    };

    const handleConfirmNo = () => {
        if (confirmState.resolve) confirmState.resolve(false);
        setConfirmState({ isOpen: false, message: '', resolve: null });
    };


    // Fetch all database records
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchHeroSlides(),
                fetchHomeSettings(),
                fetchProjects(),
                fetchPortfolioHero(),
                fetchServices(),
                fetchServiceHero(),
                fetchProcessSteps(),
                fetchWhyFeatures(),
                fetchConsultations(),
                fetchContactMessages(),
                fetchGalleryHero(),
                fetchGalleryItems(),
                fetchContactPageSettings(),
                fetchContactFeatures(),
                fetchBlogHero(),
                fetchBlogPosts(),
                fetchTestiHero(),
                fetchTestimonials(),
                fetchTestimonials(),
                fetchAboutData(),
                fetchUsers(),
                fetchGlobalSettings(),
                fetchAuthBranding(),
                fetchCareersHero(),
                fetchJobOpenings(),
                fetchJobApplications()
            ]);
        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchGlobalSettings = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/global-settings`);
            const data = await res.json();
            if (res.ok) {
                const settingsObj = data.settings || data;
                if (settingsObj) setGlobalSettings(settingsObj);
            }
        } catch (err) {
            console.error('Error fetching global settings:', err);
        }
    };

    const handleSaveGlobalSettings = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/global-settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(globalSettingsForm)
            });
            if (res.ok) {
                showToast('Operation completed successfully', 'success');
                setGlobalSettingsModalOpen(false);
                fetchGlobalSettings();
            } else {
                showToast('An error occurred. Please try again.', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('An error occurred. Please try again.', 'error');
        }
    };

    const fetchAboutData = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/about`);
            const data = await res.json();
            if (res.ok) setAboutData(data);
        } catch (err) {
            console.error('Error fetching about data:', err);
        }
    };

    const fetchBlogHero = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/blog/hero`);
            const data = await res.json();
            if (res.ok && data && data.title) setBlogHero(data);
        } catch (err) {
            console.error('Error fetching blog hero:', err);
        }
    };

    const fetchBlogPosts = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/blog/posts`);
            const data = await res.json();
            if (res.ok && Array.isArray(data)) setBlogPosts(data);
        } catch (err) {
            console.error('Error fetching blog posts:', err);
        }
    };

    const fetchTestiHero = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/testimonials/hero`);
            const data = await res.json();
            if (res.ok && data && data.title) setTestiHero(data);
        } catch (err) {
            console.error('Error fetching testi hero:', err);
        }
    };

    const fetchTestimonials = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/testimonials`);
            const data = await res.json();
            if (res.ok && Array.isArray(data)) setTestimonials(data);
        } catch (err) {
            console.error('Error fetching testimonials:', err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/users`);
            const data = await res.json();
            if (res.ok && data.users) setUsers(data.users);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const handleOpenAddUser = () => {
        setEditingUser(null);
        setUserForm({ fullName: '', email: '', phone: '', country: '', password: '', role: 'user' });
        setUserModalOpen(true);
    };

    const handleOpenEditUser = (u) => {
        setEditingUser(u);
        setUserForm({ fullName: u.fullName || '', email: u.email || '', phone: u.phone || '', country: u.country || '', password: '', role: u.role || 'user' });
        setUserModalOpen(true);
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        try {
            const method = editingUser ? 'PUT' : 'POST';
            const url = editingUser ? `${API_BASE}/api/users/${editingUser._id}` : `${API_BASE}/api/users`;
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userForm)
            });
            const data = await res.json();
            if (res.ok) {
                if (showToast) showToast(`User ${editingUser ? 'updated' : 'created'} successfully!`, 'success');
                setUserModalOpen(false);
                fetchUsers();
            } else {
                if (showToast) showToast(`${data.message || 'Failed to save user.'}`, 'error');
            }
        } catch (err) {
            if (showToast) showToast('Please complete all required fields.', 'error');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!(await confirmAction('Are you sure you want to proceed with this deletion?'))) return;
        try {
            const res = await fetch(`${API_BASE}/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                if (showToast) showToast('Changes saved successfully', 'success');
                fetchUsers();
            }
        } catch (err) {
            if (showToast) showToast('Please complete all required fields.', 'error');
        }
    };

    const handleOpenAddBlogPost = () => {
        setEditingBlogPost(null);
        setBlogPostForm({
            badge: 'INTERIOR TRENDS',
            title: '',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase(),
            readTime: '5 MIN READ',
            desc: '',
            img: '',
            content: '',
            author: '',
            authorRole: '',
            authorImg: '',
            authorBio: '',
            tags: '',
            isFeatured: false,
            isPopular: false
        });
        setBlogPostModalOpen(true);
    };

    const handleOpenEditBlogPost = (post) => {
        setEditingBlogPost(post);
        setBlogPostForm({
            badge: post.badge || 'INTERIOR TRENDS',
            title: post.title || '',
            date: post.date || '',
            readTime: post.readTime || '5 MIN READ',
            desc: post.desc || '',
            img: post.img || '',
            content: post.content || '',
            author: post.author || 'Sarah Thompson',
            authorRole: post.authorRole || 'Interior Designer',
            authorImg: post.authorImg || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
            authorBio: post.authorBio || '',
            tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
            isFeatured: !!post.isFeatured,
            isPopular: !!post.isPopular
        });
        setBlogPostModalOpen(true);
    };

    const handleSaveBlogPost = async (e) => {
        e.preventDefault();
        if (!blogPostForm.title || !blogPostForm.desc || !blogPostForm.img) {
            if (showToast) showToast('Title, description, and cover image are required.', 'error');
            return;
        }

        try {
            const method = editingBlogPost ? 'PUT' : 'POST';
            const url = editingBlogPost
                ? `${API_BASE}/api/blog/posts/${editingBlogPost._id}`
                : `${API_BASE}/api/blog/posts`;

            const payload = {
                ...blogPostForm,
                tags: typeof blogPostForm.tags === 'string'
                    ? blogPostForm.tags.split(',').map(t => t.trim()).filter(Boolean)
                    : blogPostForm.tags
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok) {
                if (showToast) showToast(`${editingBlogPost ? 'updated' : 'created'} successfully!`, 'success');
                setBlogPostModalOpen(false);
                fetchBlogPosts();
            } else {
                if (showToast) showToast(`${data.message || 'Failed to save blog post.'}`, 'error');
            }
        } catch (err) {
            console.error('Save blog post error:', err);
            if (showToast) showToast('Please complete all required fields.', 'error');
        }
    };

    const handleDeleteBlogPost = async (id) => {
        if (!(await confirmAction('Are you sure you want to proceed with this deletion?'))) return;
        try {
            const res = await fetch(`${API_BASE}/api/blog/posts/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                if (showToast) showToast('Changes saved successfully', 'success');
                fetchBlogPosts();
            } else {
                if (showToast) showToast(`${data.message || 'Failed to delete article.'}`, 'error');
            }
        } catch (err) {
            console.error('Delete blog post error:', err);
            if (showToast) showToast('Please complete all required fields.', 'error');
        }
    };

    const handleOpenEditBlogHero = () => {
        setBlogHeroForm({
            kicker: blogHero.kicker || 'OUR BLOG',
            title: blogHero.title || 'Ideas, Inspiration & Interior Tips',
            subtitle: blogHero.subtitle || 'Explore expert advice, design trends, and creative ideas to help you create beautiful, functional spaces.',
            bgImage: blogHero.bgImage || ''
        });
        setBlogHeroModalOpen(true);
    };

    const handleSaveBlogHero = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/blog/hero`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(blogHeroForm)
            });
            const data = await res.json();
            if (res.ok) {
                if (showToast) showToast('Changes saved successfully', 'success');
                setBlogHeroModalOpen(false);
                fetchBlogHero();
            } else {
                if (showToast) showToast(`${data.message || 'Failed to update hero section.'}`, 'error');
            }
        } catch (err) {
            console.error('Save blog hero error:', err);
            if (showToast) showToast('Please complete all required fields.', 'error');
        }
    };

    const fetchContactPageSettings = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/contact-settings`);
            const data = await res.json();
            if (res.ok && data.settings) setContactPageSettings(data.settings);
        } catch (err) {
            console.error('Error fetching contact page settings:', err);
        }
    };

    const fetchContactFeatures = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/contact-settings/features`);
            const data = await res.json();
            if (res.ok && data.features) setContactFeatures(data.features);
        } catch (err) {
            console.error('Error fetching contact features:', err);
        }
    };

    const handleSaveContactFeature = async (e) => {
        e.preventDefault();
        if (!contactFeatureForm.title) {
            if (showToast) showToast('Please complete all required fields.', 'error');
            return;
        }
        try {
            const isEdit = !!editingContactFeature;
            const url = isEdit
                ? `${API_BASE}/api/contact-settings/features/${editingContactFeature._id}`
                : `${API_BASE}/api/contact-settings/features`;
            const method = isEdit ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactFeatureForm)
            });
            const data = await res.json();
            if (res.ok) {
                if (showToast) showToast(`${isEdit ? 'updated' : 'added'} successfully!`, 'success');
                setContactFeatures(data.features);
                setContactFeatureModalOpen(false);
                setEditingContactFeature(null);
                setContactFeatureForm({ iconName: 'home', title: '', description: '', order: 1 });
            } else {
                if (showToast) showToast(data.message || 'Failed to save feature', 'error');
            }
        } catch (err) {
            console.error('Save contact feature error:', err);
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        }
    };

    const handleDeleteContactFeature = async (featureId) => {
        if (!(await confirmAction('Are you sure you want to proceed with this deletion?'))) return;
        try {
            const res = await fetch(`${API_BASE}/api/contact-settings/features/${featureId}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                if (showToast) showToast('Operation completed successfully', 'success');
                setContactFeatures(data.features);
            } else {
                if (showToast) showToast(data.message || 'Failed to delete feature', 'error');
            }
        } catch (err) {
            console.error('Delete contact feature error:', err);
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        }
    };

    const fetchHomeSettings = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/home-settings`);
            const data = await res.json();
            if (res.ok && data.settings) {
                // Clean any older <br /> tags from being shown in textareas
                if (data.settings.about && data.settings.about.title) {
                    data.settings.about.title = data.settings.about.title.replace(/<br\s*\/?>/gi, '\n');
                }
                if (data.settings.whyChoose && data.settings.whyChoose.title) {
                    data.settings.whyChoose.title = data.settings.whyChoose.title.replace(/<br\s*\/?>/gi, '\n');
                }

                const mergeFeatures = data.settings.whyChoose?.features?.length > 0
                    ? data.settings.whyChoose.features
                    : [
                        { iconName: 'FaUserCheck', title: '', description: '' },
                        { iconName: 'FaRegBuilding', title: '', description: '' },
                        { iconName: 'FaGem', title: '', description: '' },
                        { iconName: 'FaRegClock', title: '', description: '' }
                    ];
                setHomeSettings({
                    ...data.settings,
                    whyChoose: {
                        ...(data.settings.whyChoose || {}),
                        features: mergeFeatures
                    }
                });
            }
        } catch (err) {
            console.error('Error fetching home settings:', err);
        }
    };

    const handleSaveHomeSettings = async () => {
        // Validation for 'Who We Are' section
        if (!homeSettings?.about?.kicker || !homeSettings?.about?.title || !homeSettings?.about?.desc1) {
            if (showToast) showToast('"Who We Are" section', 'error');
            return;
        }

        // Validation for 'Why Choose Us' section
        if (!homeSettings?.whyChoose?.kicker || !homeSettings?.whyChoose?.title) {
            if (showToast) showToast('"Why Choose Us" section', 'error');
            return;
        }

        for (let i = 0; i < homeSettings?.whyChoose?.features?.length; i++) {
            const feat = homeSettings.whyChoose.features[i];
            if (!feat.title || !feat.description) {
                if (showToast) showToast(`${i + 1} in "Why Choose Us" section`, 'error');
                return;
            }
        }

        try {
            const res = await fetch(`${API_BASE}/api/home-settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(homeSettings)
            });
            if (res.ok) {
                if (showToast) showToast('Changes saved successfully', 'success');
                fetchHomeSettings();
            } else {
                if (showToast) showToast('Please complete all required fields.', 'error');
            }
        } catch (err) {
            if (showToast) showToast('Please complete all required fields.', 'error');
        }
    };

    const fetchHeroSlides = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/hero-slides/admin/all`);
            const data = await res.json();
            if (res.ok) setHeroSlides(data.slides || []);
        } catch (err) {
            console.error('Error fetching slides:', err);
        }
    };

    const fetchProjects = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/projects`);
            const data = await res.json();
            if (res.ok) setProjects(data.projects || []);
        } catch (err) {
            console.error('Error fetching projects:', err);
        }
    };

    const fetchPortfolioHero = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/projects/hero`);
            const data = await res.json();
            if (res.ok && data) setPortfolioHero(data);
        } catch (err) {
            console.error('Error fetching portfolio hero:', err);
        }
    };
    const fetchServices = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/services`);
            const data = await res.json();
            if (res.ok) setServices(data.services || []);
        } catch (err) {
            console.error('Error fetching services:', err);
        }
    };

    const fetchConsultations = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/consultations`);
            const data = await res.json();
            if (res.ok) setConsultations(data.consultations || []);
        } catch (err) {
            console.error('Error fetching consultations:', err);
        }
    };

    const fetchContactMessages = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/contact/admin/all`);
            const data = await res.json();
            if (res.ok) setContactMessages(data.messages || []);
        } catch (err) {
            console.error('Error fetching contact messages:', err);
        }
    };

    const fetchGalleryHero = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/gallery/hero`);
            const data = await res.json();
            if (res.ok && data.hero) setGalleryHero(data.hero);
        } catch (err) {
            console.error('Error fetching gallery hero:', err);
        }
    };

    const fetchGalleryItems = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/gallery/items`);
            const data = await res.json();
            if (res.ok) setGalleryItems(data.items || []);
        } catch (err) {
            console.error('Error fetching gallery items:', err);
        }
    };


    // Image Upload Base64 Helper
    const handleImageFileUpload = (e, callback) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 8 * 1024 * 1024) {
            if (showToast) showToast('Please complete all required fields.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            callback(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // ── Hero Slide Actions ──
    const handleSaveHeroSlide = async (e) => {
        e.preventDefault();
        if (!slideForm.image) {
            if (showToast) showToast('Please complete all required fields.', 'error');
            return;
        }

        try {
            const url = editingSlide ? `${API_BASE}/api/hero-slides/${editingSlide._id}` : `${API_BASE}/api/hero-slides`;
            const method = editingSlide ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(slideForm)
            });

            const data = await res.json();
            if (res.ok) {
                if (showToast) showToast(`${editingSlide ? 'updated' : 'added'} successfully!`, 'success');
                setSlideModalOpen(false);
                setEditingSlide(null);
                setSlideForm({ image: '', kicker: '', title: '', subtitle: '', order: 1, active: true });
                fetchHeroSlides();
            } else {
                if (showToast) showToast(`${data.message || 'Failed to save slide'}`, 'error');
            }
        } catch (err) {
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        }
    };

    const handleDeleteHeroSlide = async (id) => {
        if (!(await confirmAction('Are you sure you want to proceed with this deletion?'))) return;
        try {
            const res = await fetch(`${API_BASE}/api/hero-slides/${id}`, { method: 'DELETE' });
            if (res.ok) {
                if (showToast) showToast('Operation completed successfully', 'success');
                fetchHeroSlides();
            }
        } catch (err) {
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        }
    };

    const handleToggleSlideActive = async (slide) => {
        try {
            const res = await fetch(`${API_BASE}/api/hero-slides/${slide._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !slide.active })
            });
            if (res.ok) {
                if (showToast) showToast(`${!slide.active ? 'Active' : 'Hidden'}`, 'info');
                fetchHeroSlides();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // ── Project Actions ──
    const handleSaveProject = async (e) => {
        e.preventDefault();
        if (!projectForm.title || !projectForm.image) {
            if (showToast) showToast('Please complete all required fields.', 'error');
            return;
        }

        try {
            const url = editingProject ? `${API_BASE}/api/projects/${editingProject._id}` : `${API_BASE}/api/projects`;
            const method = editingProject ? 'PUT' : 'POST';

            // Clean up formatted inputs before send
            const payload = {
                ...projectForm,
                requirements: typeof projectForm.requirements === 'string' ? projectForm.requirements.split('\n').map(s => s.trim()).filter(s => s) : projectForm.requirements,
                keyFeatures: typeof projectForm.keyFeatures === 'string' ? projectForm.keyFeatures.split('\n').map(s => s.trim()).filter(s => s) : projectForm.keyFeatures,
                galleryImages: typeof projectForm.galleryImages === 'string' ? projectForm.galleryImages.split('\n').map(s => s.trim()).filter(s => s) : projectForm.galleryImages
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                if (showToast) showToast(`${editingProject ? 'updated' : 'created'} successfully!`, 'success');
                setProjectModalOpen(false);
                setEditingProject(null);
            } else {
                if (showToast) showToast(`${data.message || 'Failed to save project'}`, 'error');
            }
            setProjectForm({
                title: '', category: 'RESIDENTIAL', filterCategory: 'residential', subCategory: 'living-dining',
                image: '', beforeImg: '', afterImg: '', galleryImages: '', description: '', client: '',
                location: '', year: '2026', area: '1,850 sq ft', status: 'Completed', projectOverview: '', requirements: '',
                designConcept: '', keyFeatures: '', testimonialQuote: '', testimonialAuthor: '', testimonialRole: ''
            });
            fetchProjects();
        } catch (err) {
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        }
    };

    const handleDeleteProject = async (id) => {
        if (!(await confirmAction('Are you sure you want to proceed with this deletion?'))) return;
        try {
            const res = await fetch(`${API_BASE}/api/projects/${id}`, { method: 'DELETE' });
            if (res.ok) {
                if (showToast) showToast('Operation completed successfully', 'success');
                fetchProjects();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const parsePortfolioHeroTitle = (fullTitle = '') => {
        if (!fullTitle) return { titleLine1: "Spaces We've Designed", titleHighlight: "Stories We're Proud Of.", titleSuffix: '' };

        let titleLine1 = '';
        let titleHighlight = '';
        let titleSuffix = '';

        const highlightMatch = fullTitle.match(/<span class=["']gold-text["']>(.*?)<\/span>/i);
        if (highlightMatch) {
            titleHighlight = highlightMatch[1];
            const brParts = fullTitle.split(/<br\s*\/?>/i);
            if (brParts.length > 1) {
                titleLine1 = brParts[0].replace(/<[^>]+>/g, '').trim();
                const rest = brParts[1];
                const spanIdx = rest.indexOf('<span');
                if (spanIdx !== -1) {
                    const afterSpan = rest.substring(rest.indexOf('</span>') + 7);
                    titleSuffix = afterSpan.replace(/<[^>]+>/g, '').trim();
                } else {
                    titleSuffix = rest.replace(/<[^>]+>/g, '').trim();
                }
            } else {
                const beforeSpan = fullTitle.substring(0, fullTitle.indexOf('<span'));
                titleLine1 = beforeSpan.replace(/<[^>]+>/g, '').trim();
                const afterSpan = fullTitle.substring(fullTitle.indexOf('</span>') + 7);
                titleSuffix = afterSpan.replace(/<[^>]+>/g, '').trim();
            }
        } else {
            const brParts = fullTitle.split(/<br\s*\/?>/i);
            if (brParts.length > 1) {
                titleLine1 = brParts[0].replace(/<[^>]+>/g, '').trim();
                titleSuffix = brParts[1].replace(/<[^>]+>/g, '').trim();
            } else {
                titleLine1 = fullTitle.replace(/<[^>]+>/g, '').trim();
            }
        }
        return { titleLine1, titleHighlight, titleSuffix };
    };

    const handleSavePortfolioHero = async (e) => {
        e.preventDefault();

        // Construct HTML format from fields
        let constructedTitle = '';
        const line1 = portfolioHeroForm.titleLine1 ? portfolioHeroForm.titleLine1.trim() : '';
        const highlight = portfolioHeroForm.titleHighlight ? `<span class="gold-text">${portfolioHeroForm.titleHighlight.trim()}</span>` : '';
        const suffix = portfolioHeroForm.titleSuffix ? portfolioHeroForm.titleSuffix.trim() : '';

        if (line1 && (highlight || suffix)) {
            constructedTitle = `${line1}<br />${highlight}${suffix ? ' ' + suffix : ''}`;
        } else if (line1) {
            constructedTitle = line1;
        } else if (highlight || suffix) {
            constructedTitle = `${highlight}${suffix ? ' ' + suffix : ''}`;
        } else {
            constructedTitle = portfolioHeroForm.title || "Spaces We've Designed<br /><span class=\"gold-text\">Stories We're Proud Of.</span>";
        }

        const constructedSubtitle = (portfolioHeroForm.subtitleText || '').replace(/\n/g, '<br />');

        const payload = {
            kicker: portfolioHeroForm.kicker,
            title: constructedTitle,
            subtitle: constructedSubtitle,
            bgImage: portfolioHeroForm.bgImage,
        };

        try {
            const res = await fetch(`${API_BASE}/api/projects/hero`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                if (showToast) showToast('Changes saved successfully', 'success');
                setPortfolioHeroModalOpen(false);
                fetchPortfolioHero();
            } else {
                throw new Error(await res.text());
            }
        } catch (err) {
            console.error(err);
            if (showToast) showToast('. Check the image size.', 'error');
        }
    };

    // ── Service Actions ──
    const fetchServiceHero = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/services/hero`);
            const data = await res.json();
            if (res.ok && data.hero) setServiceHero(data.hero);
        } catch (err) {
            console.error('Error fetching service hero:', err);
        }
    };

    const parseHeroTitle = (fullTitle = '') => {
        if (!fullTitle) return { titleLine1: 'Comprehensive', titleHighlight: 'Interior Design', titleSuffix: 'Services' };

        let titleLine1 = '';
        let titleHighlight = '';
        let titleSuffix = '';

        const highlightMatch = fullTitle.match(/<span class=["']highlight-text["']>(.*?)<\/span>/i);
        if (highlightMatch) {
            titleHighlight = highlightMatch[1];
            const brParts = fullTitle.split(/<br\s*\/?>/i);
            if (brParts.length > 1) {
                titleLine1 = brParts[0].replace(/<[^>]+>/g, '').trim();
                const rest = brParts[1];
                const spanIdx = rest.indexOf('<span');
                if (spanIdx !== -1) {
                    const afterSpan = rest.substring(rest.indexOf('</span>') + 7);
                    titleSuffix = afterSpan.replace(/<[^>]+>/g, '').trim();
                } else {
                    titleSuffix = rest.replace(/<[^>]+>/g, '').trim();
                }
            } else {
                const beforeSpan = fullTitle.substring(0, fullTitle.indexOf('<span'));
                titleLine1 = beforeSpan.replace(/<[^>]+>/g, '').trim();
                const afterSpan = fullTitle.substring(fullTitle.indexOf('</span>') + 7);
                titleSuffix = afterSpan.replace(/<[^>]+>/g, '').trim();
            }
        } else {
            const brParts = fullTitle.split(/<br\s*\/?>/i);
            if (brParts.length > 1) {
                titleLine1 = brParts[0].replace(/<[^>]+>/g, '').trim();
                titleSuffix = brParts[1].replace(/<[^>]+>/g, '').trim();
            } else {
                titleLine1 = fullTitle.replace(/<[^>]+>/g, '').trim();
            }
        }

        return { titleLine1, titleHighlight, titleSuffix };
    };

    const handleSaveServiceHero = async (e) => {
        e.preventDefault();

        // Automatically construct formatted title from clean user inputs
        let constructedTitle = '';
        const line1 = serviceHeroForm.titleLine1 ? serviceHeroForm.titleLine1.trim() : '';
        const highlight = serviceHeroForm.titleHighlight ? `<span class="highlight-text">${serviceHeroForm.titleHighlight.trim()}</span>` : '';
        const suffix = serviceHeroForm.titleSuffix ? serviceHeroForm.titleSuffix.trim() : '';

        if (line1 && (highlight || suffix)) {
            constructedTitle = `${line1}<br />${highlight}${suffix ? ' ' + suffix : ''}`;
        } else if (line1) {
            constructedTitle = line1;
        } else if (highlight || suffix) {
            constructedTitle = `${highlight}${suffix ? ' ' + suffix : ''}`;
        } else {
            constructedTitle = serviceHero.title || 'Comprehensive <br /><span class="highlight-text">Interior Design</span> Services';
        }

        const payload = {
            kicker: serviceHeroForm.kicker,
            title: constructedTitle,
            subtitle: serviceHeroForm.subtitle,
            bgImage: serviceHeroForm.bgImage,
            offerKicker: serviceHeroForm.offerKicker,
            offerTitle: serviceHeroForm.offerTitle,
            offerDesc: serviceHeroForm.offerDesc,
            processKicker: serviceHeroForm.processKicker,
            processTitle: serviceHeroForm.processTitle,
            processDesc: serviceHeroForm.processDesc,
            whyKicker: serviceHeroForm.whyKicker,
            whyTitle: serviceHeroForm.whyTitle,
            whyDesc: serviceHeroForm.whyDesc,
            whyImage: serviceHeroForm.whyImage,
            whyQuote: serviceHeroForm.whyQuote,
            whyQuoteAuthor: serviceHeroForm.whyQuoteAuthor
        };

        try {
            const res = await fetch(`${API_BASE}/api/services/hero`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const data = await res.json();
                setServiceHero(data.hero);
                setServiceHeroModalOpen(false);
                if (showToast) showToast('& header settings updated!', 'success');
            }
        } catch (err) {
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        }
    };

    const fetchProcessSteps = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/services/process`);
            const data = await res.json();
            if (res.ok) setProcessSteps(data.steps || []);
        } catch (err) {
            console.error('Error fetching process steps:', err);
        }
    };

    const fetchWhyFeatures = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/services/why-features`);
            const data = await res.json();
            if (res.ok) setWhyFeatures(data.features || []);
        } catch (err) {
            console.error('Error fetching why features:', err);
        }
    };

    const handleOpenAddWhyFeature = () => {
        setEditingWhyFeature(null);
        setWhyFeatureForm({
            title: '',
            description: '',
            iconName: 'diamond',
            order: whyFeatures.length + 1
        });
        setWhyFeatureModalOpen(true);
    };

    const handleOpenEditWhyFeature = (feat) => {
        setEditingWhyFeature(feat);
        setWhyFeatureForm({
            title: feat.title || '',
            description: feat.description || '',
            iconName: feat.iconName || 'diamond',
            order: feat.order || 1
        });
        setWhyFeatureModalOpen(true);
    };

    const handleSaveWhyFeature = async (e) => {
        e.preventDefault();
        if (!whyFeatureForm.title || !whyFeatureForm.description) {
            if (showToast) showToast('Please complete all required fields.', 'error');
            return;
        }

        try {
            const url = editingWhyFeature ? `${API_BASE}/api/services/why-features/${editingWhyFeature._id}` : `${API_BASE}/api/services/why-features`;
            const method = editingWhyFeature ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(whyFeatureForm)
            });

            const data = await res.json();
            if (res.ok) {
                if (showToast) showToast(`${editingWhyFeature ? 'updated' : 'added'} successfully!`, 'success');
                setWhyFeatureModalOpen(false);
                setEditingWhyFeature(null);
                fetchWhyFeatures();
            } else {
                if (showToast) showToast(`${data.message || 'Failed to save feature'}`, 'error');
            }
        } catch (err) {
            console.error('Save why feature error:', err);
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        }
    };

    const handleDeleteWhyFeature = async (id) => {
        if (!(await confirmAction('Are you sure you want to proceed with this deletion?'))) return;
        try {
            const res = await fetch(`${API_BASE}/api/services/why-features/${id}`, { method: 'DELETE' });
            if (res.ok) {
                if (showToast) showToast('Operation completed successfully', 'success');
                fetchWhyFeatures();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleOpenAddProcess = () => {
        setEditingProcess(null);
        const count = processSteps.length;
        const nextNum = count + 1 < 10 ? `0${count + 1}` : `${count + 1}`;
        setProcessForm({
            stepNumber: nextNum,
            title: '',
            description: '',
            iconName: 'chat',
            order: count + 1
        });
        setProcessModalOpen(true);
    };

    const handleOpenEditProcess = (step) => {
        setEditingProcess(step);
        setProcessForm({
            stepNumber: step.stepNumber || '',
            title: step.title || '',
            description: step.description || '',
            iconName: step.iconName || 'chat',
            order: step.order || 1
        });
        setProcessModalOpen(true);
    };

    const handleSaveProcessStep = async (e) => {
        e.preventDefault();
        if (!processForm.title || !processForm.description) {
            if (showToast) showToast('Please complete all required fields.', 'error');
            return;
        }

        try {
            const url = editingProcess ? `${API_BASE}/api/services/process/${editingProcess._id}` : `${API_BASE}/api/services/process`;
            const method = editingProcess ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(processForm)
            });

            const data = await res.json();
            if (res.ok) {
                if (showToast) showToast(`${editingProcess ? 'updated' : 'added'} successfully!`, 'success');
                setProcessModalOpen(false);
                setEditingProcess(null);
                fetchProcessSteps();
            } else {
                if (showToast) showToast(`${data.message || 'Failed to save process step'}`, 'error');
            }
        } catch (err) {
            console.error('Save process step error:', err);
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        }
    };

    const handleDeleteProcessStep = async (id) => {
        if (!(await confirmAction('Are you sure you want to proceed with this deletion?'))) return;
        try {
            const res = await fetch(`${API_BASE}/api/services/process/${id}`, { method: 'DELETE' });
            if (res.ok) {
                if (showToast) showToast('Operation completed successfully', 'success');
                fetchProcessSteps();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleOpenAddService = () => {
        setEditingService(null);
        setServiceForm({
            serviceId: '',
            title: '',
            kicker: 'OUR SERVICE',
            desc: '',
            fullDesc: '',
            image: '',
            images: ['', '', '', '', ''],
            iconName: 'sofa',
            highlights: 'Tailored Interior Design Concepts\nHigh Quality 3D Visualizations\nMaterial & Furniture Selection\nProfessional Project Management',
            deliverables: 'Moodboards, 3D Renderings, Layout Plans',
            order: services.length + 1
        });
        setServiceModalOpen(true);
    };

    const handleOpenEditService = (srv) => {
        setEditingService(srv);
        const imgArr = srv.images && srv.images.length > 0 ? [...srv.images] : [srv.image || ''];
        while (imgArr.length < 5) imgArr.push('');

        setServiceForm({
            serviceId: srv.serviceId || '',
            title: srv.title || '',
            kicker: srv.kicker || 'OUR SERVICE',
            desc: srv.desc || srv.description || '',
            fullDesc: srv.fullDesc || srv.description || '',
            image: srv.image || '',
            images: imgArr.slice(0, 5),
            iconName: srv.iconName || 'sofa',
            highlights: Array.isArray(srv.highlights) ? srv.highlights.join('\n') : (srv.features ? (Array.isArray(srv.features) ? srv.features.join('\n') : srv.features) : ''),
            deliverables: srv.deliverables || '',
            order: srv.order || 1
        });
        setServiceModalOpen(true);
    };

    const handleSaveService = async (e) => {
        e.preventDefault();
        if (!serviceForm.title || (!serviceForm.desc && !serviceForm.fullDesc)) {
            if (showToast) showToast('Please complete all required fields.', 'error');
            return;
        }

        try {
            const url = editingService ? `${API_BASE}/api/services/${editingService._id}` : `${API_BASE}/api/services`;
            const method = editingService ? 'PUT' : 'POST';

            const cleanImages = (serviceForm.images || []).filter(img => img && img.trim() !== '');
            const primaryImage = serviceForm.image || cleanImages[0] || '';
            if (cleanImages.length === 0 && primaryImage) cleanImages.push(primaryImage);

            const formattedHighlights = typeof serviceForm.highlights === 'string'
                ? serviceForm.highlights.split('\n').map(h => h.trim()).filter(Boolean)
                : serviceForm.highlights;

            const payload = {
                ...serviceForm,
                desc: serviceForm.desc || serviceForm.fullDesc,
                fullDesc: serviceForm.fullDesc || serviceForm.desc,
                image: primaryImage,
                images: cleanImages,
                highlights: formattedHighlights
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                if (showToast) showToast(`${editingService ? 'updated' : 'added'} successfully!`, 'success');
                setServiceModalOpen(false);
                setEditingService(null);
                setServiceForm({
                    serviceId: '', title: '', kicker: 'OUR SERVICE', desc: '', fullDesc: '',
                    image: '', images: ['', '', '', '', ''], iconName: 'sofa', highlights: '', deliverables: '', order: 1
                });
                fetchServices();
            }
        } catch (err) {
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        }
    };

    const handleDeleteService = async (id) => {
        if (!(await confirmAction('Are you sure you want to proceed with this deletion?'))) return;
        try {
            const res = await fetch(`${API_BASE}/api/services/${id}`, { method: 'DELETE' });
            if (res.ok) {
                if (showToast) showToast('Operation completed successfully', 'success');
                fetchServices();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReseedServices = async () => {
        if (!(await confirmAction('Are you sure you want to proceed with this deletion?'))) return;
        try {
            const res = await fetch(`${API_BASE}/api/services/reseed`, { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                setServices(data.services || []);
                if (showToast) showToast('Changes saved successfully', 'success');
            }
        } catch (err) {
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        }
    };

    // ── Consultation Actions ──
    const handleUpdateConsultationStatus = async (id, status) => {
        try {
            const res = await fetch(`${API_BASE}/api/consultations/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                if (showToast) showToast(`Consultation status updated to "${status}"`, 'success');
                fetchConsultations();
            }
        } catch (err) {
            console.error(err);
            if (showToast) showToast('Failed to update consultation status.', 'error');
        }
    };

    const handleDeleteConsultation = async (msgId) => {
        if (!(await confirmAction('Are you sure you want to delete this consultation booking?'))) return;
        try {
            const res = await fetch(`${API_BASE}/api/consultations/${msgId}`, { method: 'DELETE' });
            if (res.ok) {
                if (showToast) showToast('Consultation booking deleted successfully!', 'info');
                fetchConsultations();
            } else {
                if (showToast) showToast('Failed to delete consultation booking.', 'error');
            }
        } catch (err) {
            console.error(err);
            if (showToast) showToast('Network error while deleting consultation booking.', 'error');
        }
    };

    // ── Contact & Consultation Reply Actions ──
    const handleOpenReplyModal = (msg) => {
        const isConsultation = !!(msg.service || msg.budget || msg.preferredDate || msg.date || msg.notes);
        setSelectedMsgForReply({ ...msg, isConsultation });

        const clientName = msg.fullName || msg.name || 'Valued Client';

        let defaultSubject = '';
        let defaultMessage = '';

        if (isConsultation) {
            defaultSubject = `Consultation Confirmation: ${msg.service || 'Interior Design Consultation'} - Good Interior Studio`;

            const detailsList = [];
            if (msg.service) detailsList.push(`- Required Service: ${msg.service}`);
            if (msg.budget) detailsList.push(`- Estimated Budget: ${msg.budget}`);
            if (msg.preferredDate || msg.date) detailsList.push(`- Preferred Date: ${msg.preferredDate || msg.date}`);
            if (msg.notes) detailsList.push(`- Project Vision / Notes: "${msg.notes}"`);

            const detailsBlock = detailsList.length > 0 ? `\n\nSubmitted Consultation Details:\n${detailsList.join('\n')}` : '';

            defaultMessage = `Dear ${clientName},\n\nThank you for booking an interior design consultation with Good Interior Design Studio! We have received your request.${detailsBlock}\n\nOur senior interior design team has reviewed your submission and we are eager to assist you with your project. Please let us know if your preferred date works for an in-person studio session or call, or suggest any alternative time that suits you.\n\nBest Regards,\nGood Interior Design Studio Executive Team`;
        } else {
            defaultSubject = `Re: ${msg.subject || msg.serviceType || 'Interior Design Inquiry'} - Good Interior Studio`;

            const userMsgBlock = msg.message ? `\n\nYour Inquiry:\n"${msg.message}"` : '';

            defaultMessage = `Dear ${clientName},\n\nThank you for reaching out to Good Interior Design Studio regarding "${msg.subject || msg.serviceType || 'your inquiry'}".${userMsgBlock}\n\nWe have reviewed your message and would love to assist you with your interior design needs. Please let us know your convenient time for a brief discussion or meeting.\n\nBest Regards,\nGood Interior Design Studio Executive Team`;
        }

        setReplyForm({
            replySubject: defaultSubject,
            replyMessage: defaultMessage
        });
        setReplyModalOpen(true);
    };

    const handleSendEmailReply = async (e) => {
        e.preventDefault();
        if (!replyForm.replySubject || !replyForm.replyMessage) {
            if (showToast) showToast('Please complete all required fields.', 'error');
            return;
        }

        setSendingReply(true);
        try {
            const endpoint = selectedMsgForReply.isConsultation
                ? `${API_BASE}/api/consultations/${selectedMsgForReply._id}/reply`
                : `${API_BASE}/api/contact/${selectedMsgForReply._id}/reply`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(replyForm)
            });

            const data = await res.json();
            if (res.ok) {
                if (showToast) showToast(`Reply email sent successfully to ${selectedMsgForReply.email}!`, 'success');
                setReplyModalOpen(false);
                if (selectedMsgForReply.isConsultation) {
                    fetchConsultations();
                } else {
                    fetchContactMessages();
                }
            } else {
                if (showToast) showToast(`${data.message || 'Failed to send reply'}`, 'error');
            }
        } catch (err) {
            console.error(err);
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        } finally {
            setSendingReply(false);
        }
    };

    const handleDeleteContactMessage = async (msgId) => {
        if (!(await confirmAction('Are you sure you want to delete this contact message?'))) return;
        try {
            const res = await fetch(`${API_BASE}/api/contact/${msgId}`, { method: 'DELETE' });
            if (res.ok) {
                if (showToast) showToast('Contact message deleted successfully!', 'info');
                fetchContactMessages();
            } else {
                if (showToast) showToast('Failed to delete contact message.', 'error');
            }
        } catch (err) {
            console.error(err);
            if (showToast) showToast('Network error while deleting message.', 'error');
        }
    };

    // ── Gallery Actions ──
    const handleSaveGalleryHero = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/gallery/hero`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(galleryHeroForm)
            });
            const data = await res.json();
            if (res.ok) {
                if (showToast) showToast('Changes saved successfully', 'success');
                setGalleryHeroModalOpen(false);
                fetchGalleryHero();
            } else {
                if (showToast) showToast(`${data.message || 'Failed to update hero'}`, 'error');
            }
        } catch (err) {
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        }
    };

    const handleSaveGalleryItem = async (e) => {
        e.preventDefault();
        if (!galleryItemForm.src) {
            if (showToast) showToast('Please complete all required fields.', 'error');
            return;
        }

        try {
            const url = editingGalleryItem ? `${API_BASE}/api/gallery/items/${editingGalleryItem._id}` : `${API_BASE}/api/gallery/items`;
            const method = editingGalleryItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(galleryItemForm)
            });
            const data = await res.json();
            if (res.ok) {
                if (showToast) showToast(`${editingGalleryItem ? 'updated' : 'added'} successfully!`, 'success');
                setGalleryItemModalOpen(false);
                setEditingGalleryItem(null);
                setGalleryItemForm({ title: '', type: 'living', src: '', shape: 'standard', order: 1 });
                fetchGalleryItems();
            } else {
                if (showToast) showToast(`${data.message || 'Failed to save item'}`, 'error');
            }
        } catch (err) {
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        }
    };

    const handleDeleteGalleryItem = async (id) => {
        if (!(await confirmAction('Are you sure you want to proceed with this deletion?'))) return;
        try {
            const res = await fetch(`${API_BASE}/api/gallery/items/${id}`, { method: 'DELETE' });
            if (res.ok) {
                if (showToast) showToast('Operation completed successfully', 'success');
                fetchGalleryItems();
            }
        } catch (err) {
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        }
    };


    // ── Contact Page Settings Handlers ──
    const handleSaveContactHero = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/contact-settings/hero`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactHeroForm)
            });
            if (res.ok) {
                if (showToast) showToast('Changes saved successfully', 'success');
                setContactHeroModalOpen(false);
                fetchContactPageSettings();
            }
        } catch (err) {
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        }
    };

    const handleSaveContactInfo = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/contact-settings/info`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactInfoForm)
            });
            if (res.ok) {
                if (showToast) showToast('Changes saved successfully', 'success');
                setContactInfoModalOpen(false);
                fetchContactPageSettings();
            }
        } catch (err) {
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        }
    };

    const handleSaveContactMap = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/contact-settings/map`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...contactMapForm,
                    latitude: parseFloat(contactMapForm.latitude),
                    longitude: parseFloat(contactMapForm.longitude)
                })
            });
            if (res.ok) {
                if (showToast) showToast('Map location updated!', 'success');
                setContactMapModalOpen(false);
                fetchContactPageSettings();
            }
        } catch (err) {
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        }
    };

    const handleSaveContactJourney = async (e) => {
        e.preventDefault();
        try {
            const images = [
                contactJourneyForm.img1,
                contactJourneyForm.img2,
                contactJourneyForm.img3,
                contactJourneyForm.img4
            ].filter(Boolean);

            const payload = {
                title: contactJourneyForm.title,
                description: contactJourneyForm.description,
                socialLinks: {
                    facebook: contactJourneyForm.facebook,
                    instagram: contactJourneyForm.instagram,
                    pinterest: contactJourneyForm.pinterest,
                    linkedin: contactJourneyForm.linkedin
                },
                images
            };

            const res = await fetch(`${API_BASE}/api/contact-settings/journey`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                if (showToast) showToast('Changes saved successfully', 'success');
                setContactJourneyModalOpen(false);
                fetchContactPageSettings();
            } else {
                if (showToast) showToast(data.message || 'Failed to update journey section', 'error');
            }
        } catch (err) {
            console.error('Journey save error:', err);
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        }
    };

    const handleSaveAboutSection = async (sectionKey, formData) => {
        try {
            const body = {};
            body[sectionKey] = formData;
            const res = await fetch(`${API_BASE}/api/about`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const updatedData = await res.json();
            if (res.ok) {
                if (showToast) showToast(`${sectionKey} updated successfully!`, 'success');
                setAboutData(updatedData);
            } else {
                if (showToast) showToast(`${updatedData.error || 'Failed to update'}`, 'error');
            }
        } catch (err) {
            if (showToast) showToast(`${sectionKey}`, 'error');
            console.error(err);
        }
    };

    // Calculate Stats
    const activeHeroCount = heroSlides.filter(s => s.active !== false).length;
    const pendingConsultationsCount = consultations.filter(c => (!c.status || c.status.toLowerCase() === 'pending' || c.status.toLowerCase() === 'new') && !c.replyMessage).length;
    const totalConsultationsCount = consultations.length;
    const totalContactCount = contactMessages.length;
    const unreadContactCount = contactMessages.filter(m => (!m.status || m.status.toLowerCase() === 'new' || m.status.toLowerCase() === 'pending') && !m.replyMessage).length;
    const pendingTestimonialsCount = testimonials.filter(t => !t.isApproved).length;

    // Filtered Consultations
    const filteredConsultations = consultations.filter(c => {
        const matchesFilter = consultationFilter === 'ALL' || (c.status && c.status.toUpperCase() === consultationFilter);
        const matchesSearch = !searchQuery ||
            c.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.phone?.includes(searchQuery);
        return matchesFilter && matchesSearch;
    });

    // Filtered Messages
    const filteredMessages = contactMessages.filter(m => {
        return !searchQuery ||
            m.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.message?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleSaveTestiHero = async (e) => {
        e.preventDefault();
        try {
            let finalTitle = testiHeroForm.titleLine1 || '';
            if (testiHeroForm.titleGold) {
                finalTitle += `<br /><span class="gold-text-italic">${testiHeroForm.titleGold}</span>`;
            }
            if (testiHeroForm.titleLine2) {
                finalTitle += ` ${testiHeroForm.titleLine2}`;
            }

            const dataToSave = {
                kicker: testiHeroForm.kicker,
                title: finalTitle,
                subtitle: (testiHeroForm.subtitle || '').replace(/\r?\n/g, '<br />'),
                bgImage: testiHeroForm.bgImage
            };

            const res = await fetch(`${API_BASE}/api/testimonials/hero`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSave)
            });
            if (res.ok) {
                if (showToast) showToast('Changes saved successfully', 'success');
                setTestiHeroModalOpen(false);
                fetchTestiHero();
            }
        } catch (err) {
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        }
    };

    const handleSaveTestiQuote = async (e) => {
        e.preventDefault();
        try {
            const dataToSave = {
                ...testiHero,
                ...testiQuoteForm,
                quoteText: (testiQuoteForm.quoteText || '').replace(/\r?\n/g, '<br />')
            };
            const res = await fetch(`${API_BASE}/api/testimonials/hero`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSave)
            });
            if (res.ok) {
                if (showToast) showToast('Changes saved successfully', 'success');
                setTestiQuoteModalOpen(false);
                fetchTestiHero();
            }
        } catch (err) {
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        }
    };

    const handleSaveTestiStats = async (e) => {
        e.preventDefault();
        try {
            const dataToSave = { ...testiHero, ...testiStatsForm };
            const res = await fetch(`${API_BASE}/api/testimonials/hero`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSave)
            });
            if (res.ok) {
                if (showToast) showToast('Changes saved successfully', 'success');
                setTestiStatsModalOpen(false);
                fetchTestiHero();
            }
        } catch (err) {
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        }
    };

    const handleSaveTesti = async (e) => {
        e.preventDefault();
        try {
            const method = editingTesti ? 'PUT' : 'POST';
            const url = editingTesti ? `${API_BASE}/api/testimonials/${editingTesti._id}` : `${API_BASE}/api/testimonials`;
            const finalData = { ...testiForm, isApproved: testiForm.isApproved !== undefined ? testiForm.isApproved : true };
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalData)
            });
            if (res.ok) {
                if (showToast) showToast(`${editingTesti ? 'updated' : 'added'}!`, 'success');
                setTestiModalOpen(false);
                fetchTestimonials();
            }
        } catch (err) {
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        }
    };

    const handleDeleteTesti = async (id) => {
        if (!(await confirmAction('Are you sure you want to proceed with this deletion?'))) return;
        try {
            const res = await fetch(`${API_BASE}/api/testimonials/${id}`, { method: 'DELETE' });
            if (res.ok) {
                if (showToast) showToast('Changes saved successfully', 'success');
                fetchTestimonials();
            }
        } catch (err) {
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        }
    };

    const handleToggleTestiApproval = async (testi) => {
        try {
            const res = await fetch(`${API_BASE}/api/testimonials/${testi._id || testi.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isApproved: !testi.isApproved })
            });
            if (res.ok) {
                if (showToast) showToast(`${!testi.isApproved ? 'Approved' : 'Unpublished'}!`, 'success');
                fetchTestimonials();
            }
        } catch (err) {
            if (showToast) showToast('An error occurred. Please try again.', 'error');
        }
    };

    const getHeroTitleParts = () => {
        const titleHtml = aboutData?.heroInfo?.title || 'Designing Spaces. <br />Defining <span class="highlight-text">Experiences.</span>';
        try {
            const parts = titleHtml.split(/<br\s*\/?>/i);
            const part1 = parts[0]?.trim() || '';
            let part2 = '';
            let highlight = '';
            if (parts[1]) {
                const spanSplit = parts[1].split(/<span class="highlight-text">/i);
                part2 = spanSplit[0]?.trim() || '';
                if (spanSplit[1]) {
                    highlight = spanSplit[1].replace(/<\/span>/i, '').trim();
                }
            }
            return { part1, part2, highlight };
        } catch {
            return { part1: 'Designing Spaces.', part2: 'Defining', highlight: 'Experiences.' };
        }
    };
    const heroParts = activeTab === 'about' && aboutData ? getHeroTitleParts() : {};

    const getPhilTitleParts = () => {
        const titleHtml = aboutData?.philosophy?.title || 'Designing With Purpose,<br />Creating With Passion';
        try {
            const parts = titleHtml.split(/<br\s*\/?>/i);
            return { part1: parts[0]?.trim() || '', part2: parts[1]?.trim() || '' };
        } catch {
            return { part1: 'Designing With Purpose,', part2: 'Creating With Passion' };
        }
    };
    const philParts = activeTab === 'about' && aboutData ? getPhilTitleParts() : {};

    return (
        <div className="admin-luxury-suite">
            {/* ── TOP EXECUTIVE BAR ── */}
            <header className="admin-executive-topbar">
                <div className="topbar-inner">
                    <div className="admin-brand">
                        <img src={globalSettings?.logoUrl || logo} alt="Good Interior" className="admin-brand-logo" />
                        <div className="admin-brand-text">
                            <span className="brand-title">{globalSettings?.siteTitle || 'GOOD INTERIOR'}</span>
                            <span className="brand-sub">EXECUTIVE CONTROL SUITE</span>
                        </div>
                    </div>

                    <div className="admin-topbar-actions">
                        <Link to="/" className="btn-exit-website">
                            <TbExternalLink /> Back to Website
                        </Link>

                        <div className="admin-profile-pill">
                            <div className="admin-avatar">
                                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div className="admin-info">
                                <span className="admin-name">{user?.fullName || 'Administrator'}</span>
                                <span className="admin-role">System Admin</span>
                            </div>
                            <button className="btn-admin-logout" title="Log Out" onClick={logout}>
                                <TbLogout />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── HERO BANNER & ANALYTICS DASHBOARD ── */}
            <section className="admin-hero-banner">
                <div className="banner-content">
                    <div className="banner-badge">
                        <TbShieldCheck /> OFFICIAL ADMIN CONTROL PANEL
                    </div>
                    <h1>Content & Operations Control Studio</h1>
                    <p>Manage dynamic homepage slides, portfolio showcases, client booking requests, and site enquiries seamlessly.</p>
                </div>

                {/* ── KPI METRICS CARDS ── */}
                <div className="admin-kpi-grid">
                    <div className="kpi-card" onClick={() => setActiveTab('hero')}>
                        <div className="kpi-icon-box gold">
                            <TbSlideshow />
                        </div>
                        <div className="kpi-details">
                            <span className="kpi-label">Active Hero Slides</span>
                            <div className="kpi-value">{activeHeroCount} <span>/ {heroSlides.length}</span></div>
                            <span className="kpi-subtext">Homepage Backgrounds</span>
                        </div>
                    </div>

                    <div className="kpi-card" onClick={() => setActiveTab('projects')}>
                        <div className="kpi-icon-box blue">
                            <TbBriefcase />
                        </div>
                        <div className="kpi-details">
                            <span className="kpi-label">Portfolio Projects</span>
                            <div className="kpi-value">{projects.length}</div>
                            <span className="kpi-subtext">Showcase Items</span>
                        </div>
                    </div>

                    <div className="kpi-card" onClick={() => setActiveTab('consultations')}>
                        <div className="kpi-icon-box amber">
                            <TbCalendarEvent />
                        </div>
                        <div className="kpi-details">
                            <span className="kpi-label">Pending Bookings</span>
                            <div className="kpi-value">{pendingConsultationsCount} <span>/ {totalConsultationsCount}</span></div>
                            <span className="kpi-subtext">Requires Client Response</span>
                        </div>
                    </div>

                    <div className="kpi-card" onClick={() => setActiveTab('gallery')}>
                        <div className="kpi-icon-box gold">
                            <TbPhoto />
                        </div>
                        <div className="kpi-details">
                            <span className="kpi-label">Galleries Showcase</span>
                            <div className="kpi-value">{galleryItems.length}</div>
                            <span className="kpi-subtext">Gallery Items & Hero</span>
                        </div>
                    </div>

                    <div className="kpi-card" onClick={() => setActiveTab('contact')}>
                        <div className="kpi-icon-box green">
                            <TbMail />
                        </div>
                        <div className="kpi-details">
                            <span className="kpi-label">Contact Enquiries</span>
                            <div className="kpi-value">{unreadContactCount > 0 ? <>{unreadContactCount} <span>/ {totalContactCount}</span></> : totalContactCount}</div>
                            <span className="kpi-subtext">{unreadContactCount > 0 ? 'Unread Messages' : 'Client Messages'}</span>
                        </div>
                    </div>

                </div>
            </section>

            {/* ── MAIN WORKSPACE CONTAINER ── */}
            <div className="admin-workspace-container">

                {/* Left Navigation Bar */}
                <nav className="admin-tab-nav">
                    <button
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <TbTrendingUp className="tab-icon" /> Dashboard Overview
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <TbUsers className="tab-icon" /> User Management ({users.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'hero' ? 'active' : ''}`}
                        onClick={() => setActiveTab('hero')}
                    >
                        <TbSlideshow className="tab-icon" /> Home Page Manage
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
                        onClick={() => setActiveTab('projects')}
                    >
                        <TbBriefcase className="tab-icon" /> Portfolio Projects ({projects.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
                        onClick={() => setActiveTab('services')}
                    >
                        <TbLayoutGrid className="tab-icon" /> Services Page Manage ({services.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'consultations' ? 'active' : ''}`}
                        onClick={() => setActiveTab('consultations')}
                    >
                        <TbCalendarEvent className="tab-icon" /> Consultations ({consultations.length})
                        {pendingConsultationsCount > 0 && (
                            <span className="tab-badge-counter">{pendingConsultationsCount}</span>
                        )}
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
                        onClick={() => setActiveTab('contact')}
                    >
                        <TbMail className="tab-icon" /> Contact Enquiries ({contactMessages.length})
                        {unreadContactCount > 0 && (
                            <span className="tab-badge-counter">{unreadContactCount}</span>
                        )}
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'contactPage' ? 'active' : ''}`}
                        onClick={() => setActiveTab('contactPage')}
                    >
                        <TbAddressBook className="tab-icon" /> Contact Page Settings
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'blog' ? 'active' : ''}`}
                        onClick={() => setActiveTab('blog')}
                    >
                        <TbFolder className="tab-icon" /> Blog Management ({blogPosts.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'testimonials' ? 'active' : ''}`}
                        onClick={() => setActiveTab('testimonials')}
                    >
                        <TbStar className="tab-icon" /> Client Testimonials ({testimonials.length})
                        {pendingTestimonialsCount > 0 && (
                            <span className="tab-badge-counter">{pendingTestimonialsCount}</span>
                        )}
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
                        onClick={() => setActiveTab('about')}
                    >
                        <TbInfoCircle className="tab-icon" /> About Page Settings
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'careers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('careers')}
                    >
                        <TbBriefcase className="tab-icon" /> Careers Manage ({jobOpenings.length})
                        {jobApplications.length > 0 && (
                            <span className="tab-badge-counter">{jobApplications.length}</span>
                        )}
                    </button>

                </nav>

                {/* Right Content Panel */}
                <main className="admin-content-panel">

                    {loading && (
                        <div className="admin-loading-state">
                            <TbRefresh className="spin-icon" />
                            <span>Synchronizing live data with MongoDB Atlas...</span>
                        </div>
                    )}

                    {/* ── OVERVIEW TAB ── */}
                    {!loading && activeTab === 'overview' && (
                        <div className="panel-section">
                            <div className="panel-header">
                                <div>
                                    <h2>Executive Overview</h2>
                                    <p>Quick summary of recent client activity, homepage slideshow status, and studio portfolio.</p>
                                </div>
                                <button className="btn-refresh" onClick={fetchAllData}>
                                    <TbRefresh /> Refresh All
                                </button>
                            </div>

                            <div className="overview-grid">
                                {/* Recent Consultations Box */}
                                <div className="overview-card">
                                    <div className="card-top">
                                        <h3>Recent Consultation Requests</h3>
                                        <button className="view-all-link" onClick={() => setActiveTab('consultations')}>View All →</button>
                                    </div>
                                    {consultations.length === 0 ? (
                                        <p className="empty-text">No consultation bookings received yet.</p>
                                    ) : (
                                        <ul className="mini-activity-list">
                                            {consultations.slice(0, 4).map(item => (
                                                <li key={item._id} className="activity-item">
                                                    <div className="item-main">
                                                        <strong>{item.fullName}</strong>
                                                        <span className="item-sub"><TbCalendarEvent style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />{new Date(item.createdAt).toLocaleDateString()} &bull; {item.service || 'Design Consultation'}</span>
                                                    </div>
                                                    <span className={`status-tag ${item.status?.toLowerCase() || 'pending'}`}>
                                                        {item.status || 'Pending'}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Active Hero Slides Summary Box */}
                                <div className="overview-card">
                                    <div className="card-top">
                                        <h3>Active Hero Slides</h3>
                                        <button className="view-all-link" onClick={() => setActiveTab('hero')}>Manage Slides →</button>
                                    </div>
                                    <div className="mini-slides-preview">
                                        {heroSlides.slice(0, 3).map((slide, idx) => (
                                            <div key={slide._id || idx} className="mini-slide-thumb">
                                                <img src={slide.image} alt="Hero preview" />
                                                <div className="thumb-info">
                                                    <span className="slide-num">Slide #{slide.order || idx + 1}</span>
                                                    <h4>{slide.title || 'Image Only Slide'}</h4>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* ── Global Site Branding Quick-Edit Card ── */}
                            <div className="overview-card" style={{ marginTop: '24px', borderLeft: '4px solid #f43f5e' }}>
                                <div className="card-top">
                                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.25)', color: '#f43f5e', width: '32px', height: '32px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}><TbLayoutBoard /></span>
                                        Global Site Branding
                                        <span style={{ fontSize: '0.7rem', fontWeight: '500', color: '#94a3b8', marginLeft: '4px' }}>(Header &amp; Footer)</span>
                                    </h3>
                                    <button className="btn-primary-gold" style={{ padding: '8px 16px', fontSize: '0.82rem' }} onClick={() => {
                                        const g = globalSettings || {};
                                        setGlobalSettingsForm({
                                            logoUrl: g.logoUrl || '',
                                            siteTitle: g.siteTitle || 'GOOD INTERIOR',
                                            siteSubtitle: g.siteSubtitle || 'DESIGN STUDIO',
                                            footerDesc: g.footerDesc || 'We design thoughtful interiors that\ninspire and elevate the way you live.',
                                            footerCopyright: g.footerCopyright || '\u00a9 2025 Good Interior. All Rights Reserved.'
                                        });
                                        setGlobalSettingsModalOpen(true);
                                    }}>
                                        <TbEdit /> Edit Branding
                                    </button>
                                </div>
                                <div className="branding-preview-grid">
                                    {/* Logo Preview */}
                                    <div style={{ background: '#0f172a', borderRadius: '10px', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '100px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                        {globalSettings?.logoUrl ? (
                                            <img src={globalSettings.logoUrl} alt="Logo" style={{ maxHeight: '36px', maxWidth: '90px', objectFit: 'contain' }} />
                                        ) : (
                                            <span style={{ color: '#64748b', fontSize: '0.78rem', textAlign: 'center' }}>Default<br />SVG Logo</span>
                                        )}
                                    </div>
                                    {/* Site Title */}
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', marginBottom: '4px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Site Name</span>
                                        <div>
                                            <strong style={{ color: '#fff', fontSize: '1rem', letterSpacing: '0.5px' }}>{globalSettings?.siteTitle || 'GOOD INTERIOR'}</strong>
                                            <span style={{ color: '#b38058', fontSize: '0.75rem', marginLeft: '8px', letterSpacing: '2px' }}>{globalSettings?.siteSubtitle || 'DESIGN STUDIO'}</span>
                                        </div>
                                    </div>
                                    {/* Footer Copy */}
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', marginBottom: '4px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Footer Copyright</span>
                                        <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{globalSettings?.footerCopyright || '\u00a9 2025 Good Interior. All Rights Reserved.'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── TAB: USER MANAGEMENT & AUTH BRANDING ── */}
                    {!loading && activeTab === 'users' && (() => {
                        const filteredUsers = users.filter(u => {
                            const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
                            const q = userSearch.toLowerCase();
                            const matchSearch = !q || u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.country?.toLowerCase().includes(q);
                            return matchRole && matchSearch;
                        });
                        return (
                            <div className="panel-section">
                                <div className="panel-header">
                                    <div>
                                        <h2>User & Auth Management</h2>
                                        <p>Manage registered user accounts, edit system roles, and customize Login & Signup page branding text.</p>
                                    </div>
                                    {userSubTab === 'accounts' ? (
                                        <button className="btn-primary-gold" onClick={handleOpenAddUser}>
                                            <TbPlus /> ADD NEW USER
                                        </button>
                                    ) : (
                                        <button className="btn-primary-gold" onClick={handleSaveAuthBranding}>
                                            <TbCheck /> SAVE AUTH BRANDING
                                        </button>
                                    )}
                                </div>

                                {/* User Management Sub-Tabs */}
                                <div className="admin-subtab-bar">
                                    <button
                                        onClick={() => setUserSubTab('accounts')}
                                        style={{
                                            background: userSubTab === 'accounts' ? '#c48b59' : 'transparent',
                                            color: userSubTab === 'accounts' ? '#fff' : '#94a3b8',
                                            border: userSubTab === 'accounts' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '6px',
                                            padding: '8px 18px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <TbUsers /> User Accounts ({users.length})
                                    </button>
                                    <button
                                        onClick={() => setUserSubTab('authBranding')}
                                        style={{
                                            background: userSubTab === 'authBranding' ? '#c48b59' : 'transparent',
                                            color: userSubTab === 'authBranding' ? '#fff' : '#94a3b8',
                                            border: userSubTab === 'authBranding' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '6px',
                                            padding: '8px 18px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <TbLock /> Auth Page Branding (Login & Signup)
                                    </button>
                                </div>

                                {/* SUB-TAB 1: USER ACCOUNTS */}
                                {userSubTab === 'accounts' && (
                                    <>
                                        {/* Search & Filter Bar */}
                                        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                                            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                                                <TbSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '16px' }} />
                                                <input
                                                    type="text"
                                                    placeholder="Search by name, email or country..."
                                                    value={userSearch}
                                                    onChange={e => setUserSearch(e.target.value)}
                                                    style={{ width: '100%', padding: '10px 12px 10px 36px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                            {['ALL', 'user', 'admin'].map(role => (
                                                <button
                                                    key={role}
                                                    onClick={() => setUserRoleFilter(role)}
                                                    style={{ padding: '10px 18px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', border: 'none', background: userRoleFilter === role ? '#c48b59' : '#1e293b', color: userRoleFilter === role ? '#fff' : '#94a3b8', border: userRoleFilter === role ? 'none' : '1px solid rgba(255,255,255,0.08)' }}
                                                >
                                                    {role === 'ALL' ? `All Users (${users.length})` : role === 'admin' ? `Admins (${users.filter(u => u.role === 'admin').length})` : `Members (${users.filter(u => u.role === 'user').length})`}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Stats Row */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                                            {[
                                                { label: 'Total Users', value: users.length, Icon: TbUsers, color: '#3b82f6' },
                                                { label: 'Admin Accounts', value: users.filter(u => u.role === 'admin').length, Icon: TbShield, color: '#c48b59' },
                                                { label: 'Members', value: users.filter(u => u.role === 'user').length, Icon: TbUserCheck, color: '#10b981' }
                                            ].map(stat => (
                                                <div key={stat.label} style={{ background: '#1e293b', borderRadius: '10px', padding: '16px 20px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                    <div style={{ background: stat.color + '22', borderRadius: '10px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <stat.Icon style={{ fontSize: '22px', color: stat.color }} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '1.6rem', fontWeight: '700', color: stat.color }}>{stat.value}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Users Table */}
                                        {filteredUsers.length === 0 ? (
                                            <div className="empty-state-card">
                                                <TbUsers className="empty-icon" />
                                                <h3>No Users Found</h3>
                                                <p>No users match your current search or filter.</p>
                                            </div>
                                        ) : (
                                            <div style={{ overflowX: 'auto' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                                    <thead>
                                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                            {['User', 'Email', 'Phone', 'Country', 'Role', 'Joined', 'Actions'].map(h => (
                                                                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: '700', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredUsers.map((u, idx) => (
                                                            <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                            >
                                                                <td style={{ padding: '12px 14px' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: u.role === 'admin' ? 'linear-gradient(135deg,#c48b59,#8c5c38)' : 'linear-gradient(135deg,#3b82f6,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '14px', flexShrink: 0, overflow: 'hidden' }}>
                                                                            {u.avatar ? <img src={u.avatar} alt={u.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : u.fullName?.charAt(0)?.toUpperCase()}
                                                                        </div>
                                                                        <span style={{ color: '#f1f5f9', fontWeight: '600' }}>{u.fullName}</span>
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '12px 14px', color: '#94a3b8' }}>{u.email}</td>
                                                                <td style={{ padding: '12px 14px', color: '#94a3b8' }}>{u.phone || '—'}</td>
                                                                <td style={{ padding: '12px 14px', color: '#94a3b8' }}>{u.country || '—'}</td>
                                                                <td style={{ padding: '12px 14px' }}>
                                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', background: u.role === 'admin' ? 'rgba(196,139,89,0.15)' : 'rgba(16,185,129,0.12)', color: u.role === 'admin' ? '#c48b59' : '#10b981', border: u.role === 'admin' ? '1px solid rgba(196,139,89,0.3)' : '1px solid rgba(16,185,129,0.25)' }}>
                                                                        {u.role === 'admin' ? <><TbShield style={{ fontSize: '12px' }} /> Admin</> : <><TbUserCheck style={{ fontSize: '12px' }} /> Member</>}
                                                                    </span>
                                                                </td>
                                                                <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.8rem' }}>
                                                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                                </td>
                                                                <td style={{ padding: '12px 14px' }}>
                                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                                        <button
                                                                            className="btn-action-btn edit"
                                                                            onClick={() => handleOpenEditUser(u)}
                                                                            title="Edit User"
                                                                        >
                                                                            <TbEdit /> Edit
                                                                        </button>
                                                                        <button
                                                                            className="btn-action-btn delete"
                                                                            onClick={() => handleDeleteUser(u._id)}
                                                                            title="Delete User"
                                                                        >
                                                                            <TbTrash />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* SUB-TAB 2: AUTH BRANDING & FEATURES */}
                                {userSubTab === 'authBranding' && (
                                    <form onSubmit={handleSaveAuthBranding} className="modal-form-luxury" style={{ display: 'grid', gap: '24px' }}>

                                        {/* LOGIN BRANDING CARD */}
                                        <div style={{ background: '#141720', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '16px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <TbLock style={{ color: '#c48b59' }} /> Login Page Branding Text
                                            </h3>
                                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Login Title</label>
                                                <input
                                                    type="text"
                                                    value={authBrandingData.loginTitle || ''}
                                                    onChange={e => setAuthBrandingData({ ...authBrandingData, loginTitle: e.target.value })}
                                                    placeholder="e.g. Welcome Back"
                                                    style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Login Subtitle (Use Enter for line breaks)</label>
                                                <textarea
                                                    rows="3"
                                                    value={authBrandingData.loginSubtitle || ''}
                                                    onChange={e => setAuthBrandingData({ ...authBrandingData, loginSubtitle: e.target.value })}
                                                    placeholder="e.g. Log in to access your projects..."
                                                    style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                                />
                                            </div>
                                        </div>

                                        {/* SIGNUP BRANDING CARD */}
                                        <div style={{ background: '#141720', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '16px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <TbUserCheck style={{ color: '#c48b59' }} /> Signup Page Branding Text
                                            </h3>
                                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Signup Title</label>
                                                <input
                                                    type="text"
                                                    value={authBrandingData.signupTitle || ''}
                                                    onChange={e => setAuthBrandingData({ ...authBrandingData, signupTitle: e.target.value })}
                                                    placeholder="e.g. Elevate Your Interior Experience"
                                                    style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Signup Subtitle (Use Enter for line breaks)</label>
                                                <textarea
                                                    rows="3"
                                                    value={authBrandingData.signupSubtitle || ''}
                                                    onChange={e => setAuthBrandingData({ ...authBrandingData, signupSubtitle: e.target.value })}
                                                    placeholder="e.g. Join Good Interior Studio to curate..."
                                                    style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                                />
                                            </div>
                                        </div>

                                        {/* SIGNUP FEATURES LIST CARD */}
                                        <div style={{ background: '#141720', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '10px' }}>
                                                <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <TbStar style={{ color: '#c48b59' }} /> Signup Left-Side Feature Points
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = [
                                                            ...(authBrandingData.signupFeatures || []),
                                                            { icon: 'RiBookmarkLine', title: 'New Feature Title', description: 'Describe this feature point...' }
                                                        ];
                                                        setAuthBrandingData({ ...authBrandingData, signupFeatures: updated });
                                                    }}
                                                    style={{ background: 'rgba(196,139,89,0.15)', color: '#c48b59', border: '1px solid rgba(196,139,89,0.3)', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                >
                                                    <TbPlus /> ADD FEATURE POINT
                                                </button>
                                            </div>

                                            <div style={{ display: 'grid', gap: '16px' }}>
                                                {(authBrandingData.signupFeatures || []).map((feat, idx) => (
                                                    <div key={idx} style={{ background: '#0b0d11', borderRadius: '8px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)', display: 'grid', gap: '12px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ color: '#c48b59', fontWeight: 700, fontSize: '0.85rem' }}>Feature Point #{idx + 1}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = authBrandingData.signupFeatures.filter((_, i) => i !== idx);
                                                                    setAuthBrandingData({ ...authBrandingData, signupFeatures: updated });
                                                                }}
                                                                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                            >
                                                                <TbTrash /> Delete
                                                            </button>
                                                        </div>
                                                        <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '12px' }}>
                                                            <div className="form-group">
                                                                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', marginBottom: '6px' }}>Icon</label>
                                                                <select
                                                                    value={feat.icon}
                                                                    onChange={e => {
                                                                        const updated = [...authBrandingData.signupFeatures];
                                                                        updated[idx].icon = e.target.value;
                                                                        setAuthBrandingData({ ...authBrandingData, signupFeatures: updated });
                                                                    }}
                                                                    style={{ width: '100%', padding: '8px 12px', background: '#141720', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                                                                >
                                                                    <option value="RiBookmarkLine">Bookmark Icon</option>
                                                                    <option value="LuFolderOpen">Folder Icon</option>
                                                                    <option value="BsEnvelopePaper">Envelope Icon</option>
                                                                    <option value="IoShieldCheckmarkOutline">Shield Icon</option>
                                                                    <option value="FiUser">User Icon</option>
                                                                    <option value="FiGlobe">Globe Icon</option>
                                                                </select>
                                                            </div>
                                                            <div className="form-group">
                                                                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', marginBottom: '6px' }}>Feature Title</label>
                                                                <input
                                                                    type="text"
                                                                    value={feat.title}
                                                                    onChange={e => {
                                                                        const updated = [...authBrandingData.signupFeatures];
                                                                        updated[idx].title = e.target.value;
                                                                        setAuthBrandingData({ ...authBrandingData, signupFeatures: updated });
                                                                    }}
                                                                    placeholder="Feature Title"
                                                                    style={{ width: '100%', padding: '8px 12px', background: '#141720', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', marginBottom: '6px' }}>Description</label>
                                                            <textarea
                                                                rows="2"
                                                                value={feat.description}
                                                                onChange={e => {
                                                                    const updated = [...authBrandingData.signupFeatures];
                                                                    updated[idx].description = e.target.value;
                                                                    setAuthBrandingData({ ...authBrandingData, signupFeatures: updated });
                                                                }}
                                                                placeholder="Feature Description"
                                                                style={{ width: '100%', padding: '8px 12px', background: '#141720', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <button type="submit" className="btn-save-modal" style={{ justifySelf: 'start', padding: '12px 30px' }}>
                                            SAVE AUTH BRANDING &amp; FEATURES
                                        </button>
                                    </form>
                                )}

                            </div>
                        );
                    })()}

                    {/* ── TAB: HERO SLIDES ── */}
                    {!loading && activeTab === 'hero' && (
                        <div className="panel-section">
                            <div className="panel-header">
                                <div>
                                    <h2>Homepage Management</h2>
                                    <p>Manage the slides, about section, and why choose us section on the home page.</p>
                                </div>
                                {homeSubTab === 'slides' && (
                                    <button
                                        className="btn-primary-gold"
                                        onClick={() => {
                                            setEditingSlide(null);
                                            setSlideForm({ image: '', kicker: '', title: '', subtitle: '', order: heroSlides.length + 1, active: true });
                                            setSlideModalOpen(true);
                                        }}
                                    >
                                        <TbPlus /> ADD HERO SLIDE
                                    </button>
                                )}
                                {homeSubTab !== 'slides' && (
                                    <button
                                        className="btn-primary-gold"
                                        onClick={handleSaveHomeSettings}
                                    >
                                        <TbCheck /> SAVE CHANGES
                                    </button>
                                )}
                            </div>

                            {/* Home Sub-tabs */}
                            <div className="admin-subtab-bar">
                                <button
                                    onClick={() => setHomeSubTab('slides')}
                                    style={{
                                        background: homeSubTab === 'slides' ? '#c48b59' : 'transparent',
                                        color: homeSubTab === 'slides' ? '#fff' : '#94a3b8',
                                        border: homeSubTab === 'slides' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 18px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Hero Slides ({heroSlides.length})
                                </button>
                                <button
                                    onClick={() => setHomeSubTab('about')}
                                    style={{
                                        background: homeSubTab === 'about' ? '#c48b59' : 'transparent',
                                        color: homeSubTab === 'about' ? '#fff' : '#94a3b8',
                                        border: homeSubTab === 'about' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 18px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Who We Are
                                </button>
                                <button
                                    onClick={() => setHomeSubTab('why')}
                                    style={{
                                        background: homeSubTab === 'why' ? '#c48b59' : 'transparent',
                                        color: homeSubTab === 'why' ? '#fff' : '#94a3b8',
                                        border: homeSubTab === 'why' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 18px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Why Choose Us
                                </button>
                            </div>

                            {/* SUB-TAB 1: WHO WE ARE */}
                            {homeSubTab === 'about' && (
                                <div className="admin-form-card modal-form-luxury" style={{ maxWidth: '800px' }}>
                                    <h3 style={{ marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#ffffff' }}>Configure "Who We Are" Section</h3>
                                    <div className="form-group">
                                        <label>Kicker Text</label>
                                        <input type="text" value={homeSettings?.about?.kicker || ''} onChange={e => setHomeSettings({ ...homeSettings, about: { ...homeSettings.about, kicker: e.target.value } })} placeholder="e.g. WHO WE ARE" />
                                    </div>
                                    <div className="form-group">
                                        <label>Main Title (Use Enter for line breaks)</label>
                                        <textarea value={homeSettings?.about?.title || ''} onChange={e => setHomeSettings({ ...homeSettings, about: { ...homeSettings.about, title: e.target.value } })} rows={3}></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>Description Paragraph 1</label>
                                        <textarea value={homeSettings?.about?.desc1 || ''} onChange={e => setHomeSettings({ ...homeSettings, about: { ...homeSettings.about, desc1: e.target.value } })} rows={3}></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>Description Paragraph 2</label>
                                        <textarea value={homeSettings?.about?.desc2 || ''} onChange={e => setHomeSettings({ ...homeSettings, about: { ...homeSettings.about, desc2: e.target.value } })} rows={3}></textarea>
                                    </div>
                                    <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div>
                                            <label>Button Text</label>
                                            <input type="text" value={homeSettings?.about?.buttonText || ''} onChange={e => setHomeSettings({ ...homeSettings, about: { ...homeSettings.about, buttonText: e.target.value } })} />
                                        </div>
                                        <div>
                                            <label>Button Link Destination</label>
                                            <select
                                                value={homeSettings?.about?.buttonLink || '/about'}
                                                onChange={e => setHomeSettings({ ...homeSettings, about: { ...homeSettings.about, buttonLink: e.target.value } })}
                                            >
                                                <option value="/about">About Us Page</option>
                                                <option value="/services">Services Page</option>
                                                <option value="/portfolio">Portfolio Page</option>
                                                <option value="/blog">Blog Page</option>
                                                <option value="/contact">Contact Page</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group img-upload-group">
                                        <label>Side Feature Image (Choose file or provide URL)</label>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <input
                                                type="text"
                                                placeholder="Provide Image URL (https://...)"
                                                value={homeSettings?.about?.image || ''}
                                                onChange={e => setHomeSettings({ ...homeSettings, about: { ...homeSettings.about, image: e.target.value } })}
                                            />
                                            <span>OR</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                id="upload-home-about-img"
                                                style={{ display: 'none' }}
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const b64 = await compressImage(file);
                                                        setHomeSettings({ ...homeSettings, about: { ...homeSettings.about, image: b64 } });
                                                    }
                                                }}
                                            />
                                            <label htmlFor="upload-home-about-img" className="btn-secondary" style={{ padding: '11px 16px', background: '#334155', color: '#fff', cursor: 'pointer', borderRadius: '6px', fontSize: '0.85rem' }}>Choose File</label>
                                        </div>
                                        {homeSettings?.about?.image && <div style={{ marginTop: '10px' }}><img src={homeSettings.about.image} alt="Preview" style={{ height: '80px', borderRadius: '6px' }} /></div>}
                                    </div>
                                </div>
                            )}

                            {/* SUB-TAB 2: WHY CHOOSE US */}
                            {homeSubTab === 'why' && (
                                <div className="admin-form-card modal-form-luxury" style={{ maxWidth: '800px' }}>
                                    <h3 style={{ marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#ffffff' }}>Configure "Why Choose Us" Section</h3>
                                    <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
                                        <div>
                                            <label>Kicker Text</label>
                                            <input type="text" value={homeSettings?.whyChoose?.kicker || ''} onChange={e => setHomeSettings({ ...homeSettings, whyChoose: { ...homeSettings.whyChoose, kicker: e.target.value } })} placeholder="e.g. WHY CHOOSE US" />
                                        </div>
                                        <div>
                                            <label>Main Title (Use Enter for line breaks)</label>
                                            <textarea value={homeSettings?.whyChoose?.title || ''} onChange={e => setHomeSettings({ ...homeSettings, whyChoose: { ...homeSettings.whyChoose, title: e.target.value } })} rows={2}></textarea>
                                        </div>
                                    </div>
                                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '20px 0' }} />
                                    <h4>Features Settings</h4>
                                    {[0, 1, 2, 3].map((idx) => {
                                        const feat = homeSettings?.whyChoose?.features?.[idx] || { iconName: 'FaUserCheck', title: '', description: '' };
                                        return (
                                            <div key={idx} style={{ padding: '15px', background: '#181c26', borderRadius: '8px', marginBottom: '15px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                                <div style={{ display: 'flex', gap: '15px' }}>
                                                    <div style={{ flex: '1' }}>
                                                        <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Feature Icon</label>
                                                        <select
                                                            value={feat.iconName || 'FaUserCheck'}
                                                            onChange={e => {
                                                                const newFs = [...(homeSettings?.whyChoose?.features || [])];
                                                                newFs[idx] = { ...newFs[idx], iconName: e.target.value };
                                                                setHomeSettings({ ...homeSettings, whyChoose: { ...homeSettings.whyChoose, features: newFs } });
                                                            }}
                                                        >
                                                            <option value="FaUserCheck">User Check (Personalized)</option>
                                                            <option value="FaRegBuilding">Building (Team/Experience)</option>
                                                            <option value="FaGem">Gem (Quality/Trust)</option>
                                                            <option value="FaRegClock">Clock (Time/Delivery)</option>
                                                        </select>
                                                    </div>
                                                    <div style={{ flex: '2' }}>
                                                        <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Title</label>
                                                        <input
                                                            type="text"
                                                            value={feat.title || ''}
                                                            onChange={e => {
                                                                const newFs = [...(homeSettings?.whyChoose?.features || [])];
                                                                newFs[idx] = { ...newFs[idx], title: e.target.value };
                                                                setHomeSettings({ ...homeSettings, whyChoose: { ...homeSettings.whyChoose, features: newFs } });
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div style={{ marginTop: '10px' }}>
                                                    <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Description</label>
                                                    <textarea
                                                        rows="2"
                                                        value={feat.description || ''}
                                                        onChange={e => {
                                                            const newFs = [...(homeSettings?.whyChoose?.features || [])];
                                                            newFs[idx] = { ...newFs[idx], description: e.target.value };
                                                            setHomeSettings({ ...homeSettings, whyChoose: { ...homeSettings.whyChoose, features: newFs } });
                                                        }}
                                                    ></textarea>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* SUB-TAB 0: SLIDES */}
                            {homeSubTab === 'slides' && (
                                <>
                                    {heroSlides.length === 0 ? (
                                        <div className="empty-state-card">
                                            <TbPhoto className="empty-icon" />
                                            <h3>No Hero Slides Found</h3>
                                            <p>Add high-resolution interior photography to showcase on the main homepage hero slideshow.</p>
                                            <button className="btn-primary-gold" onClick={() => setSlideModalOpen(true)}>Add First Hero Slide</button>
                                        </div>
                                    ) : (
                                        <div className="hero-slides-grid-luxury">
                                            {heroSlides.map((slide, idx) => (
                                                <div key={slide._id || idx} className={`luxury-slide-card ${!slide.active ? 'disabled-slide' : ''}`}>
                                                    <div className="slide-image-wrapper">
                                                        <img src={slide.image} alt="Hero Slide" />
                                                        <span className="slide-number-chip">SLIDE #{slide.order || idx + 1}</span>
                                                        <span className={`slide-status-chip ${slide.active !== false ? 'active' : 'hidden'}`}>
                                                            {slide.active !== false ? '● VISIBLE ON SITE' : '○ HIDDEN'}
                                                        </span>
                                                    </div>
                                                    <div className="slide-content-body">
                                                        <span className="slide-kicker-tag">{slide.kicker || 'YOUR DREAM SPACE AWAITS'}</span>
                                                        <h3 className="slide-title-text">{slide.title || '(No Main Title Provided)'}</h3>
                                                        <p className="slide-sub-text">{slide.subtitle || '(No Subtitle Description Provided)'}</p>
                                                    </div>
                                                    <div className="slide-card-footer">
                                                        <button
                                                            className="btn-action-btn edit"
                                                            onClick={() => {
                                                                setEditingSlide(slide);
                                                                setSlideForm({
                                                                    image: slide.image,
                                                                    kicker: slide.kicker || '',
                                                                    title: slide.title || '',
                                                                    subtitle: slide.subtitle || '',
                                                                    order: slide.order || idx + 1,
                                                                    active: slide.active !== false
                                                                });
                                                                setSlideModalOpen(true);
                                                            }}
                                                        >
                                                            <TbEdit /> Edit Slide
                                                        </button>

                                                        <button
                                                            className="btn-action-btn"
                                                            onClick={() => setLivePreviewSlide(slide)}
                                                            style={{ color: '#60a5fa', borderColor: 'rgba(96, 165, 250, 0.3)' }}
                                                        >
                                                            <TbEye /> Preview
                                                        </button>

                                                        <button
                                                            className={`btn-action-btn toggle ${slide.active !== false ? 'active-state' : ''}`}
                                                            onClick={() => handleToggleSlideActive(slide)}
                                                        >
                                                            {slide.active !== false ? <TbX /> : <TbCheck />}
                                                            {slide.active !== false ? 'Hide' : 'Activate'}
                                                        </button>

                                                        <button
                                                            className="btn-action-btn delete"
                                                            onClick={() => handleDeleteHeroSlide(slide._id)}
                                                        >
                                                            <TbTrash />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* ── TAB: PORTFOLIO PROJECTS ── */}
                    {!loading && activeTab === 'projects' && (
                        <div className="panel-section">
                            <div className="panel-header" style={{ marginBottom: '15px' }}>
                                <div>
                                    <h2>Portfolio & Showcase Projects</h2>
                                    <p>Manage project showcases displayed across the Home showcase section and main Portfolio page.</p>
                                </div>
                                {portfolioSubTab === 'projects' && (
                                    <button
                                        className="btn-primary-gold"
                                        onClick={() => {
                                            setEditingProject(null);
                                            setProjectForm({
                                                title: '', category: 'RESIDENTIAL', filterCategory: 'residential', subCategory: 'living-dining',
                                                image: '', beforeImg: '', afterImg: '', galleryImages: '', description: '', client: '', location: '',
                                                year: '2026', area: '1,850 sq ft', status: 'Completed', projectOverview: '', requirements: '', designConcept: '', keyFeatures: '',
                                                testimonialQuote: '', testimonialAuthor: '', testimonialRole: ''
                                            });
                                            setProjectModalOpen(true);
                                        }}
                                    >
                                        <TbPlus /> ADD NEW PROJECT
                                    </button>
                                )}
                            </div>

                            {/* Portfolio Sub-tabs */}
                            <div className="admin-subtab-bar">
                                <button
                                    onClick={() => setPortfolioSubTab('projects')}
                                    style={{
                                        background: portfolioSubTab === 'projects' ? '#c48b59' : 'transparent',
                                        color: portfolioSubTab === 'projects' ? '#fff' : '#94a3b8',
                                        border: portfolioSubTab === 'projects' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 18px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <TbLayoutGrid style={{ fontSize: '15px' }} /> Projects Grid ({projects.length})
                                </button>
                                <button
                                    onClick={() => setPortfolioSubTab('hero')}
                                    style={{
                                        background: portfolioSubTab === 'hero' ? '#c48b59' : 'transparent',
                                        color: portfolioSubTab === 'hero' ? '#fff' : '#94a3b8',
                                        border: portfolioSubTab === 'hero' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 18px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <TbPhoto style={{ fontSize: '15px' }} /> Portfolio Page Hero
                                </button>
                            </div>

                            {/* SUB-TAB 1: PROJECTS GRID */}
                            {portfolioSubTab === 'projects' && (
                                <div className="projects-grid-luxury">
                                    {projects.map((proj) => (
                                        <div key={proj._id} className="project-card-luxury">
                                            <div className="project-thumb-box">
                                                <img src={proj.image} alt={proj.title} />
                                                <span className="category-chip">{proj.category}</span>
                                            </div>
                                            <div className="project-details-box">
                                                <h3>{proj.title}</h3>
                                                <p>{proj.description}</p>
                                                <div className="project-meta-row">
                                                    <span><TbMapPin style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />{proj.location || 'Colombo'}</span>
                                                    <span><TbUserCheck style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />{proj.client || 'Private Client'}</span>
                                                    <span><TbCalendarEvent style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />{proj.year || '2025'}</span>
                                                </div>
                                            </div>
                                            <div className="project-card-footer">
                                                <button
                                                    className="btn-action-btn edit"
                                                    onClick={() => {
                                                        setEditingProject(proj);
                                                        setProjectForm({
                                                            title: proj.title || '',
                                                            category: proj.category || 'RESIDENTIAL',
                                                            filterCategory: proj.filterCategory || 'residential',
                                                            subCategory: proj.subCategory || 'living-dining',
                                                            image: proj.image || '',
                                                            beforeImg: proj.beforeImg || '',
                                                            afterImg: proj.afterImg || '',
                                                            galleryImages: (proj.galleryImages || []).join('\n'),
                                                            description: proj.description || '',
                                                            client: proj.client || '',
                                                            location: proj.location || '',
                                                            year: proj.year || '2026',
                                                            area: proj.area || '1,850 sq ft',
                                                            status: proj.status || 'Completed',
                                                            projectOverview: proj.projectOverview || '',
                                                            requirements: (proj.requirements || []).join('\n'),
                                                            designConcept: proj.designConcept || '',
                                                            keyFeatures: (proj.keyFeatures || []).join('\n'),
                                                            testimonialQuote: proj.testimonialQuote || '',
                                                            testimonialAuthor: proj.testimonialAuthor || '',
                                                            testimonialRole: proj.testimonialRole || ''
                                                        });
                                                        setProjectModalOpen(true);
                                                    }}
                                                >
                                                    <TbEdit /> Edit
                                                </button>
                                                <button
                                                    className="btn-action-btn delete"
                                                    onClick={() => handleDeleteProject(proj._id)}
                                                >
                                                    <TbTrash /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* SUB-TAB 2: PORTFOLIO HERO */}
                            {portfolioSubTab === 'hero' && (
                                <div className="services-hero-preview-luxury">
                                    <div className="preview-top-bar">
                                        <div className="preview-indicator"><span className="dot active"></span> Live Preview</div>
                                        <button
                                            className="btn-edit-hero-small"
                                            onClick={() => {
                                                const parsed = parsePortfolioHeroTitle(portfolioHero.title || '');
                                                const subRaw = (portfolioHero.subtitle || '').replace(/<br\s*\/?>/gi, '\n');
                                                setPortfolioHeroForm({
                                                    kicker: portfolioHero.kicker || '',
                                                    titleLine1: parsed.titleLine1,
                                                    titleHighlight: parsed.titleHighlight,
                                                    titleSuffix: parsed.titleSuffix,
                                                    subtitleText: subRaw,
                                                    bgImage: portfolioHero.bgImage || ''
                                                });
                                                setPortfolioHeroModalOpen(true);
                                            }}
                                        >
                                            <TbEdit /> Edit Hero Section
                                        </button>
                                    </div>
                                    <div className="mock-hero-area" style={{ backgroundImage: `url(${portfolioHero.bgImage || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=80'})` }}>
                                        <div className="mock-overlay">
                                            <div className="mock-hero-content portfolio-style">
                                                <span className="mock-kicker">{portfolioHero.kicker}</span>
                                                <h1 dangerouslySetInnerHTML={{ __html: portfolioHero.title }}></h1>
                                                <p dangerouslySetInnerHTML={{ __html: portfolioHero.subtitle }}></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                    {/* ── TAB: SERVICES PAGE MANAGEMENT ── */}
                    {!loading && activeTab === 'services' && (
                        <div className="panel-section">
                            <div className="panel-header" style={{ marginBottom: '15px' }}>
                                <div>
                                    <h2>Services Page Management</h2>
                                    <p>Control the Services page hero, header details, service cards, process steps, and modal detail popups.</p>
                                </div>
                                {servicesSubTab === 'cards' && (
                                    <button
                                        className="btn-primary-gold"
                                        onClick={handleOpenAddService}
                                    >
                                        <TbPlus /> ADD NEW SERVICE
                                    </button>
                                )}
                                {servicesSubTab === 'process' && (
                                    <button
                                        className="btn-primary-gold"
                                        onClick={handleOpenAddProcess}
                                    >
                                        <TbPlus /> ADD PROCESS STEP
                                    </button>
                                )}
                                {servicesSubTab === 'why' && (
                                    <button
                                        className="btn-primary-gold"
                                        onClick={handleOpenAddWhyFeature}
                                    >
                                        <TbPlus /> ADD WHY FEATURE
                                    </button>
                                )}
                            </div>

                            {/* Horizontal Sub-tabs */}
                            <div className="admin-subtab-bar">
                                <button
                                    onClick={() => setServicesSubTab('cards')}
                                    style={{
                                        background: servicesSubTab === 'cards' ? '#c48b59' : 'transparent',
                                        color: servicesSubTab === 'cards' ? '#fff' : '#94a3b8',
                                        border: servicesSubTab === 'cards' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 18px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <TbLayoutGrid style={{ fontSize: '15px' }} /> Service Cards ({services.length})
                                </button>
                                <button
                                    onClick={() => setServicesSubTab('process')}
                                    style={{
                                        background: servicesSubTab === 'process' ? '#c48b59' : 'transparent',
                                        color: servicesSubTab === 'process' ? '#fff' : '#94a3b8',
                                        border: servicesSubTab === 'process' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 18px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <TbRefresh style={{ fontSize: '15px' }} /> Work Process Steps ({processSteps.length})
                                </button>
                                <button
                                    onClick={() => setServicesSubTab('why')}
                                    style={{
                                        background: servicesSubTab === 'why' ? '#c48b59' : 'transparent',
                                        color: servicesSubTab === 'why' ? '#fff' : '#94a3b8',
                                        border: servicesSubTab === 'why' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 18px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <TbStar style={{ fontSize: '15px' }} /> Why Choose Us ({whyFeatures.length})
                                </button>
                                <button
                                    onClick={() => setServicesSubTab('hero')}
                                    style={{
                                        background: servicesSubTab === 'hero' ? '#c48b59' : 'transparent',
                                        color: servicesSubTab === 'hero' ? '#fff' : '#94a3b8',
                                        border: servicesSubTab === 'hero' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 18px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <TbPhoto style={{ fontSize: '15px' }} /> Hero & Header Settings
                                </button>
                            </div>

                            {/* SUB-TAB 1: SERVICE CARDS GRID */}
                            {servicesSubTab === 'cards' && (
                                <div className="services-list-luxury">
                                    {services.map(srv => (
                                        <div key={srv._id || srv.serviceId || srv.title} className="service-card-row">
                                            <div className="srv-image-box">
                                                <img src={srv.image || (srv.images && srv.images[0]) || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=300&q=80'} alt={srv.title} />
                                            </div>
                                            <div className="srv-content-box">
                                                <div className="srv-meta-tags">
                                                    <span className="srv-kicker-tag">
                                                        {srv.kicker || 'OUR SERVICE'}
                                                    </span>
                                                    <span className="srv-icon-label">Icon: {srv.iconName || 'sofa'}</span>
                                                </div>
                                                <h3 className="srv-title-heading">{srv.title}</h3>
                                                <p className="srv-desc-text">{srv.desc || srv.description}</p>
                                                {srv.deliverables && (
                                                    <span className="srv-deliverables-text">
                                                        <TbPackage style={{ fontSize: '13px' }} /> Deliverables: {srv.deliverables}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="srv-actions-box">
                                                <button
                                                    onClick={() => handleOpenEditService(srv)}
                                                    className="btn-srv-edit"
                                                >
                                                    <TbEdit /> Edit Service
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteService(srv._id)}
                                                    className="btn-srv-delete"
                                                >
                                                    <TbTrash />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* SUB-TAB 2: WORK PROCESS STEPS */}
                            {servicesSubTab === 'process' && (
                                <div className="services-list-luxury">
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                        {processSteps.map((step) => (
                                            <div key={step._id || step.stepNumber} style={{ background: '#1e293b', borderRadius: '10px', padding: '18px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                        <span style={{ background: '#c48b59', color: '#fff', fontSize: '0.8rem', fontWeight: '800', padding: '2px 10px', borderRadius: '4px' }}>
                                                            STEP {step.stepNumber}
                                                        </span>
                                                        <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Icon: {step.iconName || 'chat'}</span>
                                                    </div>
                                                    <h3 style={{ color: '#fff', fontSize: '1.05rem', margin: '8px 0 6px 0' }}>{step.title}</h3>
                                                    <p style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: '1.4' }}>{step.description}</p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                                                    <button
                                                        onClick={() => handleOpenEditProcess(step)}
                                                        style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '8px 14px', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'center' }}
                                                    >
                                                        <TbEdit /> Edit Step
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProcessStep(step._id)}
                                                        style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', padding: '8px 12px', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        <TbTrash />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SUB-TAB 3: WHY CHOOSE US FEATURES */}
                            {servicesSubTab === 'why' && (
                                <div className="services-list-luxury">
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                        {whyFeatures.map((feat) => (
                                            <div key={feat._id || feat.title} style={{ background: '#1e293b', borderRadius: '10px', padding: '18px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                        <span style={{ background: '#c48b59', color: '#fff', fontSize: '0.8rem', fontWeight: '800', padding: '2px 10px', borderRadius: '4px' }}>
                                                            FEATURE #{feat.order || 1}
                                                        </span>
                                                        <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Icon: {feat.iconName || 'diamond'}</span>
                                                    </div>
                                                    <h3 style={{ color: '#fff', fontSize: '1.05rem', margin: '8px 0 6px 0' }}>{feat.title}</h3>
                                                    <p style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: '1.4' }}>{feat.description}</p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                                                    <button
                                                        onClick={() => handleOpenEditWhyFeature(feat)}
                                                        style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '8px 14px', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'center' }}
                                                    >
                                                        <TbEdit /> Edit Feature
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteWhyFeature(feat._id)}
                                                        style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', padding: '8px 12px', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        <TbTrash />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SUB-TAB 4: HERO & HEADER SETTINGS */}
                            {servicesSubTab === 'hero' && (
                                <div className="services-hero-preview-luxury">
                                    <div className="preview-top-bar">
                                        <div className="preview-indicator"><span className="dot active"></span> Live Preview</div>
                                    </div>
                                    <div className="mock-hero-area" style={{ backgroundImage: `url(${serviceHero.bgImage || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=80'})` }}>
                                        <div className="mock-overlay">
                                            <div className="mock-hero-content portfolio-style">
                                                <span className="mock-kicker">{serviceHero.kicker || 'OUR SERVICES'}</span>
                                                <h1 dangerouslySetInnerHTML={{ __html: serviceHero.title || 'Comprehensive Interior Design Services' }}></h1>
                                                <p dangerouslySetInnerHTML={{ __html: serviceHero.subtitle || 'From concept to completion...' }}></p>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ background: '#1e293b', padding: '24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>

                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginTop: '20px' }}>
                                            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '14px' }}>"What We Offer" Section Header</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                                                <div>
                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>OFFER SECTION SUBTITLE</span>
                                                    <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}>
                                                        {serviceHero.offerKicker || 'WHAT WE OFFER'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>OFFER SECTION TITLE</span>
                                                    <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}>
                                                        {serviceHero.offerTitle || 'Our Interior Design Services'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '20px' }}>
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>OFFER SECTION DESCRIPTION</span>
                                                <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.5' }}>
                                                    {serviceHero.offerDesc || 'We provide end-to-end interior design solutions...'}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginTop: '20px' }}>
                                            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '14px' }}>"Our Process" Section Header</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                                                <div>
                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>PROCESS SECTION SUBTITLE</span>
                                                    <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}>
                                                        {serviceHero.processKicker || 'OUR PROCESS'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>PROCESS SECTION TITLE</span>
                                                    <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}>
                                                        {serviceHero.processTitle || 'A Simple & Transparent Process'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '20px' }}>
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>PROCESS SECTION DESCRIPTION</span>
                                                <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.5' }}>
                                                    {serviceHero.processDesc || 'We follow a structured process to ensure a smooth...'}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginTop: '20px' }}>
                                            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '14px' }}>"Why Choose Us" Section Header & Quote Box</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                                                <div>
                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>WHY SECTION SUBTITLE</span>
                                                    <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}>
                                                        {serviceHero.whyKicker || 'WHY CHOOSE US'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>WHY SECTION TITLE</span>
                                                    <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}>
                                                        <span dangerouslySetInnerHTML={{ __html: serviceHero.whyTitle || 'More Than Design.<br />A Better Way of Living.' }} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '20px' }}>
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>WHY SECTION DESCRIPTION</span>
                                                <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.5' }}>
                                                    {serviceHero.whyDesc || 'We combine creativity, expertise and a client-focused approach...'}
                                                </div>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                                <div>
                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>FLOATING QUOTE TEXT</span>
                                                    <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', color: '#fff', fontSize: '0.88rem' }}>
                                                        "{serviceHero.whyQuote || 'Good design creates spaces where life happens beautifully.'}"
                                                    </div>
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>QUOTE AUTHOR</span>
                                                    <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', color: '#c48b59', fontSize: '0.88rem', fontWeight: '700' }}>
                                                        {serviceHero.whyQuoteAuthor || 'GOOD INTERIOR DESIGN STUDIO'}
                                                    </div>
                                                </div>
                                            </div>
                                            {serviceHero.whyImage ? (
                                                <div style={{ marginBottom: '20px' }}>
                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>WHY SECTION FEATURE IMAGE</span>
                                                    <div style={{ height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                        <img src={serviceHero.whyImage} alt="Why Feature Side Image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ marginBottom: '20px' }}>
                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>WHY SECTION FEATURE IMAGE (DEFAULT)</span>
                                                    <div style={{ height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', opacity: 0.7 }}>
                                                        <img src={aboutImg} alt="Default Feature Image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => {
                                                const parsed = parseHeroTitle(serviceHero.title || '');
                                                setServiceHeroForm({
                                                    kicker: serviceHero.kicker || '',
                                                    titleLine1: parsed.titleLine1,
                                                    titleHighlight: parsed.titleHighlight,
                                                    titleSuffix: parsed.titleSuffix,
                                                    subtitle: serviceHero.subtitle || '',
                                                    bgImage: serviceHero.bgImage || '',
                                                    offerKicker: serviceHero.offerKicker || '',
                                                    offerTitle: serviceHero.offerTitle || '',
                                                    offerDesc: serviceHero.offerDesc || '',
                                                    processKicker: serviceHero.processKicker || '',
                                                    processTitle: serviceHero.processTitle || '',
                                                    processDesc: serviceHero.processDesc || '',
                                                    whyKicker: serviceHero.whyKicker || '',
                                                    whyTitle: serviceHero.whyTitle || '',
                                                    whyDesc: serviceHero.whyDesc || '',
                                                    whyImage: serviceHero.whyImage || '',
                                                    whyQuote: serviceHero.whyQuote || '',
                                                    whyQuoteAuthor: serviceHero.whyQuoteAuthor || ''
                                                });
                                                setServiceHeroModalOpen(true);
                                            }}
                                            style={{
                                                background: 'linear-gradient(135deg, #c48b59 0%, #a36f41 100%)',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '10px 22px',
                                                fontSize: '0.88rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                boxShadow: '0 4px 12px rgba(196, 139, 89, 0.3)',
                                                transition: 'all 0.2s ease-in-out'
                                            }}
                                        >
                                            <TbEdit style={{ fontSize: '1.15rem' }} /> Edit Services Hero & Header Settings
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── TAB: CONSULTATIONS ── */}
                    {!loading && activeTab === 'consultations' && (
                        <div className="panel-section">
                            <div className="panel-header">
                                <div>
                                    <h2>Booked Client Consultations</h2>
                                    <p>Manage and update consultation requests submitted by website visitors.</p>
                                </div>
                                <div className="filter-search-group">
                                    <div className="search-input-box">
                                        <TbSearch />
                                        <input
                                            type="text"
                                            placeholder="Search by client name, email..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <select
                                        className="filter-select"
                                        value={consultationFilter}
                                        onChange={(e) => setConsultationFilter(e.target.value)}
                                    >
                                        <option value="ALL">All Statuses</option>
                                        <option value="PENDING">Pending Only</option>
                                        <option value="CONTACTED">Contacted</option>
                                        <option value="CONFIRMED">Confirmed</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="enquiries-feed" style={{ marginTop: '20px' }}>
                                {filteredConsultations.length === 0 ? (
                                    <div className="empty-state-card">
                                        <TbCalendarEvent className="empty-icon" />
                                        <h3>No Consultations Found</h3>
                                        <p>When clients book a consultation, they will appear here.</p>
                                    </div>
                                ) : (
                                    filteredConsultations.map(item => (
                                        <div key={item._id} className="enquiry-card">
                                            <div className="enquiry-header">
                                                <div>
                                                    <h4>{item.fullName || 'Anonymous Client'}</h4>
                                                    <span className="enquiry-meta"><a href={`mailto:${item.email}`} className="email-link">{item.email}</a> • <a href={`tel:${item.phone}`} className="phone-link">{item.phone || 'N/A'}</a></span>
                                                </div>
                                                <div className="enquiry-header-right" style={{ textAlign: 'right' }}>
                                                    <select
                                                        className="status-dropdown-select"
                                                        value={item.status || 'Pending'}
                                                        onChange={(e) => handleUpdateConsultationStatus(item._id, e.target.value)}
                                                        style={{ marginBottom: '8px' }}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Contacted">Contacted</option>
                                                        <option value="Confirmed">Confirmed</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                    </select>
                                                    <div className="enquiry-date">Booked: {new Date(item.createdAt).toLocaleString()}</div>
                                                </div>
                                            </div>

                                            <div className="enquiry-subject" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                                <span><strong>Service:</strong> {item.service || 'Full Design'}</span>
                                                <span><strong>Budget:</strong> {item.budget || 'Custom'}</span>
                                                <span><strong>Date Pref:</strong> {item.preferredDate ? new Date(item.preferredDate).toLocaleDateString() : (item.date || 'Flexible')}</span>
                                            </div>

                                            {item.notes && (
                                                <div className="enquiry-body" style={{ marginTop: '12px' }}>
                                                    <strong>Vision/Notes:</strong> "{item.notes}"
                                                </div>
                                            )}

                                            {item.replyMessage && (
                                                <div className="replied-history-box" style={{ marginTop: '14px', background: 'rgba(16, 185, 129, 0.08)', borderLeft: '3px solid #10b981', padding: '12px 16px', borderRadius: '8px' }}>
                                                    <div style={{ color: '#34d399', fontWeight: '700', fontSize: '0.8rem', marginBottom: '4px' }}>
                                                        Sent Email Reply ({item.repliedAt ? new Date(item.repliedAt).toLocaleDateString() : 'Replied'}):
                                                    </div>
                                                    <div style={{ color: '#e2e8f0', fontSize: '0.88rem', fontStyle: 'italic' }}>
                                                        "{item.replyMessage}"
                                                    </div>
                                                </div>
                                            )}

                                            <div className="enquiry-footer-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                                                <button className="btn-primary-gold" style={{ padding: '8px 16px', fontSize: '0.82rem' }} onClick={() => handleOpenReplyModal(item)}>
                                                    <TbMailForward /> Reply via Email
                                                </button>
                                                <button className="btn-action-btn delete" onClick={() => handleDeleteConsultation(item._id)}>
                                                    <TbTrash /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── TAB: CONTACT ENQUIRIES ── */}
                    {!loading && activeTab === 'contact' && (
                        <div className="panel-section">
                            <div className="panel-header">
                                <div>
                                    <h2>Contact Form Enquiries</h2>
                                    <p>Direct customer messages received from the Contact Us page.</p>
                                </div>
                                <div className="search-input-box">
                                    <TbSearch />
                                    <input
                                        type="text"
                                        placeholder="Search messages..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="enquiries-feed">
                                {filteredMessages.length === 0 ? (
                                    <div className="empty-state-card">
                                        <TbMail className="empty-icon" />
                                        <h3>No Contact Messages Found</h3>
                                        <p>When visitors send messages via the Contact page, they will appear here in real-time.</p>
                                    </div>
                                ) : (
                                    filteredMessages.map(msg => (
                                        <div key={msg._id} className="enquiry-card">
                                            <div className="enquiry-header">
                                                <div>
                                                    <h4>{msg.fullName || msg.name || 'Anonymous Client'}</h4>
                                                    <span className="enquiry-meta"><a href={`mailto:${msg.email}`} className="email-link">{msg.email}</a> • <a href={`tel:${msg.phone}`} className="phone-link">{msg.phone || 'N/A'}</a></span>
                                                </div>
                                                <div className="enquiry-header-right" style={{ textAlign: 'right' }}>
                                                    <span className={`status-tag ${msg.status ? msg.status.toLowerCase() : 'new'}`}>
                                                        {msg.status || 'New'}
                                                    </span>
                                                    <div className="enquiry-date">{new Date(msg.createdAt).toLocaleString()}</div>
                                                </div>
                                            </div>
                                            <div className="enquiry-subject">
                                                <strong>Subject / Service:</strong> {msg.subject || msg.serviceType || 'General Enquiry'}
                                            </div>
                                            <div className="enquiry-body">
                                                "{msg.message}"
                                            </div>

                                            {msg.replyMessage && (
                                                <div className="replied-history-box" style={{ marginTop: '14px', background: 'rgba(16, 185, 129, 0.08)', borderLeft: '3px solid #10b981', padding: '12px 16px', borderRadius: '8px' }}>
                                                    <div style={{ color: '#34d399', fontWeight: '700', fontSize: '0.8rem', marginBottom: '4px' }}>
                                                        Sent Email Reply ({msg.repliedAt ? new Date(msg.repliedAt).toLocaleDateString() : 'Replied'}):
                                                    </div>
                                                    <div style={{ color: '#e2e8f0', fontSize: '0.88rem', fontStyle: 'italic' }}>
                                                        "{msg.replyMessage}"
                                                    </div>
                                                </div>
                                            )}

                                            <div className="enquiry-footer-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                                                <button className="btn-primary-gold" style={{ padding: '8px 16px', fontSize: '0.82rem' }} onClick={() => handleOpenReplyModal(msg)}>
                                                    <TbMailForward /> Reply via Email
                                                </button>
                                                <button className="btn-action-btn delete" onClick={() => handleDeleteContactMessage(msg._id)}>
                                                    <TbTrash /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── TAB: GALLERIES SHOWCASE & HERO ── */}
                    {!loading && activeTab === 'gallery' && (
                        <div className="panel-section">
                            <div className="panel-header">
                                <div>
                                    <h2>Galleries Page & Hero Manager</h2>
                                    <p>Manage the hero banner content, background image, and image collection for the Galleries page.</p>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>

                                    <button
                                        onClick={() => {
                                            setEditingGalleryItem(null);
                                            setGalleryItemForm({ title: '', type: 'living', src: '', shape: 'standard', order: galleryItems.length + 1 });
                                            setGalleryItemModalOpen(true);
                                        }}
                                        style={{
                                            background: 'linear-gradient(135deg, #c48b59 0%, #a36f41 100%)',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '10px 22px',
                                            fontSize: '0.88rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            boxShadow: '0 4px 12px rgba(196, 139, 89, 0.3)',
                                            transition: 'all 0.2s ease-in-out'
                                        }}
                                    >
                                        <TbPlus style={{ fontSize: '1.15rem' }} /> ADD GALLERY ITEM
                                    </button>
                                </div>
                            </div>

                            {/* Hero Banner Status Box */}
                            <div className="overview-card" style={{ marginBottom: '32px', borderLeft: '4px solid #b38058' }}>
                                <div className="card-top">
                                    <h3>Galleries Page Hero Settings</h3>
                                    <button
                                        className="view-all-link"
                                        onClick={() => {
                                            setGalleryHeroForm({
                                                kicker: galleryHero.kicker || 'OUR GALLERY',
                                                title: galleryHero.title || 'A Collection of',
                                                highlightTitle: galleryHero.highlightTitle || 'Beautiful Spaces',
                                                subtitle: galleryHero.subtitle || '',
                                                heroBg: galleryHero.heroBg || ''
                                            });
                                            setGalleryHeroModalOpen(true);
                                        }}
                                    >
                                        Edit Hero Content →
                                    </button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ width: '120px', height: '80px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <img
                                            src={galleryHero.heroBg || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80'}
                                            alt="Gallery Hero Bg"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div>
                                        <span className="slide-kicker-tag">{galleryHero.kicker || 'OUR GALLERY'}</span>
                                        <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: '4px 0' }}>
                                            {galleryHero.title || 'A Collection of'} <span style={{ color: '#d4af37' }}>{galleryHero.highlightTitle || 'Beautiful Spaces'}</span>
                                        </h3>
                                        <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
                                            {galleryHero.subtitle}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Gallery Items Grid */}
                            <div className="panel-header" style={{ borderBottom: 'none', marginBottom: '16px', paddingBottom: 0 }}>
                                <h3>Gallery Showcase Items ({galleryItems.length})</h3>
                            </div>

                            {galleryItems.length === 0 ? (
                                <div className="empty-state-card">
                                    <TbPhoto className="empty-icon" />
                                    <h3>No Gallery Items Found</h3>
                                    <p>Add image items to display in the Galleries page collage grid.</p>
                                    <button className="btn-primary-gold" onClick={() => setGalleryItemModalOpen(true)}>Add First Gallery Item</button>
                                </div>
                            ) : (
                                <div className="projects-grid-luxury gallery-items-grid-compact">
                                    {galleryItems.map((item, idx) => (
                                        <div key={item._id || idx} className="project-card-luxury gallery-card-compact">
                                            <div className="project-thumb-box gallery-thumb-compact">
                                                <img src={item.src} alt={item.title || 'Gallery item'} />
                                                <span className="category-chip gallery-chip-compact" style={{ textTransform: 'uppercase' }}>{item.type}</span>
                                                <span className="slide-number-chip gallery-chip-compact" style={{ top: '8px', left: '8px' }}>{item.shape?.toUpperCase() || 'STANDARD'}</span>
                                            </div>
                                            <div className="project-details-box gallery-details-compact">
                                                <h3 style={{ fontSize: '0.92rem', margin: '0 0 4px 0', color: '#fff', fontWeight: '600' }}>{item.title || `${item.type.toUpperCase()} Item #${item.order || idx + 1}`}</h3>
                                                <div className="project-meta-row" style={{ marginTop: '4px', fontSize: '0.75rem', color: '#64748b' }}>
                                                    <span>Order: #{item.order || idx + 1}</span>
                                                    <span>Category: {item.type}</span>
                                                </div>
                                            </div>
                                            <div className="project-card-footer gallery-footer-compact">
                                                <button
                                                    className="btn-action-btn edit"
                                                    onClick={() => {
                                                        setEditingGalleryItem(item);
                                                        setGalleryItemForm({
                                                            title: item.title || '',
                                                            type: item.type || 'living',
                                                            src: item.src || '',
                                                            shape: item.shape || 'standard',
                                                            order: item.order || idx + 1
                                                        });
                                                        setGalleryItemModalOpen(true);
                                                    }}
                                                    style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                                                >
                                                    <TbEdit /> Edit
                                                </button>
                                                <button
                                                    className="btn-action-btn delete"
                                                    onClick={() => handleDeleteGalleryItem(item._id)}
                                                    style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                                                >
                                                    <TbTrash /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── TAB: CONTACT PAGE SETTINGS ── */}
                    {!loading && activeTab === 'contactPage' && (
                        <div className="panel-section">
                            <div className="panel-header">
                                <div>
                                    <h2>Contact Page Settings</h2>
                                    <p>Manage the hero section, contact information, and map location displayed on the Contact Us page.</p>
                                </div>
                                <button className="btn-refresh" onClick={fetchContactPageSettings}>
                                    <TbRefresh /> Refresh
                                </button>
                            </div>

                            {/* Hero Settings Card */}
                            <div className="overview-card" style={{ marginBottom: '24px', borderLeft: '4px solid #b38058' }}>
                                <div className="card-top">
                                    <h3 style={{ display: 'flex', alignItems: 'center' }}><TbPhoto style={{ marginRight: '8px', color: '#b38058' }} /> Hero Section</h3>
                                    <button className="view-all-link" onClick={() => {
                                        const h = contactPageSettings?.hero || {};
                                        setContactHeroForm({ kicker: h.kicker || '', title: h.title || '', highlightText: h.highlightText || '', subtitle: h.subtitle || '', heroBg: h.heroBg || '' });
                                        setContactHeroModalOpen(true);
                                    }}>Edit Hero →</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ width: '120px', height: '72px', overflow: 'hidden', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <img src={contactPageSettings?.hero?.heroBg || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=300&q=80'} alt="Hero Bg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div>
                                        <span className="slide-kicker-tag">{contactPageSettings?.hero?.kicker || 'GET IN TOUCH'}</span>
                                        <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: '4px 0' }}>{contactPageSettings?.hero?.title || "Let's Design a Space"} <span style={{ color: '#d4af37', fontStyle: 'italic' }}>{contactPageSettings?.hero?.highlightText || "You'll Love."}</span></h3>
                                        <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>{contactPageSettings?.hero?.subtitle}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info Card */}
                            <div className="overview-card" style={{ marginBottom: '24px', borderLeft: '4px solid #3b82f6' }}>
                                <div className="card-top">
                                    <h3 style={{ display: 'flex', alignItems: 'center' }}><TbAddressBook style={{ marginRight: '8px', color: '#3b82f6' }} /> Contact Information</h3>
                                    <button className="view-all-link" onClick={() => {
                                        const ci = contactPageSettings?.contactInfo || {};
                                        setContactInfoForm({ address: ci.address || '', phone1: ci.phone1 || '', phone2: ci.phone2 || '', email1: ci.email1 || '', email2: ci.email2 || '', hoursWeekday: ci.hoursWeekday || '', hoursSaturday: ci.hoursSaturday || '', hoursSunday: ci.hoursSunday || '' });
                                        setContactInfoModalOpen(true);
                                    }}>Edit Info →</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                    <div>
                                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>ADDRESS</span>
                                        <span style={{ color: '#e2e8f0', fontSize: '0.88rem' }}>{contactPageSettings?.contactInfo?.address || '—'}</span>
                                    </div>
                                    <div>
                                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>PHONES</span>
                                        <span style={{ color: '#e2e8f0', fontSize: '0.88rem' }}>{contactPageSettings?.contactInfo?.phone1 || '—'}<br />{contactPageSettings?.contactInfo?.phone2}</span>
                                    </div>
                                    <div>
                                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>EMAILS</span>
                                        <span style={{ color: '#e2e8f0', fontSize: '0.88rem' }}>{contactPageSettings?.contactInfo?.email1 || '—'}<br />{contactPageSettings?.contactInfo?.email2}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Map Location Card */}
                            <div className="overview-card" style={{ borderLeft: '4px solid #10b981' }}>
                                <div className="card-top">
                                    <h3 style={{ display: 'flex', alignItems: 'center' }}><TbMapPin style={{ marginRight: '8px', color: '#10b981' }} /> Map Location</h3>
                                    <button className="view-all-link" onClick={() => {
                                        const m = contactPageSettings?.map || {};
                                        setContactMapForm({ latitude: m.latitude || '', longitude: m.longitude || '', label: m.label || '', address: m.address || '' });
                                        setContactMapModalOpen(true);
                                    }}>Edit Map →</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                    <div>
                                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>LATITUDE</span>
                                        <span style={{ color: '#34d399', fontFamily: 'monospace', fontSize: '0.9rem' }}>{contactPageSettings?.map?.latitude ?? '—'}</span>
                                    </div>
                                    <div>
                                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>LONGITUDE</span>
                                        <span style={{ color: '#34d399', fontFamily: 'monospace', fontSize: '0.9rem' }}>{contactPageSettings?.map?.longitude ?? '—'}</span>
                                    </div>
                                    <div>
                                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>LABEL</span>
                                        <span style={{ color: '#e2e8f0', fontSize: '0.88rem' }}>{contactPageSettings?.map?.label || '—'}</span>
                                    </div>
                                </div>
                                <div style={{ marginTop: '16px', borderRadius: '8px', overflow: 'hidden', height: '180px' }}>
                                    <iframe
                                        title="Map Preview"
                                        src={`https://www.google.com/maps?q=${contactPageSettings?.map?.latitude || 6.8921},${contactPageSettings?.map?.longitude || 79.8612}&z=14&output=embed`}
                                        width="100%" height="100%" style={{ border: 0 }} loading="lazy"
                                    ></iframe>
                                </div>
                            </div>

                            {/* Follow Our Journey Card */}
                            <div className="overview-card" style={{ marginTop: '24px', borderLeft: '4px solid #a855f7' }}>
                                <div className="card-top">
                                    <h3 style={{ display: 'flex', alignItems: 'center' }}><TbTrendingUp style={{ marginRight: '8px', color: '#a855f7' }} /> Follow Our Journey Section</h3>
                                    <button className="view-all-link" onClick={() => {
                                        const j = contactPageSettings?.journey || {};
                                        const sl = j.socialLinks || {};
                                        const imgs = j.images || [];
                                        setContactJourneyForm({
                                            title: j.title || 'FOLLOW OUR JOURNEY',
                                            description: j.description || 'Get inspired by our latest projects, behind-the-scenes and design tips.',
                                            facebook: sl.facebook || '',
                                            instagram: sl.instagram || '',
                                            pinterest: sl.pinterest || '',
                                            linkedin: sl.linkedin || '',
                                            img1: imgs[0] || '',
                                            img2: imgs[1] || '',
                                            img3: imgs[2] || '',
                                            img4: imgs[3] || ''
                                        });
                                        setContactJourneyModalOpen(true);
                                    }}>Edit Journey →</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                                    <div>
                                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>TITLE</span>
                                        <h4 style={{ color: '#fff', margin: '0 0 6px 0', fontSize: '0.95rem' }}>{contactPageSettings?.journey?.title || 'FOLLOW OUR JOURNEY'}</h4>
                                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>DESCRIPTION</span>
                                        <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: 0 }}>{contactPageSettings?.journey?.description || 'Get inspired by our latest projects...'}</p>
                                    </div>
                                    <div>
                                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '8px' }}>SOCIAL MEDIA LINKS</span>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', background: contactPageSettings?.journey?.socialLinks?.facebook ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)', color: contactPageSettings?.journey?.socialLinks?.facebook ? '#60a5fa' : '#64748b' }}>
                                                FB: {contactPageSettings?.journey?.socialLinks?.facebook ? 'Connected' : 'None'}
                                            </span>
                                            <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', background: contactPageSettings?.journey?.socialLinks?.instagram ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255,255,255,0.05)', color: contactPageSettings?.journey?.socialLinks?.instagram ? '#f472b6' : '#64748b' }}>
                                                Insta: {contactPageSettings?.journey?.socialLinks?.instagram ? 'Connected' : 'None'}
                                            </span>
                                            <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', background: contactPageSettings?.journey?.socialLinks?.pinterest ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)', color: contactPageSettings?.journey?.socialLinks?.pinterest ? '#f87171' : '#64748b' }}>
                                                Pinterest: {contactPageSettings?.journey?.socialLinks?.pinterest ? 'Connected' : 'None'}
                                            </span>
                                            <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', background: contactPageSettings?.journey?.socialLinks?.linkedin ? 'rgba(14, 165, 233, 0.2)' : 'rgba(255,255,255,0.05)', color: contactPageSettings?.journey?.socialLinks?.linkedin ? '#38bdf8' : '#64748b' }}>
                                                LinkedIn: {contactPageSettings?.journey?.socialLinks?.linkedin ? 'Connected' : 'None'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '8px' }}>JOURNEY IMAGES PREVIEW</span>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                        {[0, 1, 2, 3].map((idx) => {
                                            const img = contactPageSettings?.journey?.images?.[idx];
                                            return (
                                                <div key={idx} style={{ height: '70px', borderRadius: '6px', overflow: 'hidden', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {img ? (
                                                        <img src={img} alt={`Journey ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Image {idx + 1} (Auto)</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Why Choose Us Features Strip */}
                            <div className="overview-card" style={{ marginTop: '24px', borderLeft: '4px solid #f59e0b' }}>
                                <div className="card-top">
                                    <h3 style={{ display: 'flex', alignItems: 'center' }}><TbStar style={{ marginRight: '8px', color: '#f59e0b' }} /> Features Strip (Why Choose Us)</h3>
                                    <button className="view-all-link" onClick={() => {
                                        setEditingContactFeature(null);
                                        setContactFeatureForm({ iconName: 'home', title: '', description: '', order: contactFeatures.length + 1 });
                                        setContactFeatureModalOpen(true);
                                    }}>+ Add Feature</button>
                                </div>
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 16px 0' }}>
                                    Manage the 4 key features displayed above the Follow Our Journey section.
                                </p>
                                <div className="table-wrapper">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>ORDER</th>
                                                <th>ICON</th>
                                                <th>TITLE / DESCRIPTION</th>
                                                <th>ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {contactFeatures.map(f => (
                                                <tr key={f._id}>
                                                    <td>{f.order}</td>
                                                    <td>
                                                        <span style={{ background: '#334155', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#cbd5e1' }}>{f.iconName || 'home'}</span>
                                                    </td>
                                                    <td>
                                                        <strong style={{ display: 'block', color: '#fff', fontSize: '0.9rem' }}>{f.title}</strong>
                                                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{f.description}</span>
                                                    </td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button
                                                                className="btn-edit"
                                                                title="Edit Feature"
                                                                onClick={() => {
                                                                    setEditingContactFeature(f);
                                                                    setContactFeatureForm({ iconName: f.iconName, title: f.title, description: f.description, order: f.order });
                                                                    setContactFeatureModalOpen(true);
                                                                }}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                className="btn-delete"
                                                                title="Delete Feature"
                                                                onClick={() => handleDeleteContactFeature(f._id)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {contactFeatures.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8' }}>No features added yet.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── BLOG MANAGEMENT TAB ── */}
                    {!loading && activeTab === 'blog' && (
                        <div className="panel-section">
                            <div className="panel-header">
                                <div>
                                    <h2>Blog & Article Management</h2>
                                    <p>Control the Blog page hero banner and manage articles, titles, dates, authors, and images.</p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {blogSubTab === 'articles' ? (
                                        <button
                                            onClick={handleOpenAddBlogPost}
                                            style={{
                                                background: 'linear-gradient(135deg, #c48b59 0%, #a36f41 100%)',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '10px 22px',
                                                fontSize: '0.88rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                boxShadow: '0 4px 12px rgba(196, 139, 89, 0.3)',
                                                transition: 'all 0.2s ease-in-out'
                                            }}
                                        >
                                            <TbPlus style={{ fontSize: '1.15rem' }} /> Create New Article
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleOpenEditBlogHero}
                                            style={{
                                                background: 'linear-gradient(135deg, #c48b59 0%, #a36f41 100%)',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '10px 22px',
                                                fontSize: '0.88rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                boxShadow: '0 4px 12px rgba(196, 139, 89, 0.3)',
                                                transition: 'all 0.2s ease-in-out'
                                            }}
                                        >
                                            <TbEdit style={{ fontSize: '1.15rem' }} /> Edit Hero Section
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Horizontal Sub-tabs */}
                            <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px', paddingBottom: '10px' }}>
                                <button
                                    onClick={() => setBlogSubTab('articles')}
                                    style={{
                                        background: blogSubTab === 'articles' ? '#c48b59' : 'transparent',
                                        color: blogSubTab === 'articles' ? '#fff' : '#94a3b8',
                                        border: blogSubTab === 'articles' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 18px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <TbFolder style={{ fontSize: '15px' }} /> Blog Articles ({blogPosts.length})
                                </button>
                                <button
                                    onClick={() => setBlogSubTab('hero')}
                                    style={{
                                        background: blogSubTab === 'hero' ? '#c48b59' : 'transparent',
                                        color: blogSubTab === 'hero' ? '#fff' : '#94a3b8',
                                        border: blogSubTab === 'hero' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 18px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <TbPhoto style={{ fontSize: '15px' }} /> Blog Hero Banner
                                </button>
                            </div>

                            {/* SUB-TAB: ARTICLES */}
                            {blogSubTab === 'articles' && (
                                <div>
                                    {blogPosts.length === 0 ? (
                                        <div className="admin-empty-state">
                                            <TbFolder style={{ fontSize: '3rem', color: '#64748b' }} />
                                            <h3>No Blog Articles Found</h3>
                                            <p>Click "Create New Article" to add your first blog post.</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                                            {blogPosts.map((post) => (
                                                <div key={post._id || post.id} className="admin-card-item" style={{ background: '#1e293b', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
                                                    <div style={{ height: '180px', position: 'relative', overflow: 'hidden', background: '#0f172a' }}>
                                                        <img src={post.img} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#c48b59', color: '#fff', fontSize: '0.68rem', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                                            {post.badge || 'ARTICLE'}
                                                        </div>
                                                        {post.isFeatured && (
                                                            <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#eab308', color: '#000', fontSize: '0.68rem', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>
                                                                FEATURED
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <TbCalendarEvent style={{ fontSize: '12px' }} /> {post.date}&nbsp;&bull;&nbsp;<TbClock style={{ fontSize: '12px' }} /> {post.readTime}
                                                        </div>
                                                        <h3 style={{ fontSize: '1.05rem', color: '#fff', fontWeight: '600', marginBottom: '8px', lineHeight: '1.4' }}>
                                                            {post.title}
                                                        </h3>
                                                        <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '14px', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                            {post.desc}
                                                        </p>

                                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '0.78rem', color: '#c48b59', fontWeight: '500' }}>
                                                                {post.author || 'Author'}
                                                            </span>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button
                                                                    onClick={() => handleOpenEditBlogPost(post)}
                                                                    style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '6px 12px', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                                >
                                                                    <TbEdit /> Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteBlogPost(post._id)}
                                                                    style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', padding: '6px 12px', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                                >
                                                                    <TbTrash /> Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* SUB-TAB: HERO BANNER */}
                            {blogSubTab === 'hero' && (
                                <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <h3 style={{ color: '#c48b59', marginBottom: '16px', fontSize: '1.1rem' }}>Current Blog Hero Configuration</h3>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                        <div>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>KICKER TAGLINE</span>
                                            <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}>
                                                {blogHero.kicker || 'OUR BLOG'}
                                            </div>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>MAIN TITLE</span>
                                            <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}>
                                                {blogHero.title || 'Ideas, Inspiration & Interior Tips'}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>SUBTITLE DESCRIPTION</span>
                                        <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.5' }}>
                                            {blogHero.subtitle || 'Explore expert advice, design trends, and creative ideas...'}
                                        </div>
                                    </div>

                                    {blogHero.bgImage && (
                                        <div style={{ marginBottom: '20px' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>HERO BACKGROUND IMAGE</span>
                                            <div style={{ height: '180px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                <img src={blogHero.bgImage} alt="Hero Background" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleOpenEditBlogHero}
                                        style={{
                                            background: 'linear-gradient(135deg, #c48b59 0%, #a36f41 100%)',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '10px 22px',
                                            fontSize: '0.88rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            boxShadow: '0 4px 12px rgba(196, 139, 89, 0.3)',
                                            transition: 'all 0.2s ease-in-out'
                                        }}
                                    >
                                        <TbEdit style={{ fontSize: '1.15rem' }} /> Edit Blog Hero Section
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── TAB: TESTIMONIALS MANAGEMENT ── */}
                    {!loading && activeTab === 'testimonials' && (
                        <div className="panel-section">
                            <div className="panel-header" style={{ marginBottom: '15px' }}>
                                <div>
                                    <h2>Testimonials Page Manager</h2>
                                    <p>Manage client reviews and configure the Testimonials hero section.</p>
                                </div>
                                {testiSubTab === 'reviews' && (
                                    <button
                                        className="btn-primary-gold"
                                        onClick={() => {
                                            setEditingTesti(null);
                                            setTestiForm({ name: '', role: '', quote: '', category: 'RESIDENTIAL', avatar: '', image: '', stars: 5 });
                                            setTestiModalOpen(true);
                                        }}
                                    >
                                        <TbPlus /> ADD NEW REVIEW
                                    </button>
                                )}
                            </div>

                            {/* Horizontal Sub-tabs */}
                            <div className="admin-subtab-bar">
                                <button
                                    onClick={() => setTestiSubTab('reviews')}
                                    style={{
                                        background: testiSubTab === 'reviews' ? '#c48b59' : 'transparent',
                                        color: testiSubTab === 'reviews' ? '#fff' : '#94a3b8',
                                        border: testiSubTab === 'reviews' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 18px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <TbStar style={{ fontSize: '1rem' }} /> Client Reviews ({testimonials.length})
                                    {pendingTestimonialsCount > 0 && (
                                        <span className="tab-badge-counter" style={{ marginLeft: '4px' }}>{pendingTestimonialsCount}</span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setTestiSubTab('hero')}
                                    style={{
                                        background: testiSubTab === 'hero' ? '#c48b59' : 'transparent',
                                        color: testiSubTab === 'hero' ? '#fff' : '#94a3b8',
                                        border: testiSubTab === 'hero' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 18px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <TbLayoutBoard style={{ fontSize: '1rem' }} /> Page Hero Banner
                                </button>
                                <button
                                    onClick={() => setTestiSubTab('quote')}
                                    style={{
                                        background: testiSubTab === 'quote' ? '#c48b59' : 'transparent',
                                        color: testiSubTab === 'quote' ? '#fff' : '#94a3b8',
                                        border: testiSubTab === 'quote' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 18px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <TbQuote style={{ fontSize: '1rem' }} /> Quote Banner
                                </button>
                            </div>

                            {/* SUB-TAB: REVIEWS */}
                            {testiSubTab === 'reviews' && (
                                <div>
                                    {testimonials.length === 0 ? (
                                        <div className="admin-empty-state">
                                            <TbStar style={{ fontSize: '3rem', color: '#64748b' }} />
                                            <h3>No Client Reviews Found</h3>
                                            <p>No testimonials are currently available.</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                                            {testimonials.map((testi) => (
                                                <div key={testi._id || testi.id} className="admin-card-item" style={{ background: '#1e293b', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
                                                    <div style={{ height: '180px', position: 'relative', overflow: 'hidden', background: '#0f172a' }}>
                                                        <img src={testi.image} alt="Project" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#c48b59', color: '#fff', fontSize: '0.68rem', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                                            {testi.category || 'RESIDENTIAL'}
                                                        </div>
                                                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: testi.isApproved ? '#22c55e' : '#eab308', color: testi.isApproved ? '#fff' : '#000', fontSize: '0.68rem', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>
                                                            {testi.isApproved ? 'APPROVED' : 'PENDING'}
                                                        </div>
                                                    </div>
                                                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                        <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginBottom: '6px', display: 'flex', gap: '2px' }}>
                                                            {Array(testi.stars || 5).fill('').join('')}
                                                        </div>
                                                        <p style={{ fontSize: '0.9rem', color: '#fff', fontStyle: 'italic', marginBottom: '14px', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                            "{testi.quote}"
                                                        </p>
                                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <img src={testi.avatar} alt="Avatar" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                                                                <div>
                                                                    <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 'bold', lineHeight: '1' }}>{testi.name}</div>
                                                                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '3px' }}>{testi.role}</div>
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button
                                                                    onClick={() => handleToggleTestiApproval(testi)}
                                                                    style={{ background: testi.isApproved ? 'rgba(234, 179, 8, 0.15)' : 'rgba(34, 197, 94, 0.15)', color: testi.isApproved ? '#eab308' : '#22c55e', border: testi.isApproved ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '6px', padding: '6px 12px', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                                >
                                                                    {testi.isApproved ? 'Hide' : 'Approve'}
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingTesti(testi);
                                                                        setTestiForm(testi);
                                                                        setTestiModalOpen(true);
                                                                    }}
                                                                    style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '6px 12px', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                                >
                                                                    <TbEdit />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteTesti(testi._id)}
                                                                    style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', padding: '6px 12px', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                                >
                                                                    <TbTrash />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* SUB-TAB: HERO BANNER */}
                            {testiSubTab === 'hero' && (
                                <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <h3 style={{ color: '#c48b59', marginBottom: '16px', fontSize: '1.1rem' }}>Testimonials Hero Configuration</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                        <div>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>KICKER TAGLINE</span>
                                            <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}>
                                                {testiHero.kicker || 'TESTIMONIALS'}
                                            </div>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>MAIN TITLE</span>
                                            <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}>
                                                <span dangerouslySetInnerHTML={{ __html: testiHero.title || 'Trusted By Clients.<br /><span class="gold-text-italic">Loved</span> For Our Work.' }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>SUBTITLE DESCRIPTION</span>
                                        <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.5' }}>
                                            <span dangerouslySetInnerHTML={{ __html: testiHero.subtitle || 'We take pride in creating spaces that inspire<br />and relationships that last.' }} />
                                        </div>
                                    </div>
                                    {testiHero.bgImage && (
                                        <div style={{ marginBottom: '20px' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>HERO BACKGROUND IMAGE</span>
                                            <div style={{ height: '180px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                <img src={testiHero.bgImage} alt="Hero Background" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => {
                                            let titleLine1 = '';
                                            let titleGold = '';
                                            let titleLine2 = '';
                                            const fullTitle = testiHero.title || 'Trusted By Clients.<br /><span class="gold-text-italic">Loved</span> For Our Work.';
                                            const match = fullTitle.match(/^(.*?)(?:<br\s*\/?>)?<span class="gold-text-italic">(.*?)<\/span>(.*)$/i);
                                            if (match) {
                                                titleLine1 = match[1].replace(/<br\s*\/?>/gi, '').trim();
                                                titleGold = match[2].trim();
                                                titleLine2 = match[3].replace(/<br\s*\/?>/gi, '').trim();
                                            } else {
                                                titleLine1 = fullTitle.replace(/<br\s*\/?>/gi, '\n').trim();
                                            }
                                            setTestiHeroForm({
                                                kicker: testiHero.kicker || 'TESTIMONIALS',
                                                titleLine1,
                                                titleGold,
                                                titleLine2,
                                                subtitle: (testiHero.subtitle || 'We take pride in creating spaces that inspire\nand relationships that last.').replace(/<br\s*\/?>/gi, '\n'),
                                                bgImage: testiHero.bgImage || ''
                                            });
                                            setTestiHeroModalOpen(true);
                                        }}
                                        style={{
                                            background: 'linear-gradient(135deg, #c48b59 0%, #a36f41 100%)',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '10px 22px',
                                            fontSize: '0.88rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            boxShadow: '0 4px 12px rgba(196, 139, 89, 0.3)',
                                            transition: 'all 0.2s ease-in-out'
                                        }}
                                    >
                                        <TbEdit style={{ fontSize: '1.15rem' }} /> Edit Testimonials Hero Section
                                    </button>
                                </div>
                            )}

                            {/* SUB-TAB: QUOTE BANNER */}
                            {testiSubTab === 'quote' && (
                                <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <h3 style={{ color: '#c48b59', marginBottom: '16px', fontSize: '1.1rem' }}>Large Quote Banner Configuration</h3>
                                    <div style={{ marginBottom: '20px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>QUOTE TEXT</span>
                                        <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.5', fontStyle: 'italic' }}>
                                            <span dangerouslySetInnerHTML={{ __html: testiHero.quoteText || 'Design is not just what it looks like...<br />Design is how it works.' }} />
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '20px', maxWidth: '300px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>QUOTE AUTHOR</span>
                                        <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}>
                                            {testiHero.quoteAuthor || '– Steve Jobs'}
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>RIGHT SIDE SPLIT IMAGE</span>
                                        <div style={{ height: '180px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '360px' }}>
                                            <img src={testiHero.quoteImage || aboutImg} alt="Quote Side Image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setTestiQuoteForm({
                                                quoteText: (testiHero.quoteText || 'Design is not just what it looks like and feels like.\nDesign is how it works.').replace(/<br\s*\/?>/gi, '\n'),
                                                quoteAuthor: testiHero.quoteAuthor || '– Steve Jobs',
                                                quoteImage: testiHero.quoteImage || aboutImg
                                            });
                                            setTestiQuoteModalOpen(true);
                                        }}
                                        style={{
                                            background: 'linear-gradient(135deg, #c48b59 0%, #a36f41 100%)',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '10px 22px',
                                            fontSize: '0.88rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            boxShadow: '0 4px 12px rgba(196, 139, 89, 0.3)',
                                            transition: 'all 0.2s ease-in-out'
                                        }}
                                    >
                                        <TbEdit style={{ fontSize: '1.15rem' }} /> Edit Quote Banner
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── ABOUT PAGE SETTINGS ── */}
                    {activeTab === 'about' && aboutData && (
                        <div className="panel-section">
                            <div className="panel-header" style={{ marginBottom: '15px' }}>
                                <div>
                                    <h2>About Page Management</h2>
                                    <p>Customize the story, mission, and philosophy of Good Interior.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px', paddingBottom: '10px' }}>
                                <button
                                    onClick={() => setActiveAboutSubTab('hero')}
                                    style={{
                                        background: activeAboutSubTab === 'hero' ? '#c48b59' : 'transparent',
                                        color: activeAboutSubTab === 'hero' ? '#fff' : '#94a3b8',
                                        border: activeAboutSubTab === 'hero' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 18px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >Hero Section</button>
                                <button
                                    onClick={() => setActiveAboutSubTab('whoWeAre')}
                                    style={{
                                        background: activeAboutSubTab === 'whoWeAre' ? '#c48b59' : 'transparent',
                                        color: activeAboutSubTab === 'whoWeAre' ? '#fff' : '#94a3b8',
                                        border: activeAboutSubTab === 'whoWeAre' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 18px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >Who We Are</button>
                                <button
                                    onClick={() => setActiveAboutSubTab('purpose')}
                                    style={{
                                        background: activeAboutSubTab === 'purpose' ? '#c48b59' : 'transparent',
                                        color: activeAboutSubTab === 'purpose' ? '#fff' : '#94a3b8',
                                        border: activeAboutSubTab === 'purpose' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 18px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >Mission & Vision</button>
                                <button
                                    onClick={() => setActiveAboutSubTab('philosophy')}
                                    style={{
                                        background: activeAboutSubTab === 'philosophy' ? '#c48b59' : 'transparent',
                                        color: activeAboutSubTab === 'philosophy' ? '#fff' : '#94a3b8',
                                        border: activeAboutSubTab === 'philosophy' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 18px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >Our Philosophy</button>
                                <button
                                    onClick={() => setActiveAboutSubTab('achievements')}
                                    style={{
                                        background: activeAboutSubTab === 'achievements' ? '#c48b59' : 'transparent',
                                        color: activeAboutSubTab === 'achievements' ? '#fff' : '#94a3b8',
                                        border: activeAboutSubTab === 'achievements' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 18px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >Achievements</button>
                                <button
                                    onClick={() => setActiveAboutSubTab('team')}
                                    style={{
                                        background: activeAboutSubTab === 'team' ? '#c48b59' : 'transparent',
                                        color: activeAboutSubTab === 'team' ? '#fff' : '#94a3b8',
                                        border: activeAboutSubTab === 'team' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 18px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >Team Traits</button>
                            </div>

                            {activeAboutSubTab === 'hero' && (
                                <div className="card-luxury p-6" style={{ background: '#141720', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '10px' }}>Edit About Hero</h3>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        const combinedTitle = `${e.target.titleLine1.value} <br />${e.target.titleLine2.value} <span class="highlight-text">${e.target.titleHighlight.value}</span>`;
                                        handleSaveAboutSection('heroInfo', {
                                            title: combinedTitle,
                                            subtitle: e.target.subtitle.value,
                                            bgImage: aboutFormImages.hero || aboutData.heroInfo?.bgImage
                                        });
                                    }}>
                                        <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                                            <div className="form-group">
                                                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Main Title (First Line)</label>
                                                <input name="titleLine1" defaultValue={heroParts.part1} required style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                            </div>
                                            <div className="form-group">
                                                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Main Title (Second Line Start)</label>
                                                <input name="titleLine2" defaultValue={heroParts.part2} style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                            </div>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Highlight Text (Gold Text)</label>
                                            <input name="titleHighlight" defaultValue={heroParts.highlight} required style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Subtitle</label>
                                            <textarea name="subtitle" defaultValue={aboutData.heroInfo?.subtitle} required rows="3" style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Hero Background Image Base64 (Optional)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageFileUpload(e, (base64) => setAboutFormImages({ ...aboutFormImages, hero: base64 }))}
                                                style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', marginBottom: '10px' }}
                                            />
                                            {(aboutFormImages.hero || aboutData.heroInfo?.bgImage) && (
                                                <div className="img-preview-box" style={{ marginTop: '10px' }}>
                                                    <img src={aboutFormImages.hero || aboutData.heroInfo?.bgImage} alt="Hero Preview" />
                                                </div>
                                            )}
                                        </div>
                                        <button type="submit" className="btn-save-modal">SAVE HERO INFO</button>
                                    </form>
                                </div>
                            )}

                            {activeAboutSubTab === 'whoWeAre' && (
                                <div className="card-luxury p-6" style={{ background: '#141720', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '10px' }}>Edit "Who We Are" Section</h3>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSaveAboutSection('whoWeAre', {
                                            title: e.target.title.value,
                                            paragraph1: e.target.paragraph1.value,
                                            paragraph2: e.target.paragraph2.value,
                                            image: aboutFormImages.whoWeAre || aboutData.whoWeAre?.image
                                        });
                                    }}>
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Title</label>
                                            <input name="title" defaultValue={aboutData.whoWeAre?.title} required style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>First Paragraph</label>
                                            <textarea name="paragraph1" defaultValue={aboutData.whoWeAre?.paragraph1} required rows="3" style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Second Paragraph</label>
                                            <textarea name="paragraph2" defaultValue={aboutData.whoWeAre?.paragraph2} required rows="3" style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Image Base64 (Optional)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageFileUpload(e, (base64) => setAboutFormImages({ ...aboutFormImages, whoWeAre: base64 }))}
                                                style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', marginBottom: '10px' }}
                                            />
                                            {(aboutFormImages.whoWeAre || aboutData.whoWeAre?.image) && (
                                                <div className="img-preview-box" style={{ marginTop: '10px' }}>
                                                    <img src={aboutFormImages.whoWeAre || aboutData.whoWeAre?.image} alt="Who We Are Preview" />
                                                </div>
                                            )}
                                        </div>
                                        <button type="submit" className="btn-save-modal">SAVE "WHO WE ARE"</button>
                                    </form>
                                </div>
                            )}

                            {activeAboutSubTab === 'purpose' && (
                                <div className="card-luxury p-6" style={{ background: '#141720', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '10px' }}>Edit Mission & Vision</h3>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSaveAboutSection('purpose', {
                                            missionTitle: e.target.missionTitle.value,
                                            missionText: e.target.missionText.value,
                                            visionTitle: e.target.visionTitle.value,
                                            visionText: e.target.visionText.value
                                        });
                                    }}>
                                        <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                                            <div className="form-group">
                                                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Mission Title</label>
                                                <input name="missionTitle" defaultValue={aboutData.purpose?.missionTitle} required style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                            </div>
                                            <div className="form-group">
                                                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Vision Title</label>
                                                <input name="visionTitle" defaultValue={aboutData.purpose?.visionTitle} required style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                            </div>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Mission Text</label>
                                            <textarea name="missionText" defaultValue={aboutData.purpose?.missionText} required rows="3" style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Vision Text</label>
                                            <textarea name="visionText" defaultValue={aboutData.purpose?.visionText} required rows="3" style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                        </div>
                                        <button type="submit" className="btn-save-modal">SAVE PURPOSE</button>
                                    </form>
                                </div>
                            )}

                            {activeAboutSubTab === 'philosophy' && (
                                <div className="card-luxury p-6" style={{ background: '#141720', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '10px' }}>Edit Philosophy & Core Values</h3>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        const combinedPhilTitle = e.target.philLine2.value
                                            ? `${e.target.philLine1.value}<br />${e.target.philLine2.value}`
                                            : e.target.philLine1.value;

                                        const points = e.target.points.value.split('\n').map(p => p.trim()).filter(p => p.length > 0);
                                        handleSaveAboutSection('philosophy', {
                                            title: combinedPhilTitle,
                                            desc: e.target.desc.value,
                                            points: points,
                                            image: aboutFormImages.philosophy || aboutData.philosophy?.image
                                        });
                                    }}>
                                        <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                                            <div className="form-group">
                                                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Philosophy Title (First Line)</label>
                                                <input name="philLine1" defaultValue={philParts.part1} required style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                            </div>
                                            <div className="form-group">
                                                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Philosophy Title (Second Line)</label>
                                                <input name="philLine2" defaultValue={philParts.part2} style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                            </div>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Description</label>
                                            <textarea name="desc" defaultValue={aboutData.philosophy?.desc} required rows="3" style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Bullet Points (One per line)</label>
                                            <textarea name="points" defaultValue={aboutData.philosophy?.points?.join('\n')} required rows="4" style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Image Base64 (Optional)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageFileUpload(e, (base64) => setAboutFormImages({ ...aboutFormImages, philosophy: base64 }))}
                                                style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', marginBottom: '10px' }}
                                            />
                                            {(aboutFormImages.philosophy || aboutData.philosophy?.image) && (
                                                <div className="img-preview-box" style={{ marginTop: '10px' }}>
                                                    <img src={aboutFormImages.philosophy || aboutData.philosophy?.image} alt="Philosophy Preview" />
                                                </div>
                                            )}
                                        </div>
                                        <button type="submit" className="btn-save-modal">SAVE PHILOSOPHY</button>
                                    </form>
                                </div>
                            )}

                            {activeAboutSubTab === 'achievements' && (
                                <div className="card-luxury p-6" style={{ background: '#141720', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '10px' }}>Edit Achievements</h3>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        const newAchievements = [0, 1, 2, 3, 4].map(i => ({
                                            icon: e.target[`ach_icon_${i}`].value,
                                            value: e.target[`ach_value_${i}`].value,
                                            label: e.target[`ach_label_${i}`].value,
                                        }));
                                        handleSaveAboutSection('achievements', newAchievements);
                                    }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            {[0, 1, 2, 3, 4].map((idx) => {
                                                const ach = (aboutData.achievements && aboutData.achievements[idx]) || { icon: 'BiCalendarStar', value: '', label: '' };
                                                return (
                                                    <div key={idx} style={{ padding: '15px', background: '#0b0d11', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                        <h4 style={{ color: '#c48b59', marginBottom: '15px', fontSize: '0.9rem' }}>Achievement {idx + 1}</h4>
                                                        <div className="form-group" style={{ marginBottom: '12px' }}>
                                                            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', marginBottom: '6px' }}>Icon</label>
                                                            <select name={`ach_icon_${idx}`} defaultValue={ach.icon} style={{ width: '100%', padding: '8px', background: '#141720', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}>
                                                                <option value="BiCalendarStar">Calendar (Years)</option>
                                                                <option value="HiOutlineUserGroup">Users (Projects/Clients)</option>
                                                                <option value="BiTrophy">Trophy (Awards)</option>
                                                                <option value="BiSmile">Smile (Satisfaction)</option>
                                                                <option value="VscWorkspaceTrusted">Shield (Trust/Countries)</option>
                                                                <option value="FiHeart">Heart (Love)</option>
                                                                <option value="RiPencilRuler2Line">Pencil Ruler (Design)</option>
                                                                <option value="BiBuildingHouse">House (Buildings)</option>
                                                            </select>
                                                        </div>
                                                        <div className="form-group" style={{ marginBottom: '12px' }}>
                                                            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', marginBottom: '6px' }}>Value (e.g. 9+, 250+)</label>
                                                            <input name={`ach_value_${idx}`} defaultValue={ach.value} required style={{ width: '100%', padding: '8px', background: '#141720', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
                                                        </div>
                                                        <div className="form-group">
                                                            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', marginBottom: '6px' }}>Label (e.g. Years of Experience)</label>
                                                            <input name={`ach_label_${idx}`} defaultValue={ach.label} required style={{ width: '100%', padding: '8px', background: '#141720', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <button type="submit" className="btn-save-modal" style={{ marginTop: '25px' }}>SAVE ACHIEVEMENTS</button>
                                    </form>
                                </div>
                            )}

                            {activeAboutSubTab === 'team' && (
                                <div className="card-luxury p-6" style={{ background: '#141720', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '10px' }}>Edit Team Section</h3>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        const combinedTitle = e.target.titleLine2.value
                                            ? `${e.target.titleLine1.value}<br />${e.target.titleLine2.value}`
                                            : e.target.titleLine1.value;

                                        const newTraits = [0, 1, 2, 3].map(i => ({
                                            icon: e.target[`trait_icon_${i}`].value,
                                            title: e.target[`trait_title_${i}`].value,
                                            desc: e.target[`trait_desc_${i}`].value,
                                        }));

                                        handleSaveAboutSection('team', {
                                            title: combinedTitle,
                                            desc: e.target.desc.value,
                                            traits: newTraits
                                        });
                                    }}>
                                        <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                                            <div className="form-group">
                                                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Title (First Line)</label>
                                                <input name="titleLine1" defaultValue={(aboutData.team?.title || 'A Team Of Creatives<br />And Problem Solvers').split('<br />')[0]} required style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                            </div>
                                            <div className="form-group">
                                                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Title (Second Line)</label>
                                                <input name="titleLine2" defaultValue={(aboutData.team?.title || '').includes('<br />') ? (aboutData.team?.title || '').split('<br />')[1] : ''} style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                            </div>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '24px' }}>
                                            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px' }}>Section Description</label>
                                            <textarea name="desc" defaultValue={aboutData.team?.desc || ''} required rows="3" style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                        </div>

                                        <h4 style={{ color: '#fff', fontSize: '1rem', paddingBottom: '10px', marginBottom: '15px' }}>Team Traits (4 Cards)</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            {[0, 1, 2, 3].map((idx) => {
                                                const defaultTraits = [
                                                    { icon: 'HiOutlineUserGroup', title: 'Creative Designers', desc: 'Bringing ideas to life with creativity.' },
                                                    { icon: 'RiPencilRuler2Line', title: 'Detail Oriented', desc: 'Precision in every detail makes perfection.' },
                                                    { icon: 'BiBuildingHouse', title: 'Project Management', desc: 'Seamless execution from start to finish.' },
                                                    { icon: 'FiHeart', title: 'Client Focused', desc: 'Your satisfaction is at the heart of what we do.' }
                                                ];
                                                const trait = (aboutData.team?.traits && aboutData.team.traits[idx])
                                                    || defaultTraits[idx];
                                                return (
                                                    <div key={idx} style={{ padding: '15px', background: '#0b0d11', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                        <h5 style={{ color: '#c48b59', marginBottom: '15px', fontSize: '0.9rem', margin: 0 }}>Trait Card {idx + 1}</h5>
                                                        <div className="form-group" style={{ marginBottom: '12px', marginTop: '12px' }}>
                                                            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', marginBottom: '6px' }}>Icon</label>
                                                            <select name={`trait_icon_${idx}`} defaultValue={trait.icon} style={{ width: '100%', padding: '8px', background: '#141720', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}>
                                                                <option value="HiOutlineUserGroup">Users Group</option>
                                                                <option value="RiPencilRuler2Line">Pencil & Ruler</option>
                                                                <option value="BiBuildingHouse">Building / Project</option>
                                                                <option value="FiHeart">Heart / Care</option>
                                                                <option value="BiCalendarStar">Calendar Star</option>
                                                                <option value="BiTrophy">Trophy</option>
                                                                <option value="BiSmile">Smile</option>
                                                                <option value="VscWorkspaceTrusted">Shield</option>
                                                            </select>
                                                        </div>
                                                        <div className="form-group" style={{ marginBottom: '12px' }}>
                                                            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', marginBottom: '6px' }}>Trait Title</label>
                                                            <input name={`trait_title_${idx}`} defaultValue={trait.title} required style={{ width: '100%', padding: '8px', background: '#141720', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
                                                        </div>
                                                        <div className="form-group">
                                                            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', marginBottom: '6px' }}>Trait Description</label>
                                                            <textarea name={`trait_desc_${idx}`} defaultValue={trait.desc} required rows="2" style={{ width: '100%', padding: '8px', background: '#141720', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <button type="submit" className="btn-save-modal" style={{ marginTop: '25px' }}>SAVE TEAM TRAITS</button>
                                    </form>
                                </div>
                            )}

                        </div>
                    )}

                    {/* ── TAB: CAREERS MANAGEMENT ── */}
                    {!loading && activeTab === 'careers' && (
                        <div className="panel-section">
                            <div className="panel-header">
                                <div>
                                    <h2>Careers & Recruitment Management</h2>
                                    <p>Manage job openings, customize the Careers Page hero header, and review candidate resume applications.</p>
                                </div>
                                {careersSubTab === 'jobs' && (
                                    <button className="btn-primary-gold" onClick={handleOpenAddJob}>
                                        <TbPlus /> ADD NEW JOB OPENING
                                    </button>
                                )}
                                {careersSubTab === 'hero' && (
                                    <button className="btn-primary-gold" onClick={() => {
                                        setCareersHeroForm({
                                            kicker: careersHero.kicker || 'JOIN OUR TEAM',
                                            title: careersHero.title || 'Build Your Career in Interior Design',
                                            description: careersHero.description || '',
                                            bgImage: careersHero.bgImage || ''
                                        });
                                        setCareersHeroModalOpen(true);
                                    }}>
                                        <TbEdit /> EDIT CAREERS HERO
                                    </button>
                                )}
                            </div>

                            {/* Sub-tab Switcher Bar */}
                            <div className="admin-subtab-bar" style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => setCareersSubTab('jobs')}
                                    style={{
                                        background: careersSubTab === 'jobs' ? '#c48b59' : 'transparent',
                                        color: careersSubTab === 'jobs' ? '#fff' : '#94a3b8',
                                        border: careersSubTab === 'jobs' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 16px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <TbBriefcase /> Job Openings ({jobOpenings.length})
                                </button>
                                <button
                                    onClick={() => setCareersSubTab('hero')}
                                    style={{
                                        background: careersSubTab === 'hero' ? '#c48b59' : 'transparent',
                                        color: careersSubTab === 'hero' ? '#fff' : '#94a3b8',
                                        border: careersSubTab === 'hero' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 16px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <TbSlideshow /> Hero Header
                                </button>
                                <button
                                    onClick={() => setCareersSubTab('about')}
                                    style={{
                                        background: careersSubTab === 'about' ? '#c48b59' : 'transparent',
                                        color: careersSubTab === 'about' ? '#fff' : '#94a3b8',
                                        border: careersSubTab === 'about' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 16px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <TbUsers /> About Our Team
                                </button>
                                <button
                                    onClick={() => setCareersSubTab('why')}
                                    style={{
                                        background: careersSubTab === 'why' ? '#c48b59' : 'transparent',
                                        color: careersSubTab === 'why' ? '#fff' : '#94a3b8',
                                        border: careersSubTab === 'why' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 16px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <TbHeart /> Why Work With Us
                                </button>
                                <button
                                    onClick={() => setCareersSubTab('cta')}
                                    style={{
                                        background: careersSubTab === 'cta' ? '#c48b59' : 'transparent',
                                        color: careersSubTab === 'cta' ? '#fff' : '#94a3b8',
                                        border: careersSubTab === 'cta' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 16px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <TbQuote /> Ready To Join (CTA)
                                </button>
                                <button
                                    onClick={() => setCareersSubTab('applications')}
                                    style={{
                                        background: careersSubTab === 'applications' ? '#c48b59' : 'transparent',
                                        color: careersSubTab === 'applications' ? '#fff' : '#94a3b8',
                                        border: careersSubTab === 'applications' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '8px 16px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <TbUserCheck /> Applications ({jobApplications.length})
                                </button>
                            </div>

                            {/* Subtab 1: Job Openings */}
                            {careersSubTab === 'jobs' && (
                                <div className="admin-table-container">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Icon</th>
                                                <th>Title & Department</th>
                                                <th>Type & Location</th>
                                                <th>Experience</th>
                                                <th>Status</th>
                                                <th style={{ textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {jobOpenings.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                                                        No job openings created yet. Click "Add New Job Opening" to list a position.
                                                    </td>
                                                </tr>
                                            ) : (
                                                jobOpenings.map(job => (
                                                    <tr key={job._id}>
                                                        <td>
                                                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#faf2ea', color: '#c48b59', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                                                {job.title ? job.title.charAt(0) : 'J'}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{job.title}</strong>
                                                            <div style={{ fontSize: '0.78rem', color: '#c48b59', marginTop: '2px' }}>{job.department || 'Design Studio'}</div>
                                                        </td>
                                                        <td>
                                                            <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{job.type || 'Full-time'}</span>
                                                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{job.location || 'Colombo, Sri Lanka'}</div>
                                                        </td>
                                                        <td>
                                                            <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{job.experience || '2-4 Years'}</span>
                                                        </td>
                                                        <td>
                                                            <span className={`status-tag ${job.isActive !== false ? 'approved' : 'pending'}`}>
                                                                {job.isActive !== false ? 'Active' : 'Draft'}
                                                            </span>
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <button className="btn-action edit" title="Edit Job Opening" onClick={() => handleOpenEditJob(job)}>
                                                                <TbEdit />
                                                            </button>
                                                            <button className="btn-action delete" title="Delete Job Opening" onClick={() => handleDeleteJob(job._id)}>
                                                                <TbTrash />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Subtab 2: Hero Header Settings Preview */}
                            {careersSubTab === 'hero' && (
                                <div className="overview-card" style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h3 style={{ margin: 0, color: '#c48b59', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <TbSlideshow /> Current Careers Page Hero Header
                                        </h3>
                                        <button className="btn-primary-gold" onClick={() => {
                                            setCareersHeroForm({
                                                kicker: careersHero.kicker || 'JOIN OUR TEAM',
                                                title: careersHero.title || 'Build Your Career in Interior Design',
                                                description: careersHero.description || '',
                                                bgImage: careersHero.bgImage || ''
                                            });
                                            setCareersHeroModalOpen(true);
                                        }}>
                                            <TbEdit /> Edit Hero Header Text & Image
                                        </button>
                                    </div>

                                    {/* Live Hero Header Banner Preview */}
                                    <div style={{
                                        position: 'relative',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        padding: '40px 36px',
                                        border: '1px solid rgba(212, 175, 55, 0.25)',
                                        backgroundImage: `linear-gradient(rgba(11, 13, 17, 0.8), rgba(11, 13, 17, 0.88)), url(${careersHero.bgImage || careersHeroBg})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                        minHeight: '220px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center'
                                    }}>
                                        <span style={{ color: '#c48b59', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
                                            {careersHero.kicker || 'JOIN OUR TEAM'}
                                        </span>
                                        <h1 style={{ color: '#ffffff', fontSize: '2rem', margin: '12px 0 16px', fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: '600' }}>
                                            {careersHero.title || 'Build Your Career in Interior Design'}
                                        </h1>
                                        <p style={{ color: '#cbd5e1', fontSize: '0.92rem', maxWidth: '650px', lineHeight: '1.6', margin: 0 }}>
                                            {careersHero.description || "We're always looking for passionate, creative and talented individuals to join our team."}
                                        </p>
                                    </div>

                                    {/* Image Status & Thumbnail Row */}
                                    <div style={{ marginTop: '24px', background: '#0f1219', borderRadius: '12px', padding: '16px 20px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                                        <div style={{ width: '120px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(196,139,89,0.4)', flexShrink: 0, position: 'relative' }}>
                                            <img src={careersHero.bgImage || careersHeroBg} alt="Careers Hero Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: '200px' }}>
                                            <h4 style={{ color: '#ffffff', margin: '0 0 4px 0', fontSize: '0.95rem' }}>Hero Background Image</h4>
                                            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>
                                                {careersHero.bgImage ? 'Custom uploaded background image active' : 'Default luxury background image active'}
                                            </p>
                                        </div>
                                        <button className="btn-action edit" onClick={() => {
                                            setCareersHeroForm({
                                                kicker: careersHero.kicker || 'JOIN OUR TEAM',
                                                title: careersHero.title || 'Build Your Career in Interior Design',
                                                description: careersHero.description || '',
                                                bgImage: careersHero.bgImage || ''
                                            });
                                            setCareersHeroModalOpen(true);
                                        }}>
                                            <TbPhoto /> Change Image
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Subtab: About Our Team Section */}
                            {careersSubTab === 'about' && (
                                <div className="overview-card" style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h3 style={{ margin: 0, color: '#c48b59', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <TbUsers /> About Our Team Section
                                        </h3>
                                        <button className="btn-primary-gold" onClick={() => {
                                            setCareersAboutForm({
                                                aboutKicker: careersHero.aboutKicker || 'ABOUT OUR TEAM',
                                                aboutTitle: careersHero.aboutTitle || 'Great People Build Great Spaces',
                                                aboutDesc: careersHero.aboutDesc || 'At Good Interior, we believe that a strong team creates extraordinary results...',
                                                aboutImage: careersHero.aboutImage || '',
                                                aboutF1: careersHero.aboutF1 || 'Creative Environment',
                                                aboutF2: careersHero.aboutF2 || 'Professional Growth',
                                                aboutF3: careersHero.aboutF3 || 'Collaborative Team',
                                                aboutF4: careersHero.aboutF4 || 'Meaningful Impact'
                                            });
                                            setCareersAboutModalOpen(true);
                                        }}>
                                            <TbEdit /> Edit Section Details & Team Image
                                        </button>
                                    </div>

                                    {/* Live Banner Preview */}
                                    <div style={{
                                        position: 'relative',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        padding: '30px',
                                        background: '#0f1219',
                                        border: '1px solid rgba(212, 175, 55, 0.25)',
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                                        gap: '24px',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <span style={{ color: '#c48b59', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
                                                {careersHero.aboutKicker || 'ABOUT OUR TEAM'}
                                            </span>
                                            <h2 style={{ color: '#ffffff', fontSize: '1.8rem', margin: '10px 0 10px', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                                                {careersHero.aboutTitle || 'Great People Build Great Spaces'}
                                            </h2>
                                            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.6', margin: '0 0 20px 0' }}>
                                                {careersHero.aboutDesc || 'At Good Interior, we believe that a strong team creates extraordinary results...'}
                                            </p>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <TbBulb style={{ color: '#c48b59', fontSize: '1.2rem' }} />
                                                    <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '600' }}>{careersHero.aboutF1 || 'Creative Environment'}</span>
                                                </div>
                                                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <TbTrendingUp style={{ color: '#c48b59', fontSize: '1.2rem' }} />
                                                    <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '600' }}>{careersHero.aboutF2 || 'Professional Growth'}</span>
                                                </div>
                                                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <TbUsers style={{ color: '#c48b59', fontSize: '1.2rem' }} />
                                                    <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '600' }}>{careersHero.aboutF3 || 'Collaborative Team'}</span>
                                                </div>
                                                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <TbHeart style={{ color: '#c48b59', fontSize: '1.2rem' }} />
                                                    <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '600' }}>{careersHero.aboutF4 || 'Meaningful Impact'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ borderRadius: '12px', overflow: 'hidden', height: '220px', border: '1px solid rgba(196,139,89,0.3)' }}>
                                            <img src={careersHero.aboutImage || teamCollabImg} alt="About Team Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Subtab 3: Why Work With Us Section */}
                            {careersSubTab === 'why' && (
                                <div className="overview-card" style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h3 style={{ margin: 0, color: '#c48b59', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <TbHeart /> Why Work With Us Section
                                        </h3>
                                        <button className="btn-primary-gold" onClick={() => {
                                            setCareersWhyForm({
                                                whyKicker: careersHero.whyKicker || 'WHY WORK WITH US',
                                                whyTitle: careersHero.whyTitle || 'More Than a Job',
                                                whySubtitle: careersHero.whySubtitle || "It's a Place to Grow",
                                                whyBgImage: careersHero.whyBgImage || '',
                                                whyB1Title: careersHero.whyB1Title || 'Competitive Salary & Benefits',
                                                whyB2Title: careersHero.whyB2Title || 'Learning & Development',
                                                whyB3Title: careersHero.whyB3Title || 'Supportive Team Culture',
                                                whyB4Title: careersHero.whyB4Title || 'Work-Life Balance'
                                            });
                                            setCareersWhyModalOpen(true);
                                        }}>
                                            <TbEdit /> Edit Section Details & Background
                                        </button>
                                    </div>

                                    {/* Live Banner Preview */}
                                    <div style={{
                                        position: 'relative',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        padding: '40px 36px',
                                        border: '1px solid rgba(212, 175, 55, 0.25)',
                                        backgroundImage: `linear-gradient(rgba(11, 13, 17, 0.85), rgba(11, 13, 17, 0.9)), url(${careersHero.whyBgImage || careersWhyBg})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                                    }}>
                                        <span style={{ color: '#c48b59', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
                                            {careersHero.whyKicker || 'WHY WORK WITH US'}
                                        </span>
                                        <h2 style={{ color: '#ffffff', fontSize: '1.8rem', margin: '10px 0 6px', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                                            {careersHero.whyTitle || 'More Than a Job'}
                                        </h2>
                                        <h3 style={{ color: '#c48b59', fontSize: '1.4rem', fontStyle: 'italic', margin: '0 0 24px 0', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                                            {careersHero.whySubtitle || "It's a Place to Grow"}
                                        </h3>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                                            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                <span style={{ color: '#c48b59', fontSize: '0.75rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>BENEFIT 1</span>
                                                <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{careersHero.whyB1Title || 'Competitive Salary & Benefits'}</strong>
                                            </div>
                                            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                <span style={{ color: '#c48b59', fontSize: '0.75rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>BENEFIT 2</span>
                                                <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{careersHero.whyB2Title || 'Learning & Development'}</strong>
                                            </div>
                                            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                <span style={{ color: '#c48b59', fontSize: '0.75rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>BENEFIT 3</span>
                                                <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{careersHero.whyB3Title || 'Supportive Team Culture'}</strong>
                                            </div>
                                            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                <span style={{ color: '#c48b59', fontSize: '0.75rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>BENEFIT 4</span>
                                                <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{careersHero.whyB4Title || 'Work-Life Balance'}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Subtab 4: Ready To Join CTA Section */}
                            {careersSubTab === 'cta' && (
                                <div className="overview-card" style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h3 style={{ margin: 0, color: '#c48b59', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <TbQuote /> Ready To Join (CTA Section)
                                        </h3>
                                        <button className="btn-primary-gold" onClick={() => {
                                            setCareersCtaForm({
                                                ctaKicker: careersHero.ctaKicker || 'READY TO JOIN?',
                                                ctaTitle: careersHero.ctaTitle || "Let's Build Something Beautiful Together",
                                                ctaDescription: careersHero.ctaDescription || "If you're passionate about interior design and want to be part of a creative team, we'd love to hear from you.",
                                                ctaImage: careersHero.ctaImage || '',
                                                ctaButtonText: careersHero.ctaButtonText || 'APPLY NOW',
                                                ctaQuote: careersHero.ctaQuote || `"At Good Interior, we don't just design spaces — we create experiences. And we're always looking for great people to help us do it."`,
                                                ctaQuoteAuthor: careersHero.ctaQuoteAuthor || 'OUR TEAM'
                                            });
                                            setCareersCtaModalOpen(true);
                                        }}>
                                            <TbEdit /> Edit CTA Text, Image & Quote
                                        </button>
                                    </div>

                                    {/* Live CTA Section Preview */}
                                    <div style={{ background: '#0f1219', borderRadius: '16px', padding: '30px', border: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', alignItems: 'center' }}>
                                        <div style={{ borderRadius: '12px', overflow: 'hidden', height: '180px', border: '1px solid rgba(196,139,89,0.3)' }}>
                                            <img src={careersHero.ctaImage || careersCtaLivingRoom} alt="CTA Feature Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div>
                                            <span style={{ color: '#c48b59', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>
                                                {careersHero.ctaKicker || 'READY TO JOIN?'}
                                            </span>
                                            <h3 style={{ color: '#ffffff', fontSize: '1.4rem', margin: '8px 0 10px', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                                                {careersHero.ctaTitle || "Let's Build Something Beautiful Together"}
                                            </h3>
                                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 14px 0' }}>
                                                {careersHero.ctaDescription || "If you're passionate about interior design and want to be part of a creative team..."}
                                            </p>
                                            <span style={{ background: '#c48b59', color: '#fff', padding: '6px 14px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700', display: 'inline-block' }}>
                                                {careersHero.ctaButtonText || 'APPLY NOW'} →
                                            </span>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '16px', borderLeft: '3px solid #c48b59' }}>
                                            <p style={{ color: '#cbd5e1', fontSize: '0.82rem', fontStyle: 'italic', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                                                {careersHero.ctaQuote || `"At Good Interior, we don't just design spaces — we create experiences..."`}
                                            </p>
                                            <span style={{ color: '#c48b59', fontSize: '0.75rem', fontWeight: '700' }}>
                                                — {careersHero.ctaQuoteAuthor || 'OUR TEAM'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Subtab 3: Candidate Applications */}
                            {careersSubTab === 'applications' && (
                                <div className="admin-table-container">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Date Received</th>
                                                <th>Candidate Name</th>
                                                <th>Position Applied</th>
                                                <th>Contact Details</th>
                                                <th>CV / Portfolio</th>
                                                <th>Status</th>
                                                <th style={{ textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {jobApplications.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                                                        No candidate resume submissions received yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                jobApplications.map(app => (
                                                    <tr key={app._id}>
                                                        <td>
                                                            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                                                {new Date(app.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <strong style={{ color: '#fff' }}>{app.fullName}</strong>
                                                            {app.experience && (
                                                                <div style={{ fontSize: '0.78rem', color: '#c48b59', fontWeight: '600', marginTop: '2px' }}>
                                                                    Exp: {app.experience}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <span style={{ color: '#c48b59', fontWeight: '600' }}>{app.position}</span>
                                                        </td>
                                                        <td>
                                                            <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{app.email}</div>
                                                            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{app.phone}</div>
                                                        </td>
                                                        <td>
                                                            {app.cvFile ? (
                                                                <a
                                                                    href={app.cvFile}
                                                                    download={app.cvFileName || `${app.fullName.replace(/\s+/g, '_')}_CV.pdf`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    style={{
                                                                        background: 'rgba(37, 99, 235, 0.15)',
                                                                        color: '#60a5fa',
                                                                        border: '1px solid rgba(96, 165, 250, 0.3)',
                                                                        borderRadius: '6px',
                                                                        padding: '6px 12px',
                                                                        fontSize: '0.8rem',
                                                                        fontWeight: '600',
                                                                        textDecoration: 'none',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '6px',
                                                                        marginBottom: '4px',
                                                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                                                    }}
                                                                    title={`Click to Download CV: ${app.cvFileName || 'Candidate Resume'}`}
                                                                >
                                                                    <TbFileText style={{ fontSize: '0.95rem' }} />
                                                                    <span>{app.cvFileName ? (app.cvFileName.length > 18 ? app.cvFileName.substring(0, 16) + '...' : app.cvFileName) : 'Download CV'}</span>
                                                                </a>
                                                            ) : app.portfolioUrl ? (
                                                                <a href={app.portfolioUrl} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', fontSize: '0.82rem', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                    <TbExternalLink /> View Portfolio Link
                                                                </a>
                                                            ) : (
                                                                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>No Attachment</span>
                                                            )}
                                                            {app.message && (
                                                                <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '4px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                    "{app.message}"
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <select
                                                                value={app.status || 'Pending'}
                                                                onChange={(e) => handleUpdateJobAppStatus(app._id, e.target.value)}
                                                                style={{
                                                                    background: app.status === 'Contacted' ? 'rgba(34, 197, 94, 0.15)' : app.status === 'Reviewed' ? 'rgba(59, 130, 246, 0.15)' : app.status === 'Rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                                                                    color: app.status === 'Contacted' ? '#4ade80' : app.status === 'Reviewed' ? '#60a5fa' : app.status === 'Rejected' ? '#f87171' : '#facc15',
                                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                                    borderRadius: '6px',
                                                                    padding: '4px 8px',
                                                                    fontSize: '0.78rem',
                                                                    fontWeight: '600',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                <option value="Pending" style={{ background: '#1e293b', color: '#facc15' }}>Pending</option>
                                                                <option value="Reviewed" style={{ background: '#1e293b', color: '#60a5fa' }}>Reviewed</option>
                                                                <option value="Contacted" style={{ background: '#1e293b', color: '#4ade80' }}>Contacted</option>
                                                                <option value="Rejected" style={{ background: '#1e293b', color: '#f87171' }}>Rejected</option>
                                                            </select>
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                                                <button
                                                                    className="btn-action edit"
                                                                    title="Send Custom / Template Email to Candidate"
                                                                    onClick={() => handleOpenEmailModal(app)}
                                                                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                                                >
                                                                    <TbMail />
                                                                </button>
                                                                <button
                                                                    className="btn-action delete"
                                                                    title="Delete Candidate Application"
                                                                    onClick={() => handleDeleteJobApplication(app._id)}
                                                                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                                                >
                                                                    <TbTrash />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}


                </main>
            </div>

            {/* ── MODAL: HERO SLIDE FORM ── */}
            {
                slideModalOpen && (
                    <div className="modal-overlay-luxury">
                        <div className="modal-box-luxury">
                            <div className="modal-header-luxury">
                                <h3>{editingSlide ? 'Edit Hero Slide' : 'Add New Homepage Hero Slide'}</h3>
                                <button className="btn-close-modal" onClick={() => setSlideModalOpen(false)}><TbX /></button>
                            </div>
                            <form onSubmit={handleSaveHeroSlide} className="modal-form-luxury">
                                <div className="form-group">
                                    <label>Background Image *</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageFileUpload(e, (base64) => setSlideForm({ ...slideForm, image: base64 }))}
                                    />
                                    <span className="or-text">OR Image URL:</span>
                                    <input
                                        type="text"
                                        placeholder="https://images.unsplash.com/..."
                                        value={slideForm.image}
                                        onChange={(e) => setSlideForm({ ...slideForm, image: e.target.value })}
                                    />
                                    {slideForm.image && (
                                        <div className="img-preview-box">
                                            <img src={slideForm.image} alt="Slide Preview" />
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Kicker Tagline (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. YOUR DREAM SPACE AWAITS"
                                        value={slideForm.kicker}
                                        onChange={(e) => setSlideForm({ ...slideForm, kicker: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Main Title Text (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Transform Your Home Into a Masterpiece"
                                        value={slideForm.title}
                                        onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Subtitle Description (Optional)</label>
                                    <textarea
                                        rows="3"
                                        placeholder="e.g. From concept to completion, we guide you every step..."
                                        value={slideForm.subtitle}
                                        onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })}
                                    />
                                </div>

                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Display Order</label>
                                        <input
                                            type="number"
                                            value={slideForm.order}
                                            onChange={(e) => setSlideForm({ ...slideForm, order: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group checkbox-field">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={slideForm.active !== false}
                                                onChange={(e) => setSlideForm({ ...slideForm, active: e.target.checked })}
                                            />
                                            Active Slide (Visible on website)
                                        </label>
                                    </div>
                                </div>

                                <div className="modal-actions-luxury">
                                    <button type="button" className="btn-cancel-modal" onClick={() => setSlideModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-modal">SAVE HERO SLIDE</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* ── MODAL: PROJECT FORM ── */}
            {
                projectModalOpen && (
                    <div className="modal-overlay-luxury">
                        <div className="modal-box-luxury">
                            <div className="modal-header-luxury">
                                <h3>{editingProject ? 'Edit Project' : 'Add New Portfolio Project'}</h3>
                                <button className="btn-close-modal" onClick={() => setProjectModalOpen(false)}><TbX /></button>
                            </div>
                            <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '10px' }}>
                                <form onSubmit={handleSaveProject} className="modal-form-luxury">
                                    <div className="form-group">
                                        <label>Project Title *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Minimalist Urban Villa"
                                            value={projectForm.title}
                                            onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-row-2col">
                                        <div className="form-group">
                                            <label>Category (Card Tag) *</label>
                                            <select
                                                value={projectForm.category}
                                                onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                                            >
                                                <option value="RESIDENTIAL">RESIDENTIAL</option>
                                                <option value="COMMERCIAL">COMMERCIAL</option>
                                                <option value="KITCHEN">KITCHEN</option>
                                                <option value="BEDROOM">BEDROOM</option>
                                                <option value="LIVING & DINING">LIVING & DINING</option>
                                                <option value="RENOVATION">RENOVATION</option>
                                                <option value="OTHER">OTHER</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Year</label>
                                            <input
                                                type="text"
                                                value={projectForm.year}
                                                onChange={(e) => setProjectForm({ ...projectForm, year: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row-2col">
                                        <div className="form-group">
                                            <label>Filter Category (Portfolio Nav)</label>
                                            <select value={projectForm.filterCategory} onChange={(e) => setProjectForm({ ...projectForm, filterCategory: e.target.value })}>
                                                <option value="residential">residential</option>
                                                <option value="commercial">commercial</option>
                                                <option value="kitchen">kitchen</option>
                                                <option value="bedroom">bedroom</option>
                                                <option value="living-dining">living-dining</option>
                                                <option value="renovation">renovation</option>
                                                <option value="bathroom">bathroom</option>
                                                <option value="other">other</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Sub Category (Gallery Generation)</label>
                                            <select value={projectForm.subCategory} onChange={(e) => setProjectForm({ ...projectForm, subCategory: e.target.value })}>
                                                <option value="living-dining">living-dining</option>
                                                <option value="commercial">commercial</option>
                                                <option value="kitchen">kitchen</option>
                                                <option value="bedroom">bedroom</option>
                                                <option value="renovation">renovation</option>
                                                <option value="bathroom">bathroom</option>
                                                <option value="other">other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Project Main Image (URL or Upload) *</label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input type="text" placeholder="https://..." value={projectForm.image} onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })} style={{ flex: 1 }} />
                                            <input type="file" accept="image/*" onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setProjectForm({ ...projectForm, image: reader.result });
                                                    reader.readAsDataURL(file);
                                                }
                                            }} style={{ width: '200px' }} />
                                        </div>
                                    </div>

                                    <div className="form-row-2col">
                                        <div className="form-group">
                                            <label>Client Name</label>
                                            <input type="text" placeholder="e.g. Private Residence" value={projectForm.client} onChange={(e) => setProjectForm({ ...projectForm, client: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Location</label>
                                            <input type="text" placeholder="e.g. Colombo 07" value={projectForm.location} onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="form-row-2col">
                                        <div className="form-group">
                                            <label>Area (sq ft)</label>
                                            <input type="text" placeholder="1,850 sq ft" value={projectForm.area} onChange={(e) => setProjectForm({ ...projectForm, area: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Project Status</label>
                                            <select value={projectForm.status} onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}>
                                                <option value="Completed">Completed</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="On Hold">On Hold</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Card Description</label>
                                        <textarea rows="1" placeholder="Short description..." value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} />
                                    </div>

                                    <h4 style={{ color: '#c48b59', borderBottom: '1px solid rgba(196,139,89,0.3)', paddingBottom: '5px', marginTop: '15px' }}>Project Details Page Content</h4>

                                    <div className="form-group">
                                        <label>Project Overview</label>
                                        <textarea rows="3" placeholder="Longer overview of the project..." value={projectForm.projectOverview} onChange={(e) => setProjectForm({ ...projectForm, projectOverview: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Client Requirements (one per line)</label>
                                        <textarea rows="3" placeholder="A calm space..." value={projectForm.requirements} onChange={(e) => setProjectForm({ ...projectForm, requirements: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Design Concept</label>
                                        <textarea rows="3" placeholder="The concept revolves around..." value={projectForm.designConcept} onChange={(e) => setProjectForm({ ...projectForm, designConcept: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Key Features (one per line)</label>
                                        <textarea rows="3" placeholder="Neutral palette..." value={projectForm.keyFeatures} onChange={(e) => setProjectForm({ ...projectForm, keyFeatures: e.target.value })} />
                                    </div>

                                    <div className="form-row-2col">
                                        <div className="form-group">
                                            <label>Before Image (URL or Upload)</label>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <input type="text" placeholder="URL..." value={projectForm.beforeImg} onChange={(e) => setProjectForm({ ...projectForm, beforeImg: e.target.value })} />
                                                <input type="file" accept="image/*" onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        compressImage(file).then(dataUrl => {
                                                            setProjectForm({ ...projectForm, beforeImg: dataUrl });
                                                        });
                                                    }
                                                }} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>After Image (URL or Upload)</label>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <input type="text" placeholder="URL..." value={projectForm.afterImg} onChange={(e) => setProjectForm({ ...projectForm, afterImg: e.target.value })} />
                                                <input type="file" accept="image/*" onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        compressImage(file).then(dataUrl => {
                                                            setProjectForm({ ...projectForm, afterImg: dataUrl });
                                                        });
                                                    }
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Gallery Images (Upload up to 5 images)</label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <input type="file" multiple accept="image/*" onChange={(e) => {
                                                const files = Array.from(e.target.files).slice(0, 5);

                                                const readers = files.map(file => {
                                                    return compressImage(file);
                                                });

                                                Promise.all(readers).then(base64Arr => {
                                                    setProjectForm({ ...projectForm, galleryImages: base64Arr.join('\n') });
                                                });
                                            }} style={{ fontSize: '0.9rem', color: '#c48b59' }} />
                                            <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>* Holding Ctrl (Windows) or Cmd (Mac) allows selecting multiple files at once. Note: This replaces current images.</small>

                                            {/* Preview existing/uploaded images */}
                                            {projectForm.galleryImages && (
                                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                                                    {projectForm.galleryImages.split('\n').filter(Boolean).map((src, idx) => (
                                                        <div key={idx} style={{ position: 'relative', width: '80px', height: '80px' }}>
                                                            <img
                                                                src={src}
                                                                alt={`Gallery ${idx}`}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid #475569' }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <h4 style={{ color: '#c48b59', borderBottom: '1px solid rgba(196,139,89,0.3)', paddingBottom: '5px', marginTop: '15px' }}>Testimonial</h4>
                                    <div className="form-group">
                                        <label>Testimonial Quote</label>
                                        <textarea rows="2" value={projectForm.testimonialQuote} onChange={(e) => setProjectForm({ ...projectForm, testimonialQuote: e.target.value })} />
                                    </div>
                                    <div className="form-row-2col">
                                        <div className="form-group">
                                            <label>Author Name</label>
                                            <input type="text" value={projectForm.testimonialAuthor} onChange={(e) => setProjectForm({ ...projectForm, testimonialAuthor: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Author Role</label>
                                            <input type="text" value={projectForm.testimonialRole} onChange={(e) => setProjectForm({ ...projectForm, testimonialRole: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="modal-actions-luxury">
                                        <button type="button" className="btn-cancel-modal" onClick={() => setProjectModalOpen(false)}>Cancel</button>
                                        <button type="submit" className="btn-save-modal">SAVE PROJECT</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                portfolioHeroModalOpen && (
                    <div className="modal-overlay-luxury">
                        <div className="modal-box-luxury" style={{ maxWidth: '600px' }}>
                            <div className="modal-header-luxury">
                                <h3>Edit Portfolio Hero Section</h3>
                                <button className="btn-close-modal" onClick={() => setPortfolioHeroModalOpen(false)}>×</button>
                            </div>
                            <form onSubmit={handleSavePortfolioHero} className="modal-form-luxury">
                                <div className="form-group">
                                    <label>Kicker / Tagline</label>
                                    <input type="text" placeholder="OUR PORTFOLIO" value={portfolioHeroForm.kicker} onChange={(e) => setPortfolioHeroForm({ ...portfolioHeroForm, kicker: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Title Top Line *</label>
                                    <input type="text" placeholder="Spaces We've Designed" value={portfolioHeroForm.titleLine1 || ''} onChange={(e) => setPortfolioHeroForm({ ...portfolioHeroForm, titleLine1: e.target.value })} required />
                                </div>
                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Highlighted Gold Text</label>
                                        <input type="text" placeholder="Stories We're Proud Of." value={portfolioHeroForm.titleHighlight || ''} onChange={(e) => setPortfolioHeroForm({ ...portfolioHeroForm, titleHighlight: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Title Bottom Line (Optional)</label>
                                        <input type="text" placeholder="" value={portfolioHeroForm.titleSuffix || ''} onChange={(e) => setPortfolioHeroForm({ ...portfolioHeroForm, titleSuffix: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Subtitle (Use Enter for new line)</label>
                                    <textarea rows="2" placeholder="Explore a selection of our completed projects..." value={portfolioHeroForm.subtitleText || ''} onChange={(e) => setPortfolioHeroForm({ ...portfolioHeroForm, subtitleText: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Background Image (URL or Upload)</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input type="text" placeholder="https://..." value={portfolioHeroForm.bgImage || ''} onChange={(e) => setPortfolioHeroForm({ ...portfolioHeroForm, bgImage: e.target.value })} style={{ flex: 1 }} />
                                        <input type="file" accept="image/*" onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setPortfolioHeroForm({ ...portfolioHeroForm, bgImage: reader.result });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }} style={{ width: '200px' }} />
                                    </div>
                                    {portfolioHeroForm.bgImage && (
                                        <div className="img-preview-box" style={{ marginTop: '10px' }}>
                                            <img src={portfolioHeroForm.bgImage} alt="Preview" />
                                        </div>
                                    )}
                                </div>
                                <div className="modal-actions-luxury">
                                    <button type="button" className="btn-cancel-modal" onClick={() => setPortfolioHeroModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-modal">SAVE PORTFOLIO HERO</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
            {/* ── MODAL: SERVICE FORM ── */}
            {
                serviceModalOpen && (
                    <div className="modal-overlay-luxury">
                        <div className="modal-box-luxury" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div className="modal-header-luxury">
                                <h3>{editingService ? 'Edit Service & Modal Details' : 'Add New Service Offering'}</h3>
                                <button className="btn-close-modal" onClick={() => setServiceModalOpen(false)}><TbX /></button>
                            </div>
                            <form onSubmit={handleSaveService} className="modal-form-luxury">
                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Service Title *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Residential Interior Design"
                                            value={serviceForm.title}
                                            onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Category Kicker / Tagline</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. HOME INTERIORS"
                                            value={serviceForm.kicker}
                                            onChange={(e) => setServiceForm({ ...serviceForm, kicker: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Icon Design</label>
                                        <select
                                            value={serviceForm.iconName}
                                            onChange={(e) => setServiceForm({ ...serviceForm, iconName: e.target.value })}
                                        >
                                            <option value="sofa">Sofa (Residential / Furniture)</option>
                                            <option value="macbook">Laptop / Office (Commercial)</option>
                                            <option value="kitchen">Kitchen (Culinary Spaces)</option>
                                            <option value="bed">Bed (Bedroom Design)</option>
                                            <option value="restaurant">Dining Table (Living & Dining)</option>
                                            <option value="layout">Layout Grid (Space Planning)</option>
                                            <option value="stack"> Materials & Finishes</option>
                                            <option value="lamp">Lamp / Styling & Decor</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Display Order</label>
                                        <input
                                            type="number"
                                            value={serviceForm.order}
                                            onChange={(e) => setServiceForm({ ...serviceForm, order: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Card Cover Image (Main Service Image) *</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageFileUpload(e, (base64) => setServiceForm({ ...serviceForm, image: base64 }))}
                                    />
                                    <span className="or-text">OR Image URL:</span>
                                    <input
                                        type="text"
                                        placeholder="https://images.unsplash.com/..."
                                        value={serviceForm.image}
                                        onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })}
                                    />
                                    {serviceForm.image && (
                                        <div className="img-preview-box" style={{ height: '120px', marginTop: '10px' }}>
                                            <img src={serviceForm.image} alt="Service Cover Preview" />
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Short Card Description (Shown on Grid Card) *</label>
                                    <textarea
                                        rows="2"
                                        required
                                        placeholder="Personalized home interiors that reflect your lifestyle and personality."
                                        value={serviceForm.desc}
                                        onChange={(e) => setServiceForm({ ...serviceForm, desc: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Full Detailed Overview (Shown inside Learn More Modal)</label>
                                    <textarea
                                        rows="4"
                                        placeholder="Our residential interior design service transforms your living space into a luxurious sanctuary..."
                                        value={serviceForm.fullDesc}
                                        onChange={(e) => setServiceForm({ ...serviceForm, fullDesc: e.target.value })}
                                    />
                                </div>

                                {/* Modal Slider Gallery Images (Up to 5 images) */}
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginTop: '16px' }}>
                                    <h4 style={{ color: '#c48b59', fontSize: '0.95rem', marginBottom: '12px' }}>
                                        Modal Slider Images (5 Gallery Photos)
                                    </h4>
                                    {[0, 1, 2, 3, 4].map((idx) => (
                                        <div key={idx} style={{ marginBottom: '12px', background: '#0b0d11', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                                                Slider Image {idx + 1}
                                            </label>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <input
                                                    type="text"
                                                    placeholder={`https://images.unsplash.com/... or Upload File`}
                                                    value={serviceForm.images[idx] || ''}
                                                    onChange={(e) => {
                                                        const updatedImgs = [...serviceForm.images];
                                                        updatedImgs[idx] = e.target.value;
                                                        setServiceForm({ ...serviceForm, images: updatedImgs });
                                                    }}
                                                    style={{ flex: 1 }}
                                                />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageFileUpload(e, (base64) => {
                                                        const updatedImgs = [...serviceForm.images];
                                                        updatedImgs[idx] = base64;
                                                        setServiceForm({ ...serviceForm, images: updatedImgs });
                                                    })}
                                                    style={{ width: '180px', fontSize: '0.75rem' }}
                                                />
                                            </div>
                                            {serviceForm.images[idx] && (
                                                <div style={{ height: '60px', width: '100px', borderRadius: '4px', overflow: 'hidden', marginTop: '6px' }}>
                                                    <img src={serviceForm.images[idx]} alt={`Slider preview ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="form-group" style={{ marginTop: '14px' }}>
                                    <label>Key Highlights / Features (One per line)</label>
                                    <textarea
                                        rows="4"
                                        placeholder={`Comprehensive Space Planning & 3D Visualizations\nCustom Built-in Furniture & Cabinetry\nCurated Color Palettes & Fabrics\nEnd-to-End On-Site Supervision`}
                                        value={serviceForm.highlights}
                                        onChange={(e) => setServiceForm({ ...serviceForm, highlights: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>What You Receive / Deliverables</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Moodboards, 3D Renderings, Floor Plans, Material Specification List"
                                        value={serviceForm.deliverables}
                                        onChange={(e) => setServiceForm({ ...serviceForm, deliverables: e.target.value })}
                                    />
                                </div>

                                <div className="modal-actions-luxury">
                                    <button type="button" className="btn-cancel-modal" onClick={() => setServiceModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-modal">SAVE SERVICE DETAILS</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* ── MODAL: SERVICE HERO FORM ── */}
            {
                serviceHeroModalOpen && (
                    <div className="modal-overlay-luxury">
                        <div className="modal-box-luxury" style={{ maxWidth: '700px' }}>
                            <div className="modal-header-luxury">
                                <h3>Edit Services Page Hero & Header</h3>
                                <button className="btn-close-modal" onClick={() => setServiceHeroModalOpen(false)}><TbX /></button>
                            </div>
                            <form onSubmit={handleSaveServiceHero} className="modal-form-luxury">
                                <div className="form-group">
                                    <label>Hero Kicker Tagline</label>
                                    <input
                                        type="text"
                                        placeholder="OUR SERVICES"
                                        value={serviceHeroForm.kicker}
                                        onChange={(e) => setServiceHeroForm({ ...serviceHeroForm, kicker: e.target.value })}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label>Hero Title Line 1 (Main White Text)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Comprehensive"
                                        value={serviceHeroForm.titleLine1 || ''}
                                        onChange={(e) => setServiceHeroForm({ ...serviceHeroForm, titleLine1: e.target.value })}
                                    />
                                </div>

                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label style={{ color: '#c48b59' }}>Highlighted Title Text (Gold Accent)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Interior Design"
                                            value={serviceHeroForm.titleHighlight || ''}
                                            onChange={(e) => setServiceHeroForm({ ...serviceHeroForm, titleHighlight: e.target.value })}
                                            style={{ borderColor: '#c48b59' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Title Line 2 Suffix (White Text)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Services"
                                            value={serviceHeroForm.titleSuffix || ''}
                                            onChange={(e) => setServiceHeroForm({ ...serviceHeroForm, titleSuffix: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Hero Subtitle Description</label>
                                    <textarea
                                        rows="3"
                                        placeholder="From concept to completion, we offer a full range of interior design services..."
                                        value={serviceHeroForm.subtitle}
                                        onChange={(e) => setServiceHeroForm({ ...serviceHeroForm, subtitle: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Hero Background Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageFileUpload(e, (base64) => setServiceHeroForm({ ...serviceHeroForm, bgImage: base64 }))}
                                    />
                                    <span className="or-text">OR Image URL:</span>
                                    <input
                                        type="text"
                                        placeholder="https://..."
                                        value={serviceHeroForm.bgImage}
                                        onChange={(e) => setServiceHeroForm({ ...serviceHeroForm, bgImage: e.target.value })}
                                    />
                                    {serviceHeroForm.bgImage && (
                                        <div className="img-preview-box" style={{ height: '120px', marginTop: '10px' }}>
                                            <img src={serviceHeroForm.bgImage} alt="Services Hero Background Preview" />
                                        </div>
                                    )}
                                </div>

                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginTop: '16px' }}>
                                    <h4 style={{ color: '#c48b59', fontSize: '0.95rem', marginBottom: '12px' }}>
                                        "What We Offer" Section Header
                                    </h4>
                                    <div className="form-row-2col">
                                        <div className="form-group">
                                            <label>Offer Section Subtitle</label>
                                            <input
                                                type="text"
                                                placeholder="WHAT WE OFFER"
                                                value={serviceHeroForm.offerKicker}
                                                onChange={(e) => setServiceHeroForm({ ...serviceHeroForm, offerKicker: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Offer Section Title</label>
                                            <input
                                                type="text"
                                                placeholder="Our Interior Design Services"
                                                value={serviceHeroForm.offerTitle}
                                                onChange={(e) => setServiceHeroForm({ ...serviceHeroForm, offerTitle: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Offer Section Description</label>
                                        <textarea
                                            rows="3"
                                            placeholder="We provide end-to-end interior design solutions..."
                                            value={serviceHeroForm.offerDesc}
                                            onChange={(e) => setServiceHeroForm({ ...serviceHeroForm, offerDesc: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginTop: '16px' }}>
                                    <h4 style={{ color: '#c48b59', fontSize: '0.95rem', marginBottom: '12px' }}>
                                        "Our Process" Section Header
                                    </h4>
                                    <div className="form-row-2col">
                                        <div className="form-group">
                                            <label>Process Section Subtitle Tagline</label>
                                            <input
                                                type="text"
                                                placeholder="OUR PROCESS"
                                                value={serviceHeroForm.processKicker || ''}
                                                onChange={(e) => setServiceHeroForm({ ...serviceHeroForm, processKicker: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Process Section Title</label>
                                            <input
                                                type="text"
                                                placeholder="A Simple & Transparent Process"
                                                value={serviceHeroForm.processTitle || ''}
                                                onChange={(e) => setServiceHeroForm({ ...serviceHeroForm, processTitle: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Process Section Description</label>
                                        <textarea
                                            rows="2"
                                            placeholder="We follow a structured process..."
                                            value={serviceHeroForm.processDesc || ''}
                                            onChange={(e) => setServiceHeroForm({ ...serviceHeroForm, processDesc: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginTop: '16px' }}>
                                    <h4 style={{ color: '#c48b59', fontSize: '0.95rem', marginBottom: '12px' }}>
                                        "Why Choose Us" Section Header & Quote Box
                                    </h4>
                                    <div className="form-row-2col">
                                        <div className="form-group">
                                            <label>Why Section Subtitle Tagline</label>
                                            <input
                                                type="text"
                                                placeholder="WHY CHOOSE US"
                                                value={serviceHeroForm.whyKicker || ''}
                                                onChange={(e) => setServiceHeroForm({ ...serviceHeroForm, whyKicker: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Why Section Title</label>
                                            <input
                                                type="text"
                                                placeholder="More Than Design.<br />A Better Way of Living."
                                                value={serviceHeroForm.whyTitle || ''}
                                                onChange={(e) => setServiceHeroForm({ ...serviceHeroForm, whyTitle: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Why Section Description</label>
                                        <textarea
                                            rows="2"
                                            placeholder="We combine creativity, expertise and a client-focused approach..."
                                            value={serviceHeroForm.whyDesc || ''}
                                            onChange={(e) => setServiceHeroForm({ ...serviceHeroForm, whyDesc: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Why Choose Us Side Feature Image URL</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageFileUpload(e, (base64) => setServiceHeroForm({ ...serviceHeroForm, whyImage: base64 }))}
                                        />
                                        <span className="or-text">OR Image URL:</span>
                                        <input
                                            type="text"
                                            placeholder="https://..."
                                            value={serviceHeroForm.whyImage || ''}
                                            onChange={(e) => setServiceHeroForm({ ...serviceHeroForm, whyImage: e.target.value })}
                                        />
                                        {serviceHeroForm.whyImage && (
                                            <div className="img-preview-box" style={{ height: '100px', marginTop: '8px' }}>
                                                <img src={serviceHeroForm.whyImage} alt="Why Feature Image Preview" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-row-2col">
                                        <div className="form-group">
                                            <label>Floating Quote Box Text</label>
                                            <textarea
                                                rows="2"
                                                placeholder="Good design creates spaces where life happens beautifully."
                                                value={serviceHeroForm.whyQuote || ''}
                                                onChange={(e) => setServiceHeroForm({ ...serviceHeroForm, whyQuote: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Quote Author / Brand Subtitle</label>
                                            <input
                                                type="text"
                                                placeholder="GOOD INTERIOR DESIGN STUDIO"
                                                value={serviceHeroForm.whyQuoteAuthor || ''}
                                                onChange={(e) => setServiceHeroForm({ ...serviceHeroForm, whyQuoteAuthor: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-actions-luxury">
                                    <button type="button" className="btn-cancel-modal" onClick={() => setServiceHeroModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-modal">SAVE HERO SETTINGS</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* ── MODAL: ADD / EDIT PROCESS STEP ── */}
            {
                processModalOpen && (
                    <div className="modal-overlay-luxury">
                        <div className="modal-box-luxury" style={{ maxWidth: '560px' }}>
                            <div className="modal-header-luxury">
                                <h3>{editingProcess ? 'Edit Process Step' : ' Add New Process Step'}</h3>
                                <button className="btn-close-modal" onClick={() => setProcessModalOpen(false)}>×</button>
                            </div>
                            <form onSubmit={handleSaveProcessStep} className="modal-form-luxury">
                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Step Number (e.g. 01, 02) *</label>
                                        <input
                                            type="text"
                                            placeholder="01"
                                            value={processForm.stepNumber}
                                            onChange={(e) => setProcessForm({ ...processForm, stepNumber: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Icon Type</label>
                                        <select
                                            value={processForm.iconName}
                                            onChange={(e) => setProcessForm({ ...processForm, iconName: e.target.value })}
                                        >
                                            <option value="chat">Chat / Consultation (BiMessageRoundedDots)</option>
                                            <option value="bulb">Bulb / Concept (BiBulb)</option>
                                            <option value="file">File / Selection (BiFile)</option>
                                            <option value="cog">Cog / Execution (BiCog)</option>
                                            <option value="check"> Check / Reveal (BiCheck)</option>
                                            <option value="diamond">Diamond / Luxury (BiDiamond)</option>
                                            <option value="star"> Star / Award (BiStar)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Step Title *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Initial Consultation"
                                        value={processForm.title}
                                        onChange={(e) => setProcessForm({ ...processForm, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Step Description *</label>
                                    <textarea
                                        rows="3"
                                        placeholder="e.g. We listen to your ideas, needs and vision."
                                        value={processForm.description}
                                        onChange={(e) => setProcessForm({ ...processForm, description: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Display Order</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={processForm.order}
                                        onChange={(e) => setProcessForm({ ...processForm, order: parseInt(e.target.value) || 1 })}
                                    />
                                </div>

                                <div className="modal-actions-luxury">
                                    <button type="button" className="btn-cancel-modal" onClick={() => setProcessModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-modal">{editingProcess ? 'SAVE CHANGES' : 'CREATE STEP'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* ── MODAL: ADD / EDIT WHY CHOOSE US FEATURE ── */}
            {
                whyFeatureModalOpen && (
                    <div className="modal-overlay-luxury">
                        <div className="modal-box-luxury" style={{ maxWidth: '560px' }}>
                            <div className="modal-header-luxury">
                                <h3>{editingWhyFeature ? 'Edit Feature' : ' Add New Feature Card'}</h3>
                                <button className="btn-close-modal" onClick={() => setWhyFeatureModalOpen(false)}>×</button>
                            </div>
                            <form onSubmit={handleSaveWhyFeature} className="modal-form-luxury">
                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Feature Title *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Creative Solutions"
                                            value={whyFeatureForm.title}
                                            onChange={(e) => setWhyFeatureForm({ ...whyFeatureForm, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Icon Type</label>
                                        <select
                                            value={whyFeatureForm.iconName}
                                            onChange={(e) => setWhyFeatureForm({ ...whyFeatureForm, iconName: e.target.value })}
                                        >
                                            <option value="diamond">Diamond / Creative (BiDiamond)</option>
                                            <option value="star"> Star / Expert (BiStar)</option>
                                            <option value="badge">Badge / Quality Assurance (BiBadgeCheck)</option>
                                            <option value="time"> Time / On-Time Delivery (BiTimeFive)</option>
                                            <option value="bulb">Bulb / Concept (BiBulb)</option>
                                            <option value="check"> Check / Verify (BiCheck)</option>
                                            <option value="cog">Cog / Solution (BiCog)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Feature Description *</label>
                                    <textarea
                                        rows="3"
                                        placeholder="e.g. Unique designs tailored to your needs."
                                        value={whyFeatureForm.description}
                                        onChange={(e) => setWhyFeatureForm({ ...whyFeatureForm, description: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Display Order</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={whyFeatureForm.order}
                                        onChange={(e) => setWhyFeatureForm({ ...whyFeatureForm, order: parseInt(e.target.value) || 1 })}
                                    />
                                </div>

                                <div className="modal-actions-luxury">
                                    <button type="button" className="btn-cancel-modal" onClick={() => setWhyFeatureModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-modal">{editingWhyFeature ? 'SAVE CHANGES' : 'CREATE FEATURE'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* ── MODAL: EMAIL REPLY FORM ── */}
            {
                replyModalOpen && selectedMsgForReply && (
                    <div className="modal-overlay-luxury">
                        <div className="modal-box-luxury">
                            <div className="modal-header-luxury">
                                <h3>Send Email Reply to Client</h3>
                                <button className="btn-close-modal" onClick={() => setReplyModalOpen(false)}>×</button>
                            </div>
                            <form onSubmit={handleSendEmailReply} className="modal-form-luxury">
                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Recipient Email</label>
                                        <input type="text" value={selectedMsgForReply.email} disabled className="readonly-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>Client Name</label>
                                        <input type="text" value={selectedMsgForReply.fullName || selectedMsgForReply.name || 'Valued Client'} disabled className="readonly-input" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Email Subject *</label>
                                    <input
                                        type="text"
                                        required
                                        value={replyForm.replySubject}
                                        onChange={(e) => setReplyForm({ ...replyForm, replySubject: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Message Content *</label>
                                    <textarea
                                        rows="7"
                                        required
                                        value={replyForm.replyMessage}
                                        onChange={(e) => setReplyForm({ ...replyForm, replyMessage: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="modal-actions-luxury">
                                    <button type="button" className="btn-cancel-modal" onClick={() => setReplyModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-modal" disabled={sendingReply}>
                                        {sendingReply ? 'Sending Email...' : 'Send Email Reply'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* ── MODAL: GALLERY HERO FORM ── */}
            {
                galleryHeroModalOpen && (
                    <div className="modal-overlay-luxury">
                        <div className="modal-box-luxury">
                            <div className="modal-header-luxury">
                                <h3>Edit Galleries Page Hero Section</h3>
                                <button className="btn-close-modal" onClick={() => setGalleryHeroModalOpen(false)}><TbX /></button>
                            </div>
                            <form onSubmit={handleSaveGalleryHero} className="modal-form-luxury">
                                <div className="form-group">
                                    <label>Kicker Tagline</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. OUR GALLERY"
                                        value={galleryHeroForm.kicker}
                                        onChange={(e) => setGalleryHeroForm({ ...galleryHeroForm, kicker: e.target.value })}
                                    />
                                </div>

                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Main Title (First Line)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. A Collection of"
                                            value={galleryHeroForm.title}
                                            onChange={(e) => setGalleryHeroForm({ ...galleryHeroForm, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Gold Highlighted Title (Second Line)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Beautiful Spaces"
                                            value={galleryHeroForm.highlightTitle}
                                            onChange={(e) => setGalleryHeroForm({ ...galleryHeroForm, highlightTitle: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Subtitle Description</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Explore our gallery of stunning interior designs..."
                                        value={galleryHeroForm.subtitle}
                                        onChange={(e) => setGalleryHeroForm({ ...galleryHeroForm, subtitle: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Hero Background Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageFileUpload(e, (base64) => setGalleryHeroForm({ ...galleryHeroForm, heroBg: base64 }))}
                                    />
                                    <span className="or-text">OR Image URL (leave empty for default background):</span>
                                    <input
                                        type="text"
                                        placeholder="https://..."
                                        value={galleryHeroForm.heroBg}
                                        onChange={(e) => setGalleryHeroForm({ ...galleryHeroForm, heroBg: e.target.value })}
                                    />
                                    {galleryHeroForm.heroBg && (
                                        <div className="img-preview-box">
                                            <img src={galleryHeroForm.heroBg} alt="Hero Background Preview" />
                                        </div>
                                    )}
                                </div>

                                <div className="modal-actions-luxury">
                                    <button type="button" className="btn-cancel-modal" onClick={() => setGalleryHeroModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-modal">SAVE HERO SETTINGS</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* ── MODAL: GALLERY ITEM FORM ── */}
            {
                galleryItemModalOpen && (
                    <div className="modal-overlay-luxury">
                        <div className="modal-box-luxury">
                            <div className="modal-header-luxury">
                                <h3>{editingGalleryItem ? 'Edit Gallery Item' : 'Add New Gallery Item'}</h3>
                                <button className="btn-close-modal" onClick={() => setGalleryItemModalOpen(false)}><TbX /></button>
                            </div>
                            <form onSubmit={handleSaveGalleryItem} className="modal-form-luxury">
                                <div className="form-group">
                                    <label>Title / Name (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Modern Minimalist Living Room"
                                        value={galleryItemForm.title}
                                        onChange={(e) => setGalleryItemForm({ ...galleryItemForm, title: e.target.value })}
                                    />
                                </div>

                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Category / Room Type *</label>
                                        <select
                                            value={galleryItemForm.type}
                                            onChange={(e) => setGalleryItemForm({ ...galleryItemForm, type: e.target.value })}
                                        >
                                            <option value="living">LIVING ROOM</option>
                                            <option value="kitchen">KITCHEN</option>
                                            <option value="bedroom">BEDROOM</option>
                                            <option value="dining">DINING ROOM</option>
                                            <option value="bathroom">BATHROOM</option>
                                            <option value="commercial">COMMERCIAL</option>
                                            <option value="outdoor">OUTDOOR</option>
                                            <option value="other">OTHER</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Collage Grid Layout Shape</label>
                                        <select
                                            value={galleryItemForm.shape}
                                            onChange={(e) => setGalleryItemForm({ ...galleryItemForm, shape: e.target.value })}
                                        >
                                            <option value="standard">Standard (Square)</option>
                                            <option value="tall">Tall (Vertical)</option>
                                            <option value="wide">Wide (Horizontal)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Image File / Upload *</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageFileUpload(e, (base64) => setGalleryItemForm({ ...galleryItemForm, src: base64 }))}
                                    />
                                    <span className="or-text">OR Image URL *</span>
                                    <input
                                        type="text"
                                        placeholder="https://images.unsplash.com/..."
                                        value={galleryItemForm.src}
                                        onChange={(e) => setGalleryItemForm({ ...galleryItemForm, src: e.target.value })}
                                    />
                                    {galleryItemForm.src && (
                                        <div className="img-preview-box">
                                            <img src={galleryItemForm.src} alt="Gallery Preview" />
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Display Order Number</label>
                                    <input
                                        type="number"
                                        value={galleryItemForm.order}
                                        onChange={(e) => setGalleryItemForm({ ...galleryItemForm, order: e.target.value })}
                                    />
                                </div>

                                <div className="modal-actions-luxury">
                                    <button type="button" className="btn-cancel-modal" onClick={() => setGalleryItemModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-modal">SAVE GALLERY ITEM</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* ── MODAL: CONTACT HERO ── */}
            {
                contactHeroModalOpen && (
                    <div className="modal-overlay-luxury">
                        <div className="modal-box-luxury">
                            <div className="modal-header-luxury">
                                <h3>Edit Contact Page Hero</h3>
                                <button className="btn-close-modal" onClick={() => setContactHeroModalOpen(false)}><TbX /></button>
                            </div>
                            <form onSubmit={handleSaveContactHero} className="modal-form-luxury">
                                <div className="form-group">
                                    <label>Kicker Text</label>
                                    <input type="text" placeholder="e.g. GET IN TOUCH" value={contactHeroForm.kicker} onChange={(e) => setContactHeroForm({ ...contactHeroForm, kicker: e.target.value })} />
                                </div>
                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Main Title</label>
                                        <input type="text" placeholder="e.g. Let's Design a Space" value={contactHeroForm.title} onChange={(e) => setContactHeroForm({ ...contactHeroForm, title: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Gold Highlight Text</label>
                                        <input type="text" placeholder="e.g. You'll Love." value={contactHeroForm.highlightText} onChange={(e) => setContactHeroForm({ ...contactHeroForm, highlightText: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Subtitle</label>
                                    <textarea rows="3" value={contactHeroForm.subtitle} onChange={(e) => setContactHeroForm({ ...contactHeroForm, subtitle: e.target.value })}></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Hero Background Image</label>
                                    <input type="file" accept="image/*" onChange={(e) => handleImageFileUpload(e, (b64) => setContactHeroForm({ ...contactHeroForm, heroBg: b64 }))} />
                                    <span className="or-text">OR Image URL:</span>
                                    <input type="text" placeholder="https://..." value={contactHeroForm.heroBg} onChange={(e) => setContactHeroForm({ ...contactHeroForm, heroBg: e.target.value })} />
                                    {contactHeroForm.heroBg && <div className="img-preview-box"><img src={contactHeroForm.heroBg} alt="Hero Preview" /></div>}
                                </div>
                                <div className="modal-actions-luxury">
                                    <button type="button" className="btn-cancel-modal" onClick={() => setContactHeroModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-modal">SAVE HERO</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* ── MODAL: CONTACT INFO ── */}
            {
                contactInfoModalOpen && (
                    <div className="modal-overlay-luxury">
                        <div className="modal-box-luxury">
                            <div className="modal-header-luxury">
                                <h3>Edit Contact Information</h3>
                                <button className="btn-close-modal" onClick={() => setContactInfoModalOpen(false)}><TbX /></button>
                            </div>
                            <form onSubmit={handleSaveContactInfo} className="modal-form-luxury">
                                <div className="form-group">
                                    <label>Studio Address</label>
                                    <input type="text" placeholder="123 Design Street, Colombo 05, Sri Lanka" value={contactInfoForm.address} onChange={(e) => setContactInfoForm({ ...contactInfoForm, address: e.target.value })} />
                                </div>
                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Phone 1 (Primary)</label>
                                        <input type="text" placeholder="+94 77 123 4567" value={contactInfoForm.phone1} onChange={(e) => setContactInfoForm({ ...contactInfoForm, phone1: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone 2 (Optional)</label>
                                        <input type="text" placeholder="+94 11 234 5678" value={contactInfoForm.phone2} onChange={(e) => setContactInfoForm({ ...contactInfoForm, phone2: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Email 1 (Primary)</label>
                                        <input type="email" placeholder="hello@goodinterior.lk" value={contactInfoForm.email1} onChange={(e) => setContactInfoForm({ ...contactInfoForm, email1: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Email 2 (Optional)</label>
                                        <input type="email" placeholder="info@goodinterior.lk" value={contactInfoForm.email2} onChange={(e) => setContactInfoForm({ ...contactInfoForm, email2: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Weekday Hours (Mon–Fri)</label>
                                        <input type="text" placeholder="9:00 AM - 6:00 PM" value={contactInfoForm.hoursWeekday} onChange={(e) => setContactInfoForm({ ...contactInfoForm, hoursWeekday: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Saturday Hours</label>
                                        <input type="text" placeholder="10:00 AM - 2:00 PM" value={contactInfoForm.hoursSaturday} onChange={(e) => setContactInfoForm({ ...contactInfoForm, hoursSaturday: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Sunday / Holiday Hours</label>
                                    <input type="text" placeholder="Closed" value={contactInfoForm.hoursSunday} onChange={(e) => setContactInfoForm({ ...contactInfoForm, hoursSunday: e.target.value })} />
                                </div>
                                <div className="modal-actions-luxury">
                                    <button type="button" className="btn-cancel-modal" onClick={() => setContactInfoModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-modal">SAVE CONTACT INFO</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* ── MODAL: MAP LOCATION ── */}
            {
                contactMapModalOpen && (
                    <div className="modal-overlay-luxury">
                        <div className="modal-box-luxury">
                            <div className="modal-header-luxury">
                                <h3>Edit Map Location</h3>
                                <button className="btn-close-modal" onClick={() => setContactMapModalOpen(false)}><TbX /></button>
                            </div>
                            <form onSubmit={handleSaveContactMap} className="modal-form-luxury">
                                {/* Interactive Map Picker */}
                                <InteractiveMapPicker
                                    lat={contactMapForm.latitude}
                                    lng={contactMapForm.longitude}
                                    onLocationSelect={(newLat, newLng) => setContactMapForm(prev => ({ ...prev, latitude: newLat, longitude: newLng }))}
                                />

                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Latitude * (Auto-filled on map click)</label>
                                        <input type="number" step="any" required placeholder="e.g. 6.8921" value={contactMapForm.latitude} onChange={(e) => setContactMapForm({ ...contactMapForm, latitude: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Longitude * (Auto-filled on map click)</label>
                                        <input type="number" step="any" required placeholder="e.g. 79.8612" value={contactMapForm.longitude} onChange={(e) => setContactMapForm({ ...contactMapForm, longitude: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Location Label (shown as chip on map)</label>
                                    <input type="text" placeholder="e.g. Good Interior Design Studio" value={contactMapForm.label} onChange={(e) => setContactMapForm({ ...contactMapForm, label: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Location Address (shown in chip)</label>
                                    <input type="text" placeholder="e.g. 123 Design Street, Colombo 05" value={contactMapForm.address} onChange={(e) => setContactMapForm({ ...contactMapForm, address: e.target.value })} />
                                </div>
                                {(contactMapForm.latitude && contactMapForm.longitude) && (
                                    <div style={{ marginTop: '8px' }}>
                                        <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>FRONTEND WEBSITE PREVIEW:</span>
                                        <div style={{ borderRadius: '8px', overflow: 'hidden', height: '160px' }}>
                                            <iframe
                                                title="Map Preview"
                                                src={`https://www.google.com/maps?q=${contactMapForm.latitude},${contactMapForm.longitude}&z=15&output=embed`}
                                                width="100%" height="100%" style={{ border: 0 }} loading="lazy"
                                            ></iframe>
                                        </div>
                                    </div>
                                )}
                                <div className="modal-actions-luxury">
                                    <button type="button" className="btn-cancel-modal" onClick={() => setContactMapModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-modal">SAVE MAP LOCATION</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
            {/* ── MODAL: FOLLOW OUR JOURNEY ── */}
            {
                contactJourneyModalOpen && (
                    <div className="modal-overlay-luxury">
                        <div className="modal-box-luxury" style={{ maxWidth: '680px' }}>
                            <div className="modal-header-luxury">
                                <h3>Edit Follow Our Journey Section</h3>
                                <button className="btn-close-modal" onClick={() => setContactJourneyModalOpen(false)}><TbX /></button>
                            </div>
                            <form onSubmit={handleSaveContactJourney} className="modal-form-luxury">
                                <div className="form-group">
                                    <label>Section Title</label>
                                    <input type="text" placeholder="FOLLOW OUR JOURNEY" value={contactJourneyForm.title} onChange={(e) => setContactJourneyForm({ ...contactJourneyForm, title: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Section Description</label>
                                    <textarea rows="2" placeholder="Get inspired by our latest projects, behind-the-scenes and design tips." value={contactJourneyForm.description} onChange={(e) => setContactJourneyForm({ ...contactJourneyForm, description: e.target.value })}></textarea>
                                </div>

                                <div style={{ margin: '15px 0 10px 0', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                                    <h4 style={{ color: '#d4af37', fontSize: '0.9rem', margin: '0 0 10px 0' }}>Social Media Links (Optional)</h4>
                                    <div className="form-row-2col">
                                        <div className="form-group">
                                            <label>Facebook URL</label>
                                            <input type="text" placeholder="https://facebook.com/yourpage" value={contactJourneyForm.facebook} onChange={(e) => setContactJourneyForm({ ...contactJourneyForm, facebook: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Instagram URL</label>
                                            <input type="text" placeholder="https://instagram.com/yourpage" value={contactJourneyForm.instagram} onChange={(e) => setContactJourneyForm({ ...contactJourneyForm, instagram: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-row-2col">
                                        <div className="form-group">
                                            <label>Pinterest URL</label>
                                            <input type="text" placeholder="https://pinterest.com/yourpage" value={contactJourneyForm.pinterest} onChange={(e) => setContactJourneyForm({ ...contactJourneyForm, pinterest: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>LinkedIn URL</label>
                                            <input type="text" placeholder="https://linkedin.com/in/yourprofile" value={contactJourneyForm.linkedin} onChange={(e) => setContactJourneyForm({ ...contactJourneyForm, linkedin: e.target.value })} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ margin: '15px 0 10px 0', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                                    <h4 style={{ color: '#d4af37', fontSize: '0.9rem', margin: '0 0 10px 0' }}>Journey Grid Images (4 Images - Optional)</h4>
                                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '12px' }}>Upload custom images or leave empty to automatically display portfolio gallery items.</span>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        {[1, 2, 3, 4].map((num) => {
                                            const key = `img${num}`;
                                            return (
                                                <div key={num} className="form-group" style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                    <label style={{ fontSize: '0.8rem', color: '#e2e8f0', marginBottom: '6px', display: 'block' }}>Image Slot {num}</label>
                                                    <input type="file" accept="image/*" onChange={(e) => handleImageFileUpload(e, (b64) => setContactJourneyForm(prev => ({ ...prev, [key]: b64 })))} />
                                                    <input type="text" placeholder="OR Image URL..." value={contactJourneyForm[key]} onChange={(e) => setContactJourneyForm({ ...contactJourneyForm, [key]: e.target.value })} style={{ marginTop: '6px' }} />
                                                    {contactJourneyForm[key] && (
                                                        <div style={{ marginTop: '8px', height: '70px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                            <img src={contactJourneyForm[key]} alt={`Preview ${num}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="modal-actions-luxury">
                                    <button type="button" className="btn-cancel-modal" onClick={() => setContactJourneyModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-modal">SAVE JOURNEY SECTION</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* ── MODAL: CONTACT FEATURE ── */}
            {
                contactFeatureModalOpen && (
                    <div className="modal-overlay-luxury">
                        <div className="modal-box-luxury" style={{ maxWidth: '500px' }}>
                            <div className="modal-header-luxury">
                                <h3>{editingContactFeature ? 'Edit Feature' : 'Add Feature'}</h3>
                                <button className="btn-close-modal" onClick={() => setContactFeatureModalOpen(false)}><TbX /></button>
                            </div>
                            <form onSubmit={handleSaveContactFeature} className="modal-form-luxury">
                                <div className="form-group">
                                    <label>Title *</label>
                                    <input type="text" required placeholder="e.g. Personalized Approach" value={contactFeatureForm.title} onChange={(e) => setContactFeatureForm({ ...contactFeatureForm, title: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea rows="2" placeholder="Brief description of this feature..." value={contactFeatureForm.description} onChange={(e) => setContactFeatureForm({ ...contactFeatureForm, description: e.target.value })}></textarea>
                                </div>
                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Icon Name</label>
                                        <select value={contactFeatureForm.iconName} onChange={(e) => setContactFeatureForm({ ...contactFeatureForm, iconName: e.target.value })}>
                                            <option value="home">Home / House</option>
                                            <option value="team">Team / People</option>
                                            <option value="quality">Quality / Shield</option>
                                            <option value="clock">Clock / Time</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Order</label>
                                        <input type="number" min="1" value={contactFeatureForm.order} onChange={(e) => setContactFeatureForm({ ...contactFeatureForm, order: parseInt(e.target.value) || 1 })} />
                                    </div>
                                </div>
                                <div className="modal-actions-luxury">
                                    <button type="button" className="btn-cancel-modal" onClick={() => setContactFeatureModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-modal">SAVE FEATURE</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* ── MODAL: GLOBAL BRANDING SETTINGS ── */}
            {
                globalSettingsModalOpen && (
                    <div className="modal-overlay-luxury">
                        <div className="modal-box-luxury" style={{ maxWidth: '600px' }}>
                            <div className="modal-header-luxury">
                                <h3>Global Site Branding (Header / Footer)</h3>
                                <button className="btn-close-modal" onClick={() => setGlobalSettingsModalOpen(false)}><TbX /></button>
                            </div>
                            <form onSubmit={handleSaveGlobalSettings} className="modal-form-luxury">
                                <div className="form-group">
                                    <label>Site Logo Image</label>
                                    {/* Current Logo Preview */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px', background: '#0f172a', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '1px dashed rgba(255,255,255,0.15)' }}>
                                            {globalSettingsForm.logoUrl ? (
                                                <img src={globalSettingsForm.logoUrl} alt="Logo Preview" style={{ maxWidth: '54px', maxHeight: '54px', objectFit: 'contain' }} />
                                            ) : (
                                                <img src={logo} alt="Default Logo" style={{ maxWidth: '54px', maxHeight: '54px', objectFit: 'contain', opacity: 0.6 }} />
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginBottom: '4px' }}>
                                                {globalSettingsForm.logoUrl ? 'Custom logo uploaded' : 'Using default SVG logo'}
                                            </div>
                                            <label
                                                htmlFor="logo-file-input"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #b38058, #9c6c47)', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', letterSpacing: '0.5px' }}
                                            >
                                                <TbPhoto /> Choose Logo Image
                                            </label>
                                            <input
                                                id="logo-file-input"
                                                type="file"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (!file) return;
                                                    compressImage(file).then(base64 => {
                                                        setGlobalSettingsForm(prev => ({ ...prev, logoUrl: base64 }));
                                                    });
                                                }}
                                            />
                                        </div>
                                        {globalSettingsForm.logoUrl && (
                                            <button
                                                type="button"
                                                onClick={() => setGlobalSettingsForm(prev => ({ ...prev, logoUrl: '' }))}
                                                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', whiteSpace: 'nowrap' }}
                                            >
                                                Reset to Default
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Site Title (e.g. GOOD INTERIOR)</label>
                                        <input type="text" required value={globalSettingsForm.siteTitle} onChange={(e) => setGlobalSettingsForm({ ...globalSettingsForm, siteTitle: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Site Subtitle (e.g. DESIGN STUDIO)</label>
                                        <input type="text" value={globalSettingsForm.siteSubtitle} onChange={(e) => setGlobalSettingsForm({ ...globalSettingsForm, siteSubtitle: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Footer Description (Line breaks allowed)</label>
                                    <textarea rows="3" required value={globalSettingsForm.footerDesc} onChange={(e) => setGlobalSettingsForm({ ...globalSettingsForm, footerDesc: e.target.value })}></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Footer Copyright Text</label>
                                    <input type="text" required value={globalSettingsForm.footerCopyright} onChange={(e) => setGlobalSettingsForm({ ...globalSettingsForm, footerCopyright: e.target.value })} />
                                </div>
                                <div className="modal-actions-luxury">
                                    <button type="button" className="btn-cancel-modal" onClick={() => setGlobalSettingsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-modal">SAVE BRANDING</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* ── MODAL: BLOG POST FORM ── */}
            {
                blogPostModalOpen && (
                    <div className="modal-overlay-luxury">
                        <div className="modal-box-luxury" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div className="modal-header-luxury">
                                <h3>{editingBlogPost ? 'Edit Blog Article' : 'Create New Blog Article'}</h3>
                                <button className="btn-close-modal" onClick={() => setBlogPostModalOpen(false)}><TbX /></button>
                            </div>
                            <form onSubmit={handleSaveBlogPost} className="modal-form-luxury">
                                <div className="form-group">
                                    <label>Article Title *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Top Interior Design Trends 2025 That Will Transform Your Space"
                                        value={blogPostForm.title}
                                        onChange={(e) => setBlogPostForm({ ...blogPostForm, title: e.target.value })}
                                    />
                                </div>

                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Category Badge *</label>
                                        <select
                                            value={blogPostForm.badge}
                                            onChange={(e) => setBlogPostForm({ ...blogPostForm, badge: e.target.value })}
                                        >
                                            <option value="INTERIOR TRENDS">INTERIOR TRENDS</option>
                                            <option value="DESIGN TIPS">DESIGN TIPS</option>
                                            <option value="ROOM IDEAS">ROOM IDEAS</option>
                                            <option value="MATERIALS">MATERIALS</option>
                                            <option value="LIGHTING">LIGHTING</option>
                                            <option value="HOME IMPROVEMENT">HOME IMPROVEMENT</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Read Time</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 5 MIN READ"
                                            value={blogPostForm.readTime}
                                            onChange={(e) => setBlogPostForm({ ...blogPostForm, readTime: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Cover Main Image *</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageFileUpload(e, (b64) => setBlogPostForm({ ...blogPostForm, img: b64 }))}
                                    />
                                    <span className="or-text">OR Image URL *</span>
                                    <input
                                        type="text"
                                        placeholder="https://images.unsplash.com/..."
                                        value={blogPostForm.img}
                                        onChange={(e) => setBlogPostForm({ ...blogPostForm, img: e.target.value })}
                                    />
                                    {blogPostForm.img && (
                                        <div className="img-preview-box" style={{ height: '140px', marginTop: '8px' }}>
                                            <img src={blogPostForm.img} alt="Article Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Short Excerpt Description *</label>
                                    <textarea
                                        rows="2"
                                        required
                                        placeholder="Brief introduction displayed on article cards..."
                                        value={blogPostForm.desc}
                                        onChange={(e) => setBlogPostForm({ ...blogPostForm, desc: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Full Article Content (Paragraphs & Headings)</label>
                                    <textarea
                                        rows="6"
                                        placeholder="Use ## for section titles. Separate paragraphs with a blank line..."
                                        value={blogPostForm.content}
                                        onChange={(e) => setBlogPostForm({ ...blogPostForm, content: e.target.value })}
                                    />
                                </div>

                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px', marginTop: '14px' }}>
                                    <h4 style={{ color: '#c48b59', fontSize: '0.9rem', marginBottom: '10px' }}>Author Details</h4>
                                    <div className="form-row-2col">
                                        <div className="form-group">
                                            <label>Author Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Sarah Thompson"
                                                value={blogPostForm.author}
                                                onChange={(e) => setBlogPostForm({ ...blogPostForm, author: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Author Role</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Interior Designer"
                                                value={blogPostForm.authorRole}
                                                onChange={(e) => setBlogPostForm({ ...blogPostForm, authorRole: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Author Avatar Image</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageFileUpload(e, (b64) => setBlogPostForm({ ...blogPostForm, authorImg: b64 }))}
                                        />
                                        <span className="or-text">OR Image URL:</span>
                                        <input
                                            type="text"
                                            placeholder="https://..."
                                            value={blogPostForm.authorImg}
                                            onChange={(e) => setBlogPostForm({ ...blogPostForm, authorImg: e.target.value })}
                                        />
                                        {blogPostForm.authorImg && (
                                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #c48b59', flexShrink: 0 }}>
                                                    <img src={blogPostForm.authorImg} alt="Author Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Author Avatar Preview</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label>Author Bio</label>
                                        <textarea
                                            rows="2"
                                            placeholder="Short author bio for article sidebar..."
                                            value={blogPostForm.authorBio}
                                            onChange={(e) => setBlogPostForm({ ...blogPostForm, authorBio: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Tags (Comma-separated)</label>
                                    <input
                                        type="text"
                                        placeholder="Interior Trends, Modern Home, Luxury, Decor"
                                        value={blogPostForm.tags}
                                        onChange={(e) => setBlogPostForm({ ...blogPostForm, tags: e.target.value })}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '20px', margin: '15px 0' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={blogPostForm.isFeatured}
                                            onChange={(e) => setBlogPostForm({ ...blogPostForm, isFeatured: e.target.checked })}
                                        />
                                        Set as Main Featured Article (Top Card)
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={blogPostForm.isPopular}
                                            onChange={(e) => setBlogPostForm({ ...blogPostForm, isPopular: e.target.checked })}
                                        />
                                        <TbTrendingUp style={{ fontSize: '14px', color: '#c48b59' }} /> Show in Popular Posts Sidebar
                                    </label>
                                </div>

                                <div className="modal-actions-luxury">
                                    <button type="button" className="btn-cancel-modal" onClick={() => setBlogPostModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-modal">SAVE ARTICLE</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* ── MODAL: BLOG HERO FORM ── */}
            {
                blogHeroModalOpen && (
                    <div className="modal-overlay-luxury">
                        <div className="modal-box-luxury">
                            <div className="modal-header-luxury">
                                <h3>Edit Blog Page Hero Section</h3>
                                <button className="btn-close-modal" onClick={() => setBlogHeroModalOpen(false)}><TbX /></button>
                            </div>
                            <form onSubmit={handleSaveBlogHero} className="modal-form-luxury">
                                <div className="form-group">
                                    <label>Kicker Tagline</label>
                                    <input
                                        type="text"
                                        placeholder="OUR BLOG"
                                        value={blogHeroForm.kicker}
                                        onChange={(e) => setBlogHeroForm({ ...blogHeroForm, kicker: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Main Title</label>
                                    <input
                                        type="text"
                                        placeholder="Ideas, Inspiration & Interior Tips"
                                        value={blogHeroForm.title}
                                        onChange={(e) => setBlogHeroForm({ ...blogHeroForm, title: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Subtitle Description</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Explore expert advice, design trends, and creative ideas..."
                                        value={blogHeroForm.subtitle}
                                        onChange={(e) => setBlogHeroForm({ ...blogHeroForm, subtitle: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Background Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageFileUpload(e, (b64) => setBlogHeroForm({ ...blogHeroForm, bgImage: b64 }))}
                                    />
                                    <span className="or-text">OR Image URL:</span>
                                    <input
                                        type="text"
                                        placeholder="https://..."
                                        value={blogHeroForm.bgImage}
                                        onChange={(e) => setBlogHeroForm({ ...blogHeroForm, bgImage: e.target.value })}
                                    />
                                    {blogHeroForm.bgImage && (
                                        <div className="img-preview-box" style={{ height: '120px', marginTop: '8px' }}>
                                            <img src={blogHeroForm.bgImage} alt="Hero Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                                        </div>
                                    )}
                                </div>

                                <div className="modal-actions-luxury">
                                    <button type="button" className="btn-cancel-modal" onClick={() => setBlogHeroModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-modal">SAVE HERO SECTION</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
            {/* ── MODAL: TESTIMONIAL FORM ── */}
            {
                testiModalOpen && (
                    <div className="modal-overlay-luxury">
                        <div className="modal-box-luxury">
                            <div className="modal-header-luxury">
                                <h3>{editingTesti ? 'Edit Client Review' : 'Add New Review'}</h3>
                                <button className="btn-close-modal" onClick={() => setTestiModalOpen(false)}><TbX /></button>
                            </div>
                            <form onSubmit={handleSaveTesti} className="modal-form-luxury">
                                <div className="form-group">
                                    <label>Client Name *</label>
                                    <input type="text" required value={testiForm.name} onChange={(e) => setTestiForm({ ...testiForm, name: e.target.value })} />
                                </div>
                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Role / Location</label>
                                        <input type="text" placeholder="e.g. Homeowner • Colombo" value={testiForm.role} onChange={(e) => setTestiForm({ ...testiForm, role: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Category (Badge)</label>
                                        <select value={testiForm.category} onChange={(e) => setTestiForm({ ...testiForm, category: e.target.value })}>
                                            <option value="RESIDENTIAL">RESIDENTIAL</option>
                                            <option value="COMMERCIAL">COMMERCIAL</option>
                                            <option value="KITCHEN">KITCHEN</option>
                                            <option value="BEDROOM">BEDROOM</option>
                                            <option value="LIVING & DINING">LIVING & DINING</option>
                                            <option value="RENOVATION">RENOVATION</option>
                                            <option value="OTHER">OTHER</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Review Comment *</label>
                                    <textarea rows="3" required value={testiForm.quote} onChange={(e) => setTestiForm({ ...testiForm, quote: e.target.value })} />
                                </div>
                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Stars Rating (1-5)</label>
                                        <input type="number" min="1" max="5" value={testiForm.stars} onChange={(e) => setTestiForm({ ...testiForm, stars: Number(e.target.value) })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Avatar URL (Optional)</label>
                                        <input type="text" value={testiForm.avatar} onChange={(e) => setTestiForm({ ...testiForm, avatar: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Project Image URL *</label>
                                    <input type="text" value={testiForm.image} onChange={(e) => setTestiForm({ ...testiForm, image: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '10px' }}>
                                        <input type="checkbox" checked={testiForm.isApproved !== false} onChange={(e) => setTestiForm({ ...testiForm, isApproved: e.target.checked })} style={{ width: '16px', height: '16px' }} />
                                        <span>Approved (Visible on public testimonials page)</span>
                                    </label>
                                </div>
                                <div className="modal-actions-luxury">
                                    <button type="button" className="btn-cancel-modal" onClick={() => setTestiModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-modal">SAVE REVIEW</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* ── MODAL: TESTIMONIAL HERO FORM ── */}
            {
                testiHeroModalOpen && (
                    <div className="modal-overlay-luxury">
                        <div className="modal-box-luxury">
                            <div className="modal-header-luxury">
                                <h3>Edit Testimonials Hero Summary</h3>
                                <button className="btn-close-modal" onClick={() => setTestiHeroModalOpen(false)}><TbX /></button>
                            </div>
                            <form onSubmit={handleSaveTestiHero} className="modal-form-luxury">
                                <div className="form-group">
                                    <label>Kicker Tagline</label>
                                    <input type="text" value={testiHeroForm.kicker || ''} onChange={(e) => setTestiHeroForm({ ...testiHeroForm, kicker: e.target.value })} />
                                </div>
                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Main Title (First Line)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Trusted By Clients."
                                            value={testiHeroForm.titleLine1 || ''}
                                            onChange={(e) => setTestiHeroForm({ ...testiHeroForm, titleLine1: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Gold Highlighted Word (Italic)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Loved"
                                            value={testiHeroForm.titleGold || ''}
                                            onChange={(e) => setTestiHeroForm({ ...testiHeroForm, titleGold: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Main Title (Second Line)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. For Our Work."
                                        value={testiHeroForm.titleLine2 || ''}
                                        onChange={(e) => setTestiHeroForm({ ...testiHeroForm, titleLine2: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Subtitle Description (Use Enter for line breaks)</label>
                                    <textarea rows="3" value={testiHeroForm.subtitle || ''} onChange={(e) => setTestiHeroForm({ ...testiHeroForm, subtitle: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Hero Background Image Section</label>
                                    <input type="file" accept="image/*" onChange={(e) => handleImageFileUpload(e, (b64) => setTestiHeroForm({ ...testiHeroForm, bgImage: b64 }))} />
                                    <span className="or-text" style={{ marginTop: '5px' }}>OR Image URL (Leave empty for default pattern)</span>
                                    <input type="text" value={testiHeroForm.bgImage || ''} onChange={(e) => setTestiHeroForm({ ...testiHeroForm, bgImage: e.target.value })} />
                                    {testiHeroForm.bgImage && (
                                        <div className="img-preview-box" style={{ height: '120px', marginTop: '8px' }}>
                                            <img src={testiHeroForm.bgImage} alt="Hero Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                                        </div>
                                    )}
                                </div>
                                <div className="modal-actions-luxury">
                                    <button type="button" className="btn-cancel-modal" onClick={() => setTestiHeroModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-modal">SAVE HERO SECTION</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* ── MODAL: TESTIMONIAL QUOTE FORM ── */}
            {
                testiQuoteModalOpen && (
                    <div className="modal-overlay-luxury">
                        <div className="modal-box-luxury">
                            <div className="modal-header-luxury">
                                <h3>Edit Quote Banner</h3>
                                <button className="btn-close-modal" onClick={() => setTestiQuoteModalOpen(false)}><TbX /></button>
                            </div>
                            <form onSubmit={handleSaveTestiQuote} className="modal-form-luxury">
                                <div className="form-group">
                                    <label>Quote Text (Use Enter for line breaks)</label>
                                    <textarea rows="4" required value={testiQuoteForm.quoteText || ''} onChange={(e) => setTestiQuoteForm({ ...testiQuoteForm, quoteText: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Quote Author</label>
                                    <input type="text" required value={testiQuoteForm.quoteAuthor} onChange={(e) => setTestiQuoteForm({ ...testiQuoteForm, quoteAuthor: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Right Side Banner Image *</label>
                                    <input type="file" accept="image/*" onChange={(e) => handleImageFileUpload(e, (b64) => setTestiQuoteForm({ ...testiQuoteForm, quoteImage: b64 }))} />
                                    <span className="or-text" style={{ marginTop: '5px' }}>OR Image URL</span>
                                    <input type="text" value={testiQuoteForm.quoteImage || ''} onChange={(e) => setTestiQuoteForm({ ...testiQuoteForm, quoteImage: e.target.value })} />
                                    <div className="img-preview-box" style={{ height: '140px', marginTop: '10px' }}>
                                        <img src={testiQuoteForm.quoteImage || aboutImg} alt="Quote Prev" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                                    </div>
                                </div>
                                <div className="modal-actions-luxury">
                                    <button type="button" className="btn-cancel-modal" onClick={() => setTestiQuoteModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-modal">SAVE QUOTE BANNER</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* ── MODAL: TESTIMONIAL STATS FORM ── */}
            {
                testiStatsModalOpen && (
                    <div className="modal-overlay-luxury">
                        <div className="modal-box-luxury">
                            <div className="modal-header-luxury">
                                <h3>Edit Testimonials Stats</h3>
                                <button className="btn-close-modal" onClick={() => setTestiStatsModalOpen(false)}><TbX /></button>
                            </div>
                            <form onSubmit={handleSaveTestiStats} className="modal-form-luxury">
                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Average Rating</label>
                                        <input type="text" required value={testiStatsForm.statRating} onChange={(e) => setTestiStatsForm({ ...testiStatsForm, statRating: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Happy Clients</label>
                                        <input type="text" required value={testiStatsForm.statClients} onChange={(e) => setTestiStatsForm({ ...testiStatsForm, statClients: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Projects Completed</label>
                                        <input type="text" required value={testiStatsForm.statProjects} onChange={(e) => setTestiStatsForm({ ...testiStatsForm, statProjects: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Client Satisfaction</label>
                                        <input type="text" required value={testiStatsForm.statSatisfaction} onChange={(e) => setTestiStatsForm({ ...testiStatsForm, statSatisfaction: e.target.value })} />
                                    </div>
                                </div>
                                <div className="modal-actions-luxury">
                                    <button type="button" className="btn-cancel-modal" onClick={() => setTestiStatsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-modal">SAVE STATS</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* ── MODAL: ADD / EDIT USER ── */}
            {
                userModalOpen && (
                    <div className="modal-overlay-luxury">
                        <div className="modal-box-luxury">
                            <div className="modal-header-luxury">
                                <h3>{editingUser ? 'Edit User Account' : ' Add New User'}</h3>
                                <button className="btn-close-modal" onClick={() => setUserModalOpen(false)}><TbX /></button>
                            </div>
                            <form onSubmit={handleSaveUser} className="modal-form-luxury">
                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Full Name *</label>
                                        <input type="text" required value={userForm.fullName} onChange={e => setUserForm({ ...userForm, fullName: e.target.value })} placeholder="e.g. John Silva" />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address *</label>
                                        <input type="email" required value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} placeholder="e.g. john@example.com" />
                                    </div>
                                </div>
                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input type="text" value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} placeholder="e.g. +94 77 123 4567" />
                                    </div>
                                    <div className="form-group">
                                        <label>Country</label>
                                        <input type="text" value={userForm.country} onChange={e => setUserForm({ ...userForm, country: e.target.value })} placeholder="e.g. Sri Lanka" />
                                    </div>
                                </div>
                                <div className="form-row-2col">
                                    <div className="form-group">
                                        <label>Account Role</label>
                                        <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                                            <option value="user">Member (User)</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>{editingUser ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                                        <input
                                            type="password"
                                            required={!editingUser}
                                            value={userForm.password}
                                            onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                                            placeholder={editingUser ? 'Leave blank to keep unchanged' : 'Min 6 characters'}
                                        />
                                    </div>
                                </div>
                                {editingUser && (
                                    <div style={{ background: 'rgba(196,139,89,0.08)', border: '1px solid rgba(196,139,89,0.2)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <TbLock style={{ color: '#c48b59', flexShrink: 0 }} />
                                        Leave the password field empty to keep the user's current password unchanged.
                                    </div>
                                )}
                                <div className="modal-actions-luxury">
                                    <button type="button" className="btn-cancel-modal" onClick={() => setUserModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save-modal">{editingUser ? 'SAVE CHANGES' : 'CREATE USER'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Hero Live Preview Fullscreen Modal */}
            {
                livePreviewSlide && (
                    <div className="modal-overlay-luxury" style={{ zIndex: 100000, padding: '40px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="preview-modal-box" style={{
                            position: 'relative', width: '100%', maxWidth: '1280px', height: '100%', maxHeight: '800px',
                            background: '#0d1117', border: '1px solid rgba(196,139,89,0.3)', borderRadius: '16px',
                            boxShadow: '0 30px 80px rgba(0,0,0,0.8)', overflow: 'hidden', display: 'flex', flexDirection: 'column'
                        }}>
                            {/* Browser-like Toolbar */}
                            <div style={{ height: '48px', background: '#12151c', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56', cursor: 'pointer' }} onClick={() => setLivePreviewSlide(null)}></div>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
                                </div>
                                <div style={{ fontSize: '12px', color: '#c48b59', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>Live Hero Preview</div>
                                <button onClick={() => setLivePreviewSlide(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                            </div>

                            {/* Preview Content Area */}
                            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                                <div className="home-page" style={{ height: '100%' }}>
                                    <div className="hero-section" style={{ height: '100%', minHeight: 'unset', padding: 0, margin: 0 }}>
                                        <div
                                            className="hero-slide-bg active"
                                            style={{ backgroundImage: `url(${livePreviewSlide.image})` }}
                                        ></div>
                                        <div className="hero-overlay">
                                            <div className="hero-content-wrapper">
                                                {livePreviewSlide.kicker && <p className="hero-kicker">{livePreviewSlide.kicker}</p>}
                                                <h1 className="hero-main-title">
                                                    {livePreviewSlide.title ? livePreviewSlide.title.split(' ').map((word, i, arr) => (
                                                        i === arr.length - 1 ? <span key={i}>{word}</span> : word + ' '
                                                    )) : <span>Title</span>}
                                                </h1>
                                                {(livePreviewSlide.subtitle || livePreviewSlide.desc) && (
                                                    <p className="hero-description">
                                                        {livePreviewSlide.subtitle || livePreviewSlide.desc}
                                                    </p>
                                                )}
                                                <div className="hero-buttons">
                                                    <span className="btn-primary" style={{ cursor: 'pointer' }}>EXPLORE OUR WORK <FaArrowRight /></span>
                                                    <span className="btn-secondary" style={{ cursor: 'pointer' }}><FaPlayCircle className="btn-icon" /> BOOK A CONSULTATION</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Job Opening Add/Edit Modal */}
            {jobModalOpen && (
                <div className="modal-overlay-luxury">
                    <div className="modal-box-luxury" style={{ maxWidth: '650px' }}>
                        <div className="modal-header-luxury">
                            <h3>{editingJob ? 'Edit Job Opening' : 'Add New Job Opening'}</h3>
                            <button className="btn-close-modal" onClick={() => setJobModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSaveJob} className="modal-form-luxury">
                            <div className="form-row-2col">
                                <div className="form-group">
                                    <label>Job Title *</label>
                                    <input type="text" required value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} placeholder="e.g. Interior Designer" />
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <input type="text" value={jobForm.department} onChange={e => setJobForm({ ...jobForm, department: e.target.value })} placeholder="Design & Architecture" />
                                </div>
                            </div>
                            <div className="form-row-2col">
                                <div className="form-group">
                                    <label>Job Type</label>
                                    <input type="text" value={jobForm.type} onChange={e => setJobForm({ ...jobForm, type: e.target.value })} placeholder="Full-time" />
                                </div>
                                <div className="form-group">
                                    <label>Location</label>
                                    <input type="text" value={jobForm.location} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} placeholder="Colombo, Sri Lanka" />
                                </div>
                            </div>
                            <div className="form-row-2col">
                                <div className="form-group">
                                    <label>Experience Needed</label>
                                    <input type="text" value={jobForm.experience} onChange={e => setJobForm({ ...jobForm, experience: e.target.value })} placeholder="2 - 4 Years Experience" />
                                </div>
                                <div className="form-group">
                                    <label>Icon Style</label>
                                    <select value={jobForm.icon} onChange={e => setJobForm({ ...jobForm, icon: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}>
                                        <option value="design">Pencil / Designer</option>
                                        <option value="architecture">Architect / Building</option>
                                        <option value="3d">3D Box / Render</option>
                                        <option value="marketing">Speakerphone / Marketing</option>
                                        <option value="project">Settings / Project Manager</option>
                                        <option value="office">File Text / Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Role Overview</label>
                                <textarea rows="2" value={jobForm.overview} onChange={e => setJobForm({ ...jobForm, overview: e.target.value })} placeholder="Brief summary of the role..." />
                            </div>
                            <div className="form-group">
                                <label>Key Responsibilities (One item per line)</label>
                                <textarea rows="3" value={jobForm.responsibilities} onChange={e => setJobForm({ ...jobForm, responsibilities: e.target.value })} placeholder="Develop luxury interior concepts&#10;Create detailed presentation boards" />
                            </div>
                            <div className="form-group">
                                <label>Requirements & Qualifications (One item per line)</label>
                                <textarea rows="3" value={jobForm.requirements} onChange={e => setJobForm({ ...jobForm, requirements: e.target.value })} placeholder="Bachelor's Degree in Interior Design&#10;Proficiency in AutoCAD" />
                            </div>
                            <div className="form-group">
                                <label>What We Offer / Benefits (One item per line)</label>
                                <textarea rows="3" value={jobForm.benefits} onChange={e => setJobForm({ ...jobForm, benefits: e.target.value })} placeholder="Competitive salary package&#10;Professional growth opportunities" />
                            </div>
                            <div className="modal-actions-luxury">
                                <button type="button" className="btn-cancel-modal" onClick={() => setJobModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-save-modal">SAVE JOB POSITION</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Careers Hero Edit Modal */}
            {careersHeroModalOpen && (
                <div className="modal-overlay-luxury">
                    <div className="modal-box-luxury" style={{ maxWidth: '550px' }}>
                        <div className="modal-header-luxury">
                            <h3>Edit Careers Hero Header</h3>
                            <button className="btn-close-modal" onClick={() => setCareersHeroModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSaveCareersHero} className="modal-form-luxury">
                            <div className="form-group">
                                <label>Top Kicker Tag Text</label>
                                <input type="text" value={careersHeroForm.kicker} onChange={e => setCareersHeroForm({ ...careersHeroForm, kicker: e.target.value })} placeholder="JOIN OUR TEAM" />
                            </div>
                            <div className="form-group">
                                <label>Hero Main Title</label>
                                <input type="text" value={careersHeroForm.title} onChange={e => setCareersHeroForm({ ...careersHeroForm, title: e.target.value })} placeholder="Build Your Career in Interior Design" />
                            </div>
                            <div className="form-group">
                                <label>Hero Description Paragraph</label>
                                <textarea rows="3" value={careersHeroForm.description} onChange={e => setCareersHeroForm({ ...careersHeroForm, description: e.target.value })} placeholder="We're always looking for passionate..." />
                            </div>
                            <div className="form-group">
                                <label>Hero Background Image</label>
                                <input type="file" accept="image/*" onChange={(e) => handleImageFileUpload(e, (b64) => setCareersHeroForm({ ...careersHeroForm, bgImage: b64 }))} />
                                <span className="or-text" style={{ marginTop: '5px' }}>OR Image URL</span>
                                <input type="text" value={careersHeroForm.bgImage} onChange={e => setCareersHeroForm({ ...careersHeroForm, bgImage: e.target.value })} placeholder="Paste Image URL or Leave empty for default background" />

                                {/* Live Image Preview Box */}
                                <div style={{ marginTop: '12px', background: '#0b0d11', borderRadius: '10px', padding: '12px', border: '1px dashed rgba(212,175,55,0.3)' }}>
                                    <span style={{ fontSize: '0.72rem', color: '#c48b59', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                                        Live Image Preview
                                    </span>
                                    <div style={{ position: 'relative', width: '100%', height: '120px', borderRadius: '6px', overflow: 'hidden' }}>
                                        <img
                                            src={careersHeroForm.bgImage || careersHeroBg}
                                            alt="Hero Live Preview"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        {careersHeroForm.bgImage && (
                                            <button
                                                type="button"
                                                onClick={() => setCareersHeroForm({ ...careersHeroForm, bgImage: '' })}
                                                style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239,68,68,0.9)', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                                            >
                                                Reset to Default Image
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-actions-luxury">
                                <button type="button" className="btn-cancel-modal" onClick={() => setCareersHeroModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-save-modal">SAVE CAREERS HERO</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* About Our Team Edit Modal */}
            {careersAboutModalOpen && (
                <div className="modal-overlay-luxury">
                    <div className="modal-box-luxury" style={{ maxWidth: '650px' }}>
                        <div className="modal-header-luxury">
                            <h3>Edit "About Our Team" Section</h3>
                            <button className="btn-close-modal" onClick={() => setCareersAboutModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSaveCareersAbout} className="modal-form-luxury">
                            <div className="form-group">
                                <label>Section Kicker</label>
                                <input
                                    type="text"
                                    value={careersAboutForm.aboutKicker}
                                    onChange={e => setCareersAboutForm({ ...careersAboutForm, aboutKicker: e.target.value })}
                                    placeholder="e.g. ABOUT OUR TEAM"
                                />
                            </div>
                            <div className="form-group">
                                <label>Main Title</label>
                                <input
                                    type="text"
                                    value={careersAboutForm.aboutTitle}
                                    onChange={e => setCareersAboutForm({ ...careersAboutForm, aboutTitle: e.target.value })}
                                    placeholder="Great People Build Great Spaces"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description Paragraph</label>
                                <textarea
                                    rows="3"
                                    value={careersAboutForm.aboutDesc}
                                    onChange={e => setCareersAboutForm({ ...careersAboutForm, aboutDesc: e.target.value })}
                                    placeholder="At Good Interior, we believe that a strong team..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Team Section Image Upload / URL</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        value={careersAboutForm.aboutImage}
                                        onChange={e => setCareersAboutForm({ ...careersAboutForm, aboutImage: e.target.value })}
                                        placeholder="https://... or upload below"
                                    />
                                    <label className="btn-upload-label" style={{ flexShrink: 0, padding: '10px 14px', background: '#c48b59', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
                                        Upload Image
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={e => handleImageFileUpload(e, (url) => setCareersAboutForm(prev => ({ ...prev, aboutImage: url })))}
                                        />
                                    </label>
                                </div>
                                <div style={{ marginTop: '10px', background: '#0b0d11', borderRadius: '8px', padding: '12px', border: '1px dashed rgba(196,139,89,0.4)' }}>
                                    <span style={{ fontSize: '0.72rem', color: '#c48b59', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                                        Image Live Preview
                                    </span>
                                    <div style={{ position: 'relative', width: '100%', height: '120px', borderRadius: '6px', overflow: 'hidden' }}>
                                        <img
                                            src={careersAboutForm.aboutImage || teamCollabImg}
                                            alt="Team Section Preview"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        {careersAboutForm.aboutImage && (
                                            <button
                                                type="button"
                                                onClick={() => setCareersAboutForm({ ...careersAboutForm, aboutImage: '' })}
                                                style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239,68,68,0.9)', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                                            >
                                                Reset to Default Image
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="form-row-2col">
                                <div className="form-group">
                                    <label>Feature 1 Title</label>
                                    <input
                                        type="text"
                                        value={careersAboutForm.aboutF1}
                                        onChange={e => setCareersAboutForm({ ...careersAboutForm, aboutF1: e.target.value })}
                                        placeholder="Creative Environment"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Feature 2 Title</label>
                                    <input
                                        type="text"
                                        value={careersAboutForm.aboutF2}
                                        onChange={e => setCareersAboutForm({ ...careersAboutForm, aboutF2: e.target.value })}
                                        placeholder="Professional Growth"
                                    />
                                </div>
                            </div>
                            <div className="form-row-2col">
                                <div className="form-group">
                                    <label>Feature 3 Title</label>
                                    <input
                                        type="text"
                                        value={careersAboutForm.aboutF3}
                                        onChange={e => setCareersAboutForm({ ...careersAboutForm, aboutF3: e.target.value })}
                                        placeholder="Collaborative Team"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Feature 4 Title</label>
                                    <input
                                        type="text"
                                        value={careersAboutForm.aboutF4}
                                        onChange={e => setCareersAboutForm({ ...careersAboutForm, aboutF4: e.target.value })}
                                        placeholder="Meaningful Impact"
                                    />
                                </div>
                            </div>
                            <div className="modal-actions-luxury">
                                <button type="button" className="btn-cancel-modal" onClick={() => setCareersAboutModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-save-modal">SAVE ABOUT SECTION</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Why Work With Us Edit Modal */}
            {careersWhyModalOpen && (
                <div className="modal-overlay-luxury">
                    <div className="modal-box-luxury" style={{ maxWidth: '650px' }}>
                        <div className="modal-header-luxury">
                            <h3>Edit "Why Work With Us" Section</h3>
                            <button className="btn-close-modal" onClick={() => setCareersWhyModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSaveCareersWhy} className="modal-form-luxury">
                            <div className="form-group">
                                <label>Section Kicker</label>
                                <input
                                    type="text"
                                    value={careersWhyForm.whyKicker}
                                    onChange={e => setCareersWhyForm({ ...careersWhyForm, whyKicker: e.target.value })}
                                    placeholder="e.g. WHY WORK WITH US"
                                />
                            </div>
                            <div className="form-row-2col">
                                <div className="form-group">
                                    <label>Main Title</label>
                                    <input
                                        type="text"
                                        value={careersWhyForm.whyTitle}
                                        onChange={e => setCareersWhyForm({ ...careersWhyForm, whyTitle: e.target.value })}
                                        placeholder="More Than a Job"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Gold Subtitle</label>
                                    <input
                                        type="text"
                                        value={careersWhyForm.whySubtitle}
                                        onChange={e => setCareersWhyForm({ ...careersWhyForm, whySubtitle: e.target.value })}
                                        placeholder="It's a Place to Grow"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Background Image Upload / URL</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        value={careersWhyForm.whyBgImage}
                                        onChange={e => setCareersWhyForm({ ...careersWhyForm, whyBgImage: e.target.value })}
                                        placeholder="https://... or upload below"
                                    />
                                    <label className="btn-upload-label" style={{ flexShrink: 0, padding: '10px 14px', background: '#c48b59', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
                                        Upload Image
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={e => handleImageFileUpload(e, (url) => setCareersWhyForm(prev => ({ ...prev, whyBgImage: url })))}
                                        />
                                    </label>
                                </div>
                                <div style={{ marginTop: '10px', background: '#0b0d11', borderRadius: '8px', padding: '12px', border: '1px dashed rgba(196,139,89,0.4)' }}>
                                    <span style={{ fontSize: '0.72rem', color: '#c48b59', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                                        Background Image Live Preview
                                    </span>
                                    <div style={{ position: 'relative', width: '100%', height: '120px', borderRadius: '6px', overflow: 'hidden' }}>
                                        <img
                                            src={careersWhyForm.whyBgImage || careersWhyBg}
                                            alt="Why Section Background Preview"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        {careersWhyForm.whyBgImage && (
                                            <button
                                                type="button"
                                                onClick={() => setCareersWhyForm({ ...careersWhyForm, whyBgImage: '' })}
                                                style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239,68,68,0.9)', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                                            >
                                                Reset to Default Image
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="form-row-2col">
                                <div className="form-group">
                                    <label>Benefit 1 Title</label>
                                    <input
                                        type="text"
                                        value={careersWhyForm.whyB1Title}
                                        onChange={e => setCareersWhyForm({ ...careersWhyForm, whyB1Title: e.target.value })}
                                        placeholder="Competitive Salary & Benefits"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Benefit 2 Title</label>
                                    <input
                                        type="text"
                                        value={careersWhyForm.whyB2Title}
                                        onChange={e => setCareersWhyForm({ ...careersWhyForm, whyB2Title: e.target.value })}
                                        placeholder="Learning & Development"
                                    />
                                </div>
                            </div>
                            <div className="form-row-2col">
                                <div className="form-group">
                                    <label>Benefit 3 Title</label>
                                    <input
                                        type="text"
                                        value={careersWhyForm.whyB3Title}
                                        onChange={e => setCareersWhyForm({ ...careersWhyForm, whyB3Title: e.target.value })}
                                        placeholder="Supportive Team Culture"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Benefit 4 Title</label>
                                    <input
                                        type="text"
                                        value={careersWhyForm.whyB4Title}
                                        onChange={e => setCareersWhyForm({ ...careersWhyForm, whyB4Title: e.target.value })}
                                        placeholder="Work-Life Balance"
                                    />
                                </div>
                            </div>
                            <div className="modal-actions-luxury">
                                <button type="button" className="btn-cancel-modal" onClick={() => setCareersWhyModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-save-modal">SAVE WHY SECTION</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Ready To Join (CTA) Edit Modal */}
            {careersCtaModalOpen && (
                <div className="modal-overlay-luxury">
                    <div className="modal-box-luxury" style={{ maxWidth: '650px' }}>
                        <div className="modal-header-luxury">
                            <h3>Edit "Ready To Join" CTA Section</h3>
                            <button className="btn-close-modal" onClick={() => setCareersCtaModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSaveCareersCta} className="modal-form-luxury">
                            <div className="form-row-2col">
                                <div className="form-group">
                                    <label>Section Kicker</label>
                                    <input
                                        type="text"
                                        value={careersCtaForm.ctaKicker}
                                        onChange={e => setCareersCtaForm({ ...careersCtaForm, ctaKicker: e.target.value })}
                                        placeholder="READY TO JOIN?"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Button Text</label>
                                    <input
                                        type="text"
                                        value={careersCtaForm.ctaButtonText}
                                        onChange={e => setCareersCtaForm({ ...careersCtaForm, ctaButtonText: e.target.value })}
                                        placeholder="APPLY NOW"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Main Heading</label>
                                <input
                                    type="text"
                                    value={careersCtaForm.ctaTitle}
                                    onChange={e => setCareersCtaForm({ ...careersCtaForm, ctaTitle: e.target.value })}
                                    placeholder="Let's Build Something Beautiful Together"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description Paragraph</label>
                                <textarea
                                    rows="2"
                                    value={careersCtaForm.ctaDescription}
                                    onChange={e => setCareersCtaForm({ ...careersCtaForm, ctaDescription: e.target.value })}
                                    placeholder="If you're passionate about interior design..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Feature Image Upload / URL</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        value={careersCtaForm.ctaImage}
                                        onChange={e => setCareersCtaForm({ ...careersCtaForm, ctaImage: e.target.value })}
                                        placeholder="https://... or upload image"
                                    />
                                    <label className="btn-upload-label" style={{ flexShrink: 0, padding: '10px 14px', background: '#c48b59', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
                                        Upload Image
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={e => handleImageFileUpload(e, (url) => setCareersCtaForm(prev => ({ ...prev, ctaImage: url })))}
                                        />
                                    </label>
                                </div>
                                <div style={{ marginTop: '10px', background: '#0b0d11', borderRadius: '8px', padding: '12px', border: '1px dashed rgba(196,139,89,0.4)' }}>
                                    <span style={{ fontSize: '0.72rem', color: '#c48b59', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                                        Feature Image Live Preview
                                    </span>
                                    <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: '6px', overflow: 'hidden' }}>
                                        <img
                                            src={careersCtaForm.ctaImage || careersCtaLivingRoom}
                                            alt="CTA Image Preview"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        {careersCtaForm.ctaImage && (
                                            <button
                                                type="button"
                                                onClick={() => setCareersCtaForm({ ...careersCtaForm, ctaImage: '' })}
                                                style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239,68,68,0.9)', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                                            >
                                                Reset to Default Image
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Quote Box Text</label>
                                <textarea
                                    rows="2"
                                    value={careersCtaForm.ctaQuote}
                                    onChange={e => setCareersCtaForm({ ...careersCtaForm, ctaQuote: e.target.value })}
                                    placeholder="At Good Interior, we don't just design spaces..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Quote Author</label>
                                <input
                                    type="text"
                                    value={careersCtaForm.ctaQuoteAuthor}
                                    onChange={e => setCareersCtaForm({ ...careersCtaForm, ctaQuoteAuthor: e.target.value })}
                                    placeholder="OUR TEAM"
                                />
                            </div>
                            <div className="modal-actions-luxury">
                                <button type="button" className="btn-cancel-modal" onClick={() => setCareersCtaModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-save-modal">SAVE CTA SECTION</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Candidate Email Response Modal */}
            {candidateEmailModalOpen && selectedAppForEmail && (
                <div className="modal-overlay-luxury" style={{ zIndex: 9990 }}>
                    <div className="modal-box-luxury" style={{ maxWidth: '650px' }}>
                        <div className="modal-header-luxury">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <TbMail style={{ color: '#c48b59' }} /> Send Email to Candidate
                            </h3>
                            <button className="btn-close-modal" onClick={() => setCandidateEmailModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSendCandidateEmail} className="modal-form-luxury modal-body-luxury">
                            <div style={{ background: '#0b0d11', border: '1px solid rgba(196,139,89,0.25)', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#c48b59', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                                    Candidate Details
                                </div>
                                <div style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: '700' }}>
                                    {selectedAppForEmail.fullName}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <TbMail style={{ color: '#60a5fa' }} /> {selectedAppForEmail.email}
                                    </span>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <TbBriefcase style={{ color: '#c48b59' }} /> {selectedAppForEmail.position}
                                    </span>
                                </div>
                            </div>

                            {/* Quick Template Presets */}
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '0.78rem', color: '#c48b59', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                    <TbSend /> Quick Email Templates (Click to Apply)
                                </label>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <button
                                        type="button"
                                        onClick={() => handleApplyEmailTemplate('select')}
                                        style={{
                                            background: 'rgba(34, 197, 94, 0.15)',
                                            color: '#4ade80',
                                            border: '1px solid rgba(34, 197, 94, 0.3)',
                                            borderRadius: '8px',
                                            padding: '8px 14px',
                                            fontSize: '0.82rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <TbUserCheck style={{ fontSize: '1rem' }} /> Shortlisted / Select for Interview
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleApplyEmailTemplate('review')}
                                        style={{
                                            background: 'rgba(59, 130, 246, 0.15)',
                                            color: '#60a5fa',
                                            border: '1px solid rgba(59, 130, 246, 0.3)',
                                            borderRadius: '8px',
                                            padding: '8px 14px',
                                            fontSize: '0.82rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <TbEye style={{ fontSize: '1rem' }} /> Application Under Review
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleApplyEmailTemplate('reject')}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.15)',
                                            color: '#f87171',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            borderRadius: '8px',
                                            padding: '8px 14px',
                                            fontSize: '0.82rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <TbX style={{ fontSize: '1rem' }} /> Rejection Notice
                                    </button>
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '18px' }}>
                                <label>Email Subject Line *</label>
                                <input
                                    type="text"
                                    required
                                    value={emailForm.subject}
                                    onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })}
                                    placeholder="Enter email subject..."
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '18px' }}>
                                <label>Email Message Body * (Fully Editable)</label>
                                <textarea
                                    rows="7"
                                    required
                                    value={emailForm.bodyMessage}
                                    onChange={e => setEmailForm({ ...emailForm, bodyMessage: e.target.value })}
                                    placeholder="Write your email response here..."
                                    style={{ fontFamily: 'inherit', lineHeight: '1.5' }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '18px' }}>
                                <label>Update Candidate Status Upon Sending</label>
                                <select
                                    value={emailForm.statusTag}
                                    onChange={e => setEmailForm({ ...emailForm, statusTag: e.target.value })}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Reviewed">Reviewed</option>
                                    <option value="Contacted">Contacted (Selected / Shortlisted)</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>

                            <div className="modal-actions-luxury">
                                <button type="button" className="btn-cancel-modal" onClick={() => setCandidateEmailModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save-modal" disabled={emailForm.isSending} style={{ background: '#c48b59', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    {emailForm.isSending ? 'Sending Email...' : <>SEND EMAIL TO CANDIDATE <TbSend /></>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Confirm Modal JSX */}
            {
                confirmState.isOpen && (
                    <div className="modal-overlay-luxury" style={{ zIndex: 9999 }}>
                        <div className="modal-box-luxury" style={{ maxWidth: '400px', textAlign: 'center' }}>
                            <div className="modal-header-luxury">
                                <h3>Confirmation Required</h3>
                                <button className="btn-close-modal" onClick={handleConfirmNo}>×</button>
                            </div>
                            <div className="modal-body" style={{ padding: '20px 0', fontSize: '1rem', color: '#c48b59' }}>
                                <p>{confirmState.message || "Are you sure you want to proceed? This action cannot be undone."}</p>
                            </div>
                            <div className="modal-actions-luxury" style={{ justifyContent: 'center' }}>
                                <button type="button" className="btn-cancel-modal" onClick={handleConfirmNo}>Cancel</button>
                                <button type="button" className="btn-save-modal" onClick={handleConfirmYes} style={{ background: '#db3e3e', color: 'white', borderColor: '#db3e3e' }}>Delete</button>
                            </div>
                        </div>
                    </div>
                )
            }

        </div >
    );
};

export default AdminDashboard;
