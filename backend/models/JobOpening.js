const mongoose = require('mongoose');

const JobOpeningSchema = new mongoose.Schema({
    title: { type: String, required: true },
    department: { type: String, default: 'Design Studio' },
    type: { type: String, default: 'Full-time' },
    location: { type: String, default: 'Colombo, Sri Lanka' },
    experience: { type: String, default: '2 - 4 Years Experience' },
    salaryRange: { type: String, default: 'Competitive / Negotiable' },
    overview: { type: String, default: '' },
    responsibilities: [{ type: String }],
    requirements: [{ type: String }],
    benefits: [{ type: String }],
    icon: { type: String, default: 'design' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JobOpening', JobOpeningSchema);
