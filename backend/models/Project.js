const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    // Basic Info
    title: { type: String, required: [true, 'Project title is required'] },
    category: { type: String, required: [true, 'Project category is required'] },
    filterCategory: { type: String, default: 'residential' },
    subCategory: { type: String, default: 'living-dining' },
    image: { type: String, required: [true, 'Project main image is required'] },

    // Overview
    description: { type: String, default: '' },
    client: { type: String, default: 'Private Client' },
    location: { type: String, default: 'Colombo, Sri Lanka' },
    year: { type: String, default: '2024' },
    area: { type: String, default: '1,850 sq ft' },
    status: { type: String, default: 'Completed', enum: ['Completed', 'In Progress', 'On Hold', 'Cancelled'] },

    // Details Page Info
    projectOverview: { type: String, default: 'This project was all about creating a clutter-free, functional living space with a warm and natural ambiance. Every element, from the materials to the lighting, was carefully curated to reflect the client\'s lifestyle and love for minimalist aesthetics.' },
    requirements: { type: [String], default: ['A calm and clutter-free living space', 'Natural materials and warm tones', 'Ample storage solutions', 'Open and airy feel with good lighting', 'A design that is timeless and elegant'] },
    designConcept: { type: String, default: 'The concept revolves around "Simplicity Meets Warmth". We used a neutral color palette, natural textures, and clean lines to create a space that feels open, cozy, and effortlessly stylish.' },
    keyFeatures: { type: [String], default: ['Neutral color palette with warm accents', 'Natural wood and stone finishes', 'Custom-built storage and shelving', 'Layered lighting for ambiance', 'Indoor greenery for a refreshing touch'] },

    // Media & Gallery
    beforeImg: { type: String, default: 'https://images.unsplash.com/photo-1574359411659-15573a27fd0c?auto=format&fit=crop&w=800&q=80' },
    afterImg: { type: String, default: '' },
    galleryImages: [{ type: String }],

    // Testimonial
    testimonialQuote: { type: String, default: 'Good Interior understood our vision perfectly and turned our house into a beautiful, calm and functional home. We couldn\'t be happier!' },
    testimonialAuthor: { type: String, default: 'Mr. & Mrs. Perera' },
    testimonialRole: { type: String, default: 'Homeowners' },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
// trigger nodemon restart
