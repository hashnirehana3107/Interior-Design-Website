import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
 TbChevronRight, TbChevronLeft, TbCalendar, TbClock, TbUser, TbBulb, TbArrowRight,
 TbHome, TbLeaf, TbBrandFacebook, TbBrandTwitter, TbBrandPinterest, TbBrandLinkedin, TbMail,
 TbSofa
} from 'react-icons/tb';
import { FiMonitor } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { allArticles } from '../data/blogData';
import './Blog.css';
import './BlogDetail.css';
import heroBg from '../assets/hero_bg.png';

const tags = [
 'Minimalist', 'Living Room', 'Modern Home', 'Kitchen', 'Bedroom', 'Decor',
 'Renovation', 'Lighting', 'Sustainable', 'Luxury', 'Small Space', 'Materials'
];

const categories = [
 { label: 'Interior Trends', count: 12, icon: <TbHome /> },
 { label: 'Design Tips', count: 18, icon: <TbBulb /> },
 { label: 'Room Ideas', count: 15, icon: <TbSofa /> },
 { label: 'Materials & Finishes', count: 10, icon: <TbLeaf /> },
 { label: 'Home Improvement', count: 9, icon: <TbHome /> },
 { label: 'Sustainable Design', count: 7, icon: <TbLeaf /> },
];

