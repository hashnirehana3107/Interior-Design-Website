import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';
import { TbStar, TbQuote, TbTrophy, TbHeart, TbArrowRight, TbCalendarEvent, TbUpload, TbCheck } from 'react-icons/tb';
import { ImQuotesRight } from 'react-icons/im';
import './Testimonials.css';
import heroBg from '../assets/hero_bg.png';
import aboutImg from '../assets/about_img.png';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config/api';

const categories = [
    'ALL REVIEWS', 'RESIDENTIAL', 'COMMERCIAL', 'KITCHEN', 'BEDROOM', 'LIVING & DINING', 'RENOVATION', 'OTHER'
];

const Testimonials = () => {
    const { openConsultation } = useAuth();
    const [activeCategory, setActiveCategory] = useState('ALL REVIEWS');
    const [visibleCount, setVisibleCount] = useState(8);

    // Dynamic Backend Data States
    const [heroSettings, setHeroSettings] = useState({
        kicker: 'TESTIMONIALS',
        title: 'Trusted By Clients.<br /><span class="gold-text-italic">Loved</span> For Our Work.',
        subtitle: 'We take pride in creating spaces that inspire<br />and relationships that last.',
        bgImage: ''
    });
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [projectCount, setProjectCount] = useState(0);

    // Review Form States
    const [reviewForm, setReviewForm] = useState({ name: '', role: '', quote: '', category: 'RESIDENTIAL', avatar: '', image: '', stars: 5 });
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewStatus, setReviewStatus] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [heroRes, testiRes, projectsRes] = await Promise.all([
                fetch(`${API_BASE}/api/testimonials/hero`),
                fetch(`${API_BASE}/api/testimonials/public`),
                fetch(`${API_BASE}/api/projects`)
            ]);
            if (heroRes.ok) {
                const hData = await heroRes.json();
                if (hData) setHeroSettings(hData);
            }
            if (testiRes.ok) {
                const tData = await testiRes.json();
                if (Array.isArray(tData)) setTestimonials(tData);
            }
            if (projectsRes.ok) {
                const pData = await projectsRes.json();
                // Backend returns { projects: [...] }, filter only Completed ones
                const allProjects = Array.isArray(pData) ? pData : (pData.projects || []);
                const completedCount = allProjects.filter(p => (p.status || 'Completed') === 'Completed').length;
                setProjectCount(completedCount);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setReviewStatus('Submitting...');
        try {
            const res = await fetch(`${API_BASE}/api/testimonials`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewForm)
            });
            if (res.ok) {
                setReviewStatus('Success! Review submitted.');
                setReviewForm({ name: '', role: '', quote: '', category: 'RESIDENTIAL', avatar: '', image: '', stars: 5 });
                fetchData(); // reload reviews
                setTimeout(() => setReviewStatus(''), 3000);
            } else {
                setReviewStatus('Failed to submit. Try again.');
            }
        } catch (error) {
            setReviewStatus('Error occurred.');
        }
    };

    const handleImageFileUpload = (e, setFieldStatus) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setFieldStatus(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const filteredTestimonials = activeCategory === 'ALL REVIEWS'
        ? testimonials
        : testimonials.filter(item => item.category?.toUpperCase() === activeCategory);

    const paginatedTestimonials = filteredTestimonials.slice(0, visibleCount);

    // ── Dynamic Auto-Calculated Real Statistics ──
    const totalReviews = testimonials.length;

    // 1. Average Rating
    const avgRatingVal = totalReviews > 0
        ? (testimonials.reduce((acc, curr) => acc + (Number(curr.stars) || 5), 0) / totalReviews)
        : 0;
    const dynamicAverageRating = loading ? '–' : avgRatingVal.toFixed(1);

    // 2. Happy Clients
    const dynamicHappyClients = loading ? '–' : (totalReviews > 0 ? `${totalReviews}+` : '0');

    // 3. Projects Completed
    const dynamicProjectsCompleted = loading ? '–' : (projectCount > 0 ? `${projectCount}+` : '0');

    // 4. Client Satisfaction Percentage (4+ stars / total reviews)
    const positiveReviewsCount = testimonials.filter(item => (Number(item.stars) || 5) >= 4).length;
    const satisfactionPercentage = totalReviews > 0
        ? Math.round((positiveReviewsCount / totalReviews) * 100)
        : 0;
    const dynamicClientSatisfaction = loading ? '–' : `${satisfactionPercentage}%`;

    return (
        <div className="testimonials-page">
            {/* 1. Hero Section */}
            <section className="testi-hero" style={{ backgroundImage: `url(${heroSettings.bgImage || heroBg})` }}>
                <div className="testi-hero-overlay">
                    <div className="testi-hero-content">
                        <span className="testi-kicker">{heroSettings.kicker}</span>
                        <h1 className="testi-title" dangerouslySetInnerHTML={{ __html: heroSettings.title }}></h1>
                        <div className="hero-gold-line"></div>
                        <p className="testi-desc" dangerouslySetInnerHTML={{ __html: heroSettings.subtitle }}></p>
                    </div>
                </div>
            </section>

            {/* 2. Stats Section */}
            <section className="testi-stats-section">
                <div className="testi-stats-container">
                    <div className="testi-stat-item">
                        <div className="stat-top">
                            <TbStar className="stat-icon" />
                            <span className="stat-number">{dynamicAverageRating}</span>
                        </div>
                        <div className="stat-stars">
                            {[1, 2, 3, 4, 5].map((sIndex) => (
                                <FaStar
                                    key={sIndex}
                                    style={{ color: sIndex <= Math.round(avgRatingVal) ? '#c48b59' : '#cbd5e1' }}
                                />
                            ))}
                        </div>
                        <p className="stat-label">Average Rating</p>
                    </div>
                    <div className="stat-divider"></div>

                    <div className="testi-stat-item">
                        <div className="stat-top">
                            <TbQuote className="stat-icon" />
                            <span className="stat-number">{dynamicHappyClients}</span>
                        </div>
                        <p className="stat-label mt-label">Happy Clients</p>
                    </div>
                    <div className="stat-divider"></div>

                    <div className="testi-stat-item">
                        <div className="stat-top">
                            <TbTrophy className="stat-icon" />
                            <span className="stat-number">{dynamicProjectsCompleted}</span>
                        </div>
                        <p className="stat-label mt-label">Projects Completed</p>
                    </div>
                    <div className="stat-divider"></div>

                    <div className="testi-stat-item">
                        <div className="stat-top">
                            <TbHeart className="stat-icon" />
                            <span className="stat-number">{dynamicClientSatisfaction}</span>
                        </div>
                        <p className="stat-label mt-label">Client Satisfaction</p>
                    </div>
                </div>
            </section>

            {/* 3. Testimonials Grid Section */}
            <section className="testi-grid-section">
                <div className="testi-grid-header">
                    <p className="testi-kicker-center">CLIENT TESTIMONIALS</p>
                    <h2 className="testi-main-heading">What Our Clients Say</h2>
                </div>

                <div className="testi-categories">
                    {categories.map((cat, index) => (
                        <button
                            key={index}
                            className={`testi-cat-btn ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => {
                                setActiveCategory(cat);
                                setVisibleCount(8);
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="testi-cards-grid">
                    {loading ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: '#94a3b8', fontSize: '15px', letterSpacing: '1px' }}>Loading reviews...</div>
                    ) : paginatedTestimonials.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: '#94a3b8', fontSize: '15px', letterSpacing: '1px' }}>No reviews found.</div>
                    ) : paginatedTestimonials.map((testi, i) => (
                        <div key={testi._id || testi.id || i} className="testi-card">
                            <div className="testi-card-img-wrap">
                                <img src={testi.image} alt="Interior" className="testi-card-img" />
                                <div className="quote-icon-badge">
                                    <ImQuotesRight />
                                </div>
                            </div>
                            <div className="testi-card-content">
                                <div className="testi-card-stars">
                                    {[...Array(testi.stars || 5)].map((_, idx) => <FaStar key={idx} />)}
                                </div>
                                <p className="testi-card-quote">{testi.quote}</p>
                                <div className="testi-card-divider"></div>
                                <div className="testi-author-info">
                                    <img src={testi.avatar} alt={testi.name} className="testi-avatar" />
                                    <div className="testi-author-details">
                                        <h4>{testi.name}</h4>
                                        <p>{testi.role}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {visibleCount < filteredTestimonials.length && (
                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <button
                            className="btn-outline"
                            style={{ padding: '12px 30px', cursor: 'pointer' }}
                            onClick={() => setVisibleCount(prev => prev + 8)}
                        >
                            VIEW MORE <TbArrowRight style={{ marginLeft: '8px' }} />
                        </button>
                    </div>
                )}
            </section>

            {/* 4. Large Quote Banner */}
            <section className="testi-quote-banner">
                <div className="testi-quote-banner-inner">
                    <div className="testi-quote-left">
                        <div className="big-quote-mark">
                            <FaQuoteLeft />
                        </div>
                        <div className="big-quote-text">
                            <h3 dangerouslySetInnerHTML={{ __html: heroSettings.quoteText || 'Design is not just what it looks like and feels like.<br />Design is how it works.' }}></h3>
                            <p className="quote-author">{heroSettings.quoteAuthor || '– Steve Jobs'}</p>
                        </div>
                    </div>
                    <div className="testi-quote-right" style={{ backgroundImage: `url(${heroSettings.quoteImage || aboutImg})` }}>
                    </div>
                </div>
            </section>

            {/* 4.5. Submit Review Form */}
            <section className="testi-submit-section" style={{ padding: '4rem 5%', backgroundColor: '#fdfbfa', borderTop: '1px solid #efebea' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '32px', marginBottom: '10px' }}>Leave a Review</h2>
                    <p style={{ color: '#777', fontSize: '14px', marginBottom: '2rem' }}>We'd love to hear about your experience designing with us.</p>

                    <form onSubmit={handleReviewSubmit} style={{ display: 'grid', gap: '15px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
                            <label style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Rate Your Experience</label>
                            <div style={{ display: 'flex', gap: '10px', fontSize: '28px', cursor: 'pointer' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar
                                        key={star}
                                        style={{ color: (hoverRating || reviewForm.stars) >= star ? '#c48b59' : '#e2e8f0', transition: 'color 0.2s' }}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setReviewForm({ ...reviewForm, stars: star })}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="form-row-2col">
                            <input type="text" placeholder="Your Name" required value={reviewForm.name} onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })} style={{ padding: '14px', border: '1px solid #ddd', outline: 'none', borderRadius: '4px', fontSize: '14px' }} />
                            <input type="text" placeholder="Your Role / Location (e.g. Homeowner • Colombo)" required value={reviewForm.role} onChange={e => setReviewForm({ ...reviewForm, role: e.target.value })} style={{ padding: '14px', border: '1px solid #ddd', outline: 'none', borderRadius: '4px', fontSize: '14px' }} />
                        </div>
                        <textarea placeholder="Your Review..." rows="4" required value={reviewForm.quote} onChange={e => setReviewForm({ ...reviewForm, quote: e.target.value })} style={{ padding: '14px', border: '1px solid #ddd', outline: 'none', resize: 'vertical', borderRadius: '4px', fontSize: '14px' }}></textarea>

                        <div className="form-row-2col">
                            <div style={{ position: 'relative' }}>
                                <input id="avatarUpload" type="file" accept="image/*" onChange={(e) => handleImageFileUpload(e, (b64) => setReviewForm({ ...reviewForm, avatar: b64 }))} style={{ display: 'none' }} />
                                <label htmlFor="avatarUpload" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', border: '1px solid #ddd', background: '#fff', fontSize: '14px', color: reviewForm.avatar && reviewForm.avatar.length > 200 ? '#22c55e' : '#777', cursor: 'pointer', outline: 'none', transition: 'all 0.2s', height: '100%', borderRadius: '4px' }}>
                                    {reviewForm.avatar && reviewForm.avatar.length > 200 ? <TbCheck style={{ fontSize: '18px' }} /> : <TbUpload style={{ fontSize: '18px' }} />}
                                    {reviewForm.avatar && reviewForm.avatar.length > 200 ? 'Avatar Attached' : 'Upload Avatar Image (Optional)'}
                                </label>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input id="projectImageUpload" type="file" accept="image/*" onChange={(e) => handleImageFileUpload(e, (b64) => setReviewForm({ ...reviewForm, image: b64 }))} style={{ display: 'none' }} />
                                <label htmlFor="projectImageUpload" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', border: '1px solid #ddd', background: '#fff', fontSize: '14px', color: reviewForm.image && reviewForm.image.length > 200 ? '#22c55e' : '#777', cursor: 'pointer', outline: 'none', transition: 'all 0.2s', height: '100%', borderRadius: '4px' }}>
                                    {reviewForm.image && reviewForm.image.length > 200 ? <TbCheck style={{ fontSize: '18px' }} /> : <TbUpload style={{ fontSize: '18px' }} />}
                                    {reviewForm.image && reviewForm.image.length > 200 ? 'Project Image Attached' : 'Upload Project Image (Optional)'}
                                </label>
                            </div>
                        </div>
                        <select value={reviewForm.category} onChange={e => setReviewForm({ ...reviewForm, category: e.target.value })} style={{ padding: '14px', border: '1px solid #ddd', outline: 'none', borderRadius: '4px', fontSize: '14px' }}>
                            {categories.filter(c => c !== 'ALL REVIEWS').map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <button type="submit" className="btn-solid-gold" style={{ justifyContent: 'center' }}>SUBMIT REVIEW <TbArrowRight className="btn-arrow-icon" /></button>
                        {reviewStatus && <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '13px', color: '#c48b59', fontWeight: '500' }}>{reviewStatus}</p>}
                    </form>
                </div>
            </section>

            {/* 5. Bottom CTA Section */}
            <section className="testi-bottom-cta">
                <div className="testi-cta-container">
                    <div className="testi-cta-content">
                        <div className="testi-cta-icon-box">
                            <TbCalendarEvent className="cta-calendar-icon" />
                        </div>
                        <div className="testi-cta-v-divider"></div>
                        <div className="testi-cta-text">
                            <span className="testi-cta-kicker">READY TO START YOUR PROJECT?</span>
                            <h2 className="testi-cta-heading">Let's Create A Space You'll Love.</h2>
                        </div>
                    </div>
                    <div className="testi-cta-action">
                        <button type="button" onClick={() => openConsultation()} className="btn-solid-gold">
                            BOOK A CONSULTATION <TbArrowRight className="btn-arrow-icon" />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};


export default Testimonials;
