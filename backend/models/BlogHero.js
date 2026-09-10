const mongoose = require('mongoose');

const blogHeroSchema = new mongoose.Schema({
    kicker: {
        type: String,
        default: 'OUR BLOG'
    },
    title: {
        type: String,
        default: 'Ideas, Inspiration & Interior Tips'
    },
    subtitle: {
        type: String,
        default: 'Explore expert advice, design trends, and creative ideas to help you create beautiful, functional spaces.'
    },
    bgImage: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('BlogHero', blogHeroSchema);