const BlogDetail = () => {
 const { id } = useParams();
 const navigate = useNavigate();
 const { showToast } = useAuth();

 const [article, setArticle] = useState(null);
 const [allPosts, setAllPosts] = useState([]);
 const [loading, setLoading] = useState(true);

 const [newsletterEmail, setNewsletterEmail] = useState('');
 const [newsletterError, setNewsletterError] = useState('');
 const [newsletterSuccess, setNewsletterSuccess] = useState(false);

 useEffect(() => {
 window.scrollTo(0, 0);
 const fetchArticleData = async () => {
 try {
 setLoading(true);
 const [singleRes, allRes] = await Promise.all([
 fetch(`http://localhost:5000/api/blog/posts/${id}`),
 fetch(`http://localhost:5000/api/blog/posts`)
 ]);

 let currentArticle = null;
 if (singleRes.ok) {
 currentArticle = await singleRes.json();
 }

 let postsList = [];
 if (allRes.ok) {
 postsList = await allRes.json();
 setAllPosts(postsList);
 }

 if (!currentArticle && postsList.length > 0) {
 currentArticle = postsList.find(p => (p._id === id || p.id?.toString() === id)) || postsList[0];
 }

 if (!currentArticle) {
 currentArticle = allArticles.find(a => a.id.toString() === id) || allArticles[0];
 }

 setArticle(currentArticle);
 } catch (error) {
 console.error('Error fetching blog article detail:', error);
 const fallback = allArticles.find(a => a.id.toString() === id) || allArticles[0];
 setArticle(fallback);
 } finally {
 setLoading(false);
 }
 };
 fetchArticleData();
 }, [id]);

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
 const res = await fetch('http://localhost:5000/api/subscribers', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ email: newsletterEmail })
 });
 const data = await res.json();

 if (res.ok) {
 setNewsletterSuccess(true);
 if (showToast) showToast('! check your inbox for an email.', 'success');
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

 const currentArticle = article || allArticles[0];
 const displayList = allPosts.length > 0 ? allPosts : allArticles;
 const relatedArticles = displayList.filter(a => (a._id || a.id)?.toString() !== (currentArticle._id || currentArticle.id)?.toString()).slice(0, 3);

 // Compute dynamic categories based on 'badge' property
 const derivedCategoryCounts = displayList.reduce((acc, post) => {
 const cat = Object.keys(acc).find(k => k.toLowerCase() === (post.badge || 'Uncategorized').toLowerCase());
 if (cat) acc[cat]++;
 else acc[post.badge || 'Uncategorized'] = 1;
 return acc;
 }, {});

 const dynamicCategories = Object.keys(derivedCategoryCounts).map(catLabel => {
 let icon = <TbHome />;
 const lowerLabel = catLabel.toLowerCase();
 if (lowerLabel.includes('design') || lowerLabel.includes('tip')) icon = <TbBulb />;
 if (lowerLabel.includes('room') || lowerLabel.includes('furn') || lowerLabel.includes('decor')) icon = <TbSofa />;
 if (lowerLabel.includes('material') || lowerLabel.includes('sustain') || lowerLabel.includes('eco')) icon = <TbLeaf />;

 return {
 label: catLabel,
 count: derivedCategoryCounts[catLabel],
 icon
 };
 }).sort((a, b) => b.count - a.count);

 const sidebarCategories = dynamicCategories.length > 0 ? dynamicCategories : categories;

 // Show only the tags for the current article in the sidebar
 const sidebarTags = (currentArticle.tags && currentArticle.tags.length > 0) ? currentArticle.tags : tags;

 return (
 <div className="blog-detail-page">
 <div className="blog-detail-container">
 <div className="blog-back-section">
 <button className="btn-back" onClick={() => navigate('/blog')}>
 <TbChevronLeft size={16} /> BACK TO BLOG
 </button>
 </div>
 {/* ── Breadcrumb ── */}
 <div className="breadcrumb">
 <Link to="/">Home</Link> <TbChevronRight className="bc-icon" />
 <Link to="/blog">Blog</Link> <TbChevronRight className="bc-icon" />
 <Link to={`/blog?category=${(currentArticle.badge || 'Trends').toLowerCase().replace(/ /g, '-')}`}>{currentArticle.badge}</Link> <TbChevronRight className="bc-icon" />
 <span className="bc-current">{currentArticle.title}</span>
 </div>

 <div className="blog-detail-layout">
 {/* LEFT main column */}
 <div className="blog-detail-main">
 <span className="blog-kicker-text">{currentArticle.badge}</span>
 <h1 className="blog-detail-title">{currentArticle.title}</h1>
 <div className="blog-detail-meta">
 <span className="meta-item"><TbCalendar className="meta-icon" /> {currentArticle.date}</span>
 <span className="meta-dot">•</span>
 <span className="meta-item"><TbClock className="meta-icon" /> {currentArticle.readTime}</span>
 <span className="meta-dot">•</span>
 <span className="meta-item"><TbUser className="meta-icon" /> By {currentArticle.author || 'Good Interior Studio'}</span>
 </div>

 <div className="blog-main-img-wrap">
 <img src={currentArticle.img} alt={currentArticle.title} />
 </div>

 <div className="blog-rich-content">
 {currentArticle.content ? (
 currentArticle.content.split('\n\n').map((paragraph, index) => {
 if (paragraph.startsWith('## ')) {
 return <h2 key={index}>{paragraph.replace('## ', '')}</h2>;
 }
 if (paragraph.startsWith('http://') || paragraph.startsWith('https://')) {
 return <img key={index} className="content-img-full" src={paragraph.trim()} alt="Blog content" />;
 }
 return <p key={index}>{paragraph}</p>;
 })
 ) : (
 <>
 <p>{currentArticle.desc}</p>
 <p>As we step into 2025, interior design continues to evolve — blending elegance with functionality, nature with modern living. This year's trends focus on creating spaces that are not only beautiful but also meaningful and sustainable.</p>
 <h2>1. Warm Neutrals & Natural Elements</h2>
 <p>Warm neutrals bring depth, balance, and modern luxury into residential and commercial spaces.</p>
 </>
 )}
 </div>

 <div className="blog-share-section">
 <span className="share-label">SHARE THIS ARTICLE</span>
 <div className="share-icons">
 <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="share-icon"><TbBrandFacebook /></a>
 <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(currentArticle.title)}`} target="_blank" rel="noopener noreferrer" className="share-icon"><TbBrandTwitter /></a>
 <a href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&media=${encodeURIComponent(currentArticle.img)}&description=${encodeURIComponent(currentArticle.title)}`} target="_blank" rel="noopener noreferrer" className="share-icon"><TbBrandPinterest /></a>
 <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="share-icon"><TbBrandLinkedin /></a>
 <a href={`mailto:?subject=${encodeURIComponent(currentArticle.title)}&body=I thought you might find this interesting: ${encodeURIComponent(window.location.href)}`} className="share-icon"><TbMail /></a>
 </div>
 </div>
 </div>

 {/* RIGHT sidebar */}
 <div className="blog-sidebar">

 {/* Author Info */}
 <div className="sidebar-box author-box">
 <h3 className="sidebar-heading">ABOUT THE AUTHOR</h3>
 <div className="author-content">
 <img src={currentArticle.authorImg || "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80"} alt={currentArticle.author} className="author-img" />
 <div className="author-info">
 <h4>{currentArticle.author || 'Good Interior Studio'}</h4>
 <span className="author-role">{currentArticle.authorRole || "Interior Designer"}</span>
 </div>
 </div>
 <p className="author-bio">{currentArticle.authorBio || "Interior designer with over 10 years of experience creating beautiful and functional spaces that reflect clients' lifestyle and personality."}</p>
 <Link to={`/blog?author=${(currentArticle.author || "").toLowerCase().replace(/ /g, '-')}`} className="btn-outline-dark-gold view-all-btn" style={{ textDecoration: 'none' }}>
 VIEW ALL POSTS <TbArrowRight className="btn-arrow-icon-sm" />
 </Link>
 </div>

 {/* Related Articles */}
 <div className="sidebar-box related-box">
 <h3 className="sidebar-heading">RELATED ARTICLES</h3>
 <div className="popular-list">
 {relatedArticles.map(post => (
 <Link to={`/blog/${post._id || post.id}`} className="popular-item" key={post._id || post.id} style={{ textDecoration: 'none' }}>
 <img src={post.img} alt={post.title} />
 <div className="popular-item-info">
 <h4>{post.title}</h4>
 <span className="popular-date">{post.date}</span>
 </div>
 </Link>
 ))}
 </div>
 </div>

 {/* Subscription */}
 <div className="sidebar-subscribe" style={{ backgroundImage: `url(${heroBg})` }}>
 <div className="subscribe-overlay">
 <div className="subs-icon">
 <TbBulb style={{ fontSize: '24px', color: '#c48b59' }} />
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


 {/* Categories */}
 <div className="sidebar-box categories-box">
 <h3 className="sidebar-heading">CATEGORIES</h3>
 <ul className="categories-list">
 {sidebarCategories.map((cat, idx) => (
 <li key={idx} className="category-item">
 <Link to={`/blog?category=${cat.label.toLowerCase().replace(/ /g, '-')}`} className="cat-label" style={{ textDecoration: 'none', color: 'inherit' }}>
 <span className="cat-icon">{cat.icon}</span>
 {cat.label}
 </Link>
 <span className="cat-count">{cat.count}</span>
 </li>
 ))}
 </ul>
 </div>

 {/* Tags */}
 <div className="sidebar-tags">
 <h3 className="sidebar-heading">TAGS</h3>
 <div className="tags-container">
 {sidebarTags.map((tag, idx) => (
 <Link key={idx} to={`/blog?tag=${tag.toLowerCase().replace(/ /g, '-')}`} className="tag-pill" style={{ textDecoration: 'none', display: 'inline-block' }}>{tag}</Link>
 ))}
 </div>
 </div>

 </div>
 </div>
 </div>

 {/* ── CTA ── */}
 <section
 className="blog-bottom-cta"
 style={{
 background: `linear-gradient(rgba(26, 26, 25, 0.92), rgba(26, 26, 25, 0.92)), url(${heroBg}) center/cover no-repeat`
 }}
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
 <button type="button" onClick={() => openConsultation()} className="btn-solid-gold">
 BOOK A CONSULTATION <TbArrowRight className="btn-arrow-icon" />
 </button>
 </div>

 </div>
 </section>
 </div>
 );
};

export default BlogDetail;
