const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email address is required'],
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    service: {
        type: String,
        required: [true, 'Service required field is mandatory'],
        default: 'Residential Interior Design'
    },
    budget: {
        type: String,
        default: '$10k - $25k'
    },
    date: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    status: {
        type: String,
        enum: ['Pending', 'Contacted', 'Confirmed', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    replyMessage: {
        type: String,
        default: null
    },
    repliedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Consultation', consultationSchema);
