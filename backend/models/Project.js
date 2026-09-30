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
    client: { type: String, default: '' },
    location: { type: String, default: 'Colombo, Sri Lanka' },
    year: { type: String, default: '2024' },
    area: { type: String, default: '' },
    status: { type: String, default: 'Completed', enum: ['Completed', 'In Progress', 'On Hold', 'Cancelled'] },

    // Details Page Info
    projectOverview: { type: String, default: '' },
    requirements: { type: [String], default: [] },
    designConcept: { type: String, default: '' },
    keyFeatures: { type: [String], default: [] },

    // Media & Gallery
    beforeImg: { type: String, default: '' },
    afterImg: { type: String, default: '' },
    galleryImages: [{ type: String }],

    // Testimonial
    testimonialQuote: { type: String, default: '' },
    testimonialAuthor: { type: String, default: '' },
    testimonialRole: { type: String, default: '' },

    createdAt: { type: Date, default: Date.now }
});

projectSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
// trigger nodemon restart
