const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema({
    image: {
        type: String,
        required: [true, 'Slide image is required']
    },
    kicker: {
        type: String,
        default: ''
    },
    title: {
        type: String,
        default: ''
    },
    subtitle: {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        default: 0
    },
    active: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('HeroSlide', heroSlideSchema);
