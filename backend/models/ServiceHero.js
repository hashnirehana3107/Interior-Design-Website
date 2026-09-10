const mongoose = require('mongoose');

const serviceHeroSchema = new mongoose.Schema({
    kicker: {
        type: String,
        default: 'OUR SERVICES'
    },
    title: {
        type: String,
        default: 'Comprehensive <br /><span class="highlight-text">Interior Design</span> Services'
    },
    subtitle: {
        type: String,
        default: 'From concept to completion, we offer a full range of interior design services tailored to your unique needs.'
    },
    bgImage: {
        type: String,
        default: ''
    },
    offerKicker: {
        type: String,
        default: 'WHAT WE OFFER'
    },
    offerTitle: {
        type: String,
        default: 'Our Interior Design Services'
    },
    offerDesc: {
        type: String,
        default: 'We provide end-to-end interior design solutions, combining creativity, functionality and attention to detail to create spaces that truly feel like home.'
    },
    processKicker: {
        type: String,
        default: 'OUR PROCESS'
    },
    processTitle: {
        type: String,
        default: 'A Simple & Transparent Process'
    },
    processDesc: {
        type: String,
        default: 'We follow a structured process to ensure a smooth, enjoyable and successful design experience.'
    },
    whyKicker: {
        type: String,
        default: 'WHY CHOOSE US'
    },
    whyTitle: {
        type: String,
        default: 'More Than Design.<br />A Better Way of Living.'
    },
    whyDesc: {
        type: String,
        default: 'We combine creativity, expertise and a client-focused approach to deliver interiors that inspire and endure.'
    },
    whyImage: {
        type: String,
        default: '/src/assets/about_img.png'
    },
    whyQuote: {
        type: String,
        default: 'Good design creates spaces where life happens beautifully.'
    },
    whyQuoteAuthor: {
        type: String,
        default: 'GOOD INTERIOR DESIGN STUDIO'
    }
}, { timestamps: true });

module.exports = mongoose.model('ServiceHero', serviceHeroSchema);
