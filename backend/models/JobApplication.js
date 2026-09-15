const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    position: { type: String, required: true },
    portfolioUrl: { type: String, default: '' },
    cvFile: { type: String, default: '' },
    cvFileName: { type: String, default: '' },
    userId: { type: String, default: '' },
    experience: { type: String, default: '' },
    message: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Reviewed', 'Contacted', 'Rejected'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JobApplication', JobApplicationSchema);
