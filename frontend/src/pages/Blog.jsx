import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    TbChevronDown, TbRefresh, TbBulb, TbArrowRight,
    TbSofa, TbBulb as TbLighting, TbBed, TbTools, TbHome, TbLeaf
} from 'react-icons/tb';
import { useAuth } from '../context/AuthContext';
import './Blog.css';
import heroBg from '../assets/hero_bg.png';
import API_BASE from '../config/api';



const Blog = () => {
    const { openConsultation, showToast } = useAuth();
    const [sortOpen, setSortOpen] = useState(false);
    const [sortLabel, setSortLabel] = useState('SORT BY: LATEST');
    const sortRef = useRef(null);
    const sortOptions = ['LATEST', 'OLDEST', 'POPULAR'];
    const [visibleCount, setVisibleCount] = useState(6);
    const [selectedTag, setSelectedTag] = useState(null);

    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterError, setNewsletterError] = useState('');
    const [newsletterSuccess, setNewsletterSuccess] = useState(false);

    // Backend Dynamic Data States
    const [heroSettings, setHeroSettings] = useState({
        kicker: 'OUR BLOG',
        title: 'Ideas, Inspiration & Interior Tips',
        subtitle: 'Explore expert advice, design trends, and creative ideas to help you create beautiful, functional spaces.',
        bgImage: ''
    });
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchBlogData = async () => {
            try {
                setLoading(true);
                const [heroRes, postsRes] = await Promise.all([
                    fetch(`${API_BASE}/api/blog/hero`),
                    fetch(`${API_BASE}/api/blog/posts`)
                ]);
                if (heroRes.ok) {
                    const heroData = await heroRes.json();
                    if (heroData && heroData.title) setHeroSettings(heroData);
                }
                if (postsRes.ok) {
                    const postsData = await postsRes.json();
                    if (Array.isArray(postsData) && postsData.length > 0) {
                        setPosts(postsData);
                    }
                }
            } catch (error) {
                console.error('Error fetching blog data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogData();
    }, []);

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        setNewsletterError('');
        setNewsletterSuccess(false);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!newsletterEmail.trim() || !emailRegex.test(newsletterEmail.trim())) {
            setNewsletterError('Valid email required');
            if (showToast) showToast('Please complete all required fields.', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/subscribers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newsletterEmail })
            });
            const data = await res.json();

            if (res.ok) {
                setNewsletterSuccess(true);
                if (showToast) showToast('Successfully subscribed! Please check your inbox for updates.', 'success');
                setNewsletterEmail('');
            } else {
                setNewsletterError(data.message || 'Subscription failed');
                if (showToast) showToast(`${data.message || 'Failed to subscribe'}`, 'error');
            }
        } catch (err) {
            console.error('Subscription error:', err);
            setNewsletterError('Server error');
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

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0b0d11' }}>
                <div style={{ color: '#9ca3af', fontSize: '1.2rem', letterSpacing: '2px' }}>LOADING BLOG...</div>
            </div>
        );
    }

    // Tag filter
    const tagFilteredPosts = selectedTag
        ? posts.filter(p => Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase()))
        : posts;

    // Sort logic
    let sortedPosts = [...tagFilteredPosts];
    if (sortLabel === 'SORT BY: OLDEST') {
        sortedPosts.reverse();
    } else if (sortLabel === 'SORT BY: POPULAR') {
        sortedPosts.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    }

    const featuredPost = sortedPosts.find(p => p.isFeatured) || sortedPosts[0];
    const gridArticles = sortedPosts.filter(p => (p._id || p.id) !== (featuredPost?._id || featuredPost?.id));

    const popularArticles = posts.filter(p => p.isPopular);
    const sidebarPopular = popularArticles.length > 0 ? popularArticles.slice(0, 3) : posts.slice(0, 3);

    // Extract tags dynamically from backend posts only
    const sidebarTags = Array.from(new Set(posts.flatMap(p => p.tags || [])));

    const handleTagClick = (tag) => {
        setSelectedTag(prev => prev === tag ? null : tag);
        setVisibleCount(6);
    };

    const bgImageStyle = heroSettings.bgImage ? `url(${heroSettings.bgImage})` : `url(${heroBg})`;

    return (
        <div className="blog-page">

            {/* ── Hero ── */}
            <section className="blog-hero" style={{ backgroundImage: bgImageStyle }}>
                <div className="blog-hero-overlay">
                    <div className="blog-hero-content">
                        <span className="blog-kicker">{heroSettings.kicker || 'OUR BLOG'}</span>
                        <h1 className="blog-title" dangerouslySetInnerHTML={{
                            __html: heroSettings.title
                                ? heroSettings.title.replace(/Interior/g, '<span class="gold-text-italic">Interior</span>')
                                : 'Ideas, Inspiration<br />& <span class="gold-text-italic">Interior</span> Tips'
                        }}></h1>
                        <div className="hero-gold-line"></div>
                        <p className="blog-desc">
                            {heroSettings.subtitle || 'Explore expert advice, design trends, and creative ideas to help you create beautiful, functional spaces.'}
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Main: persistent 2‑col [main-col | sidebar] ── */}
            <main className="blog-main-container">
                <div className="blog-layout">

                    {/* LEFT main column */}
                    <div className="blog-main-col">

                        {/* Featured article */}
                        {featuredPost && (
                            <div className="featured-article-card">
                                <div className="featured-img-wrap">
                                    <img
                                        src={featuredPost.img}
                                        alt={featuredPost.title}
                                    />
                                    <div className="article-badge-gold">{featuredPost.badge}</div>
                                </div>
                                <div className="featured-content">
                                    <div className="article-meta">
                                        {featuredPost.date} <span className="meta-dot">•</span> {featuredPost.readTime}
                                    </div>
                                    <h2>{featuredPost.title}</h2>
                                    <p>{featuredPost.desc}</p>
                                    <Link to={`/blog/${featuredPost._id || featuredPost.id}`} className="btn-read-more">READ MORE <TbArrowRight className="read-more-icon" /></Link>
                                </div>
                            </div>
                        )}

                        {/* All articles */}
                        <div className="blog-articles-section">
                            <div className="all-articles-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span className="section-label">
                                        {selectedTag ? `TAG: ${selectedTag.toUpperCase()}` : 'ALL ARTICLES'}
                                    </span>
                                    {selectedTag && (
                                        <button onClick={() => setSelectedTag(null)} className="tag-clear-btn">&times; Clear</button>
                                    )}
                                </div>
                                {!selectedTag && (
                                    <div className="sort-dropdown" ref={sortRef}>
                                        <button
                                            className={`sort-btn ${sortOpen ? 'open' : ''}`}
                                            onClick={() => setSortOpen(p => !p)}
                                        >
                                            {sortLabel} <TbChevronDown className={`sort-icon ${sortOpen ? 'rotated' : ''}`} />
                                        </button>
                                        {sortOpen && (
                                            <ul className="sort-dropdown-menu">
                                                {sortOptions.map(opt => (
                                                    <li
                                                        key={opt}
                                                        className={`sort-option ${sortLabel === `SORT BY: ${opt}` ? 'active' : ''}`}
                                                        onClick={() => { setSortLabel(`SORT BY: ${opt}`); setSortOpen(false); }}
                                                    >
                                                        {opt}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="articles-grid">
                                {gridArticles.slice(0, visibleCount).map(article => (
                                    <div className="article-card" key={article._id || article.id}>
                                        <div className="article-img-wrap">
                                            <img src={article.img} alt={article.title} />
                                            <div className="article-badge-gold">{article.badge}</div>
                                        </div>
                                        <div className="article-content">
                                            <div className="article-meta">
                                                {article.date} <span className="meta-dot">•</span> {article.readTime}
                                            </div>
                                            <h3>{article.title}</h3>
                                            <p>{article.desc}</p>
                                            <Link to={`/blog/${article._id || article.id}`} className="btn-read-more">READ MORE <TbArrowRight className="read-more-icon" /></Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {sortedPosts.length === 0 && (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#888' }}>
                                    <p style={{ fontSize: '14px', marginBottom: '12px' }}>No articles found for tag <strong style={{ color: '#475569' }}>&ldquo;{selectedTag}&rdquo;</strong>.</p>
                                    <button onClick={() => setSelectedTag(null)} className="tag-clear-btn" style={{ fontSize: '12px', padding: '8px 18px' }}>Show All Articles</button>
                                </div>
                            )}

                            {visibleCount < gridArticles.length && (
                                <div className="load-more-center">
                                    <button className="btn-outline-dark-gold" onClick={() => setVisibleCount(prev => prev + 6)}>
                                        LOAD MORE ARTICLES <TbRefresh className="load-icon" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT sidebar — full height alongside main col */}
                    <div className="blog-sidebar">

                        <div className="sidebar-box">
                            <h3>POPULAR POSTS</h3>
                            <div className="sidebar-title-gold-line"></div>
                            <div className="popular-list">
                                {sidebarPopular.map(post => (
                                    <Link to={`/blog/${post._id || post.id}`} className="popular-item" key={post._id || post.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <img src={post.img} alt={post.title} />
                                        <div className="popular-item-info">
                                            <h4>{post.title}</h4>
                                            <span className="popular-date">{post.date}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="sidebar-subscribe" style={{ backgroundImage: bgImageStyle }}>
                            <div className="subscribe-overlay">
                                <div className="subs-icon">
                                    <img
                                        src="data:image/svg+xml;utf8,<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M19 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V6C21 4.89543 20.1046 4 19 4Z' stroke='%236c7a89' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/><path d='M3 7L12 13L21 7' stroke='%236c7a89' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>"
                                        alt="Mail"
                                    />
                                </div>
                                <h3>Design Inspiration<br />Delivered to You</h3>
                                <p>Subscribe to our newsletter and get the latest tips, trends and ideas.</p>
                                {newsletterSuccess ? (
                                    <div className="form-success-banner-style" style={{ marginTop: '10px', fontSize: '12.5px', padding: '8px 12px' }}>
                                        Thank you for subscribing!
                                    </div>
                                ) : (
                                    <form className="subs-form" onSubmit={handleNewsletterSubmit} noValidate>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <input
                                                type="email"
                                                placeholder="Your email address"
                                                className={newsletterError ? 'input-has-error' : ''}
                                                value={newsletterEmail}
                                                onChange={(e) => {
                                                    setNewsletterEmail(e.target.value);
                                                    if (newsletterError) setNewsletterError('');
                                                }}
                                            />
                                            {newsletterError && (
                                                <span className="form-field-error-msg">️ {newsletterError}</span>
                                            )}
                                        </div>
                                        <button type="submit" className="btn-solid-gold btn-subs">SUBSCRIBE</button>
                                    </form>
                                )}
                            </div>
                        </div>


                        <div className="sidebar-tags">
                            <h3>TAGS</h3>
                            <div className="sidebar-title-gold-line"></div>
                            <div className="tags-container">
                                {sidebarTags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className={`tag-pill${selectedTag === tag ? ' tag-pill--active' : ''}`}
                                        onClick={() => handleTagClick(tag)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && handleTagClick(tag)}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* ── CTA ── */}
            <section
                className="blog-bottom-cta"
                style={{ background: `linear-gradient(rgba(26, 26, 25, 0.92), rgba(26, 26, 25, 0.92)), url(${heroBg}) center/cover no-repeat` }}
            >
                <div className="blog-cta-container">
                    <div className="blog-cta-content">
                        <div className="blog-cta-icon-box">
                            <TbBulb className="cta-calendar-icon" />
                        </div>
                        <div className="blog-cta-v-divider"></div>
                        <div className="blog-cta-text">
                            <span className="blog-cta-kicker">HAVE A DESIGN IDEA IN MIND?</span>
                            <h2 className="blog-cta-heading">Let's Bring Your Vision to Life.</h2>
                        </div>
                    </div>
                    <div className="blog-cta-action">
                        <button type="button" onClick={() => openConsultation()} className="btn-solid-gold" style={{ border: 'none', cursor: 'pointer' }}>
                            BOOK A CONSULTATION <TbArrowRight className="btn-arrow-icon" />
                        </button>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Blog;
