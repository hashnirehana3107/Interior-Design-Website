const mongoose = require('mongoose');

const galleryHeroSchema = new mongoose.Schema({
    kicker: {
        type: String,
        default: 'OUR GALLERY'
    },
    title: {
        type: String,
        default: 'A Collection of'
    },
    highlightTitle: {
        type: String,
        default: 'Beautiful Spaces'
    },
    subtitle: {
        type: String,
        default: 'Explore our gallery of stunning interior designs that blend creativity, functionality and timeless elegance.'
    },
    heroBg: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('GalleryHero', galleryHeroSchema);
