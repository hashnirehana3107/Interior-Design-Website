import React from 'react';
import { Link } from 'react-router-dom';
import { BsArrowRight } from 'react-icons/bs';
import detailImg from '../assets/detail_img.png';

const ProjectCard = ({ project, index }) => {
 const formattedIndex = index ? String(index).padStart(2, '0') : '01';
 return (
 <div className="portfolio-card-item">
 <div className="portfolio-card-img-wrap">
 <img src={project.image} alt={project.title} onError={(e) => { e.target.src = detailImg; }} />
 <div className="project-badge">{project.id || formattedIndex}</div>
 </div>
 <div className="portfolio-card-body">
 <h3 className="project-title">{project.title}</h3>
 <span className="project-category-tag">{project.category}</span>
 <p className="project-desc">{project.description}</p>
 <Link to={`/projects/${project._id || project.id}`} className="project-view-link">
 VIEW PROJECT <BsArrowRight className="btn-arrow-icon" />
 </Link>
 </div>
 </div>
 );
};

export default ProjectCard;
