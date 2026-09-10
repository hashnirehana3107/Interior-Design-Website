import React from 'react';
import { Link } from 'react-router-dom';
import { TbArrowRight } from 'react-icons/tb';

const BlogCard = ({ article }) => {
 return (
 <div className="article-card">
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
 <Link to={`/blog/${article.id}`} className="btn-read-more">READ MORE <TbArrowRight className="read-more-icon" /></Link>
 </div>
 </div>
 );
};

export default BlogCard;
