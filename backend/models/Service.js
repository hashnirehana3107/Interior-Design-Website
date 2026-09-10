const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    serviceId: {
        type: String,
        default: ''
    },
    title: {
        type: String,
        required: [true, 'Service title is required']
    },
    kicker: {
        type: String,
        default: 'OUR SERVICE'
    },
    desc: {
        type: String,
        default: ''
    },
    fullDesc: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    images: {
        type: [String],
        default: []
    },
    iconName: {
        type: String,
        default: 'sofa'
    },
    highlights: {
        type: [String],
        default: []
    },
    deliverables: {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
