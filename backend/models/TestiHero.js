const mongoose = require('mongoose');

const testiHeroSchema = new mongoose.Schema({
    kicker: {
        type: String,
        default: 'TESTIMONIALS'
    },
    title: {
        type: String,
        default: 'Trusted By Clients.<br /><span class="gold-text-italic">Loved</span> For Our Work.'
    },
    subtitle: {
        type: String,
        default: 'We take pride in creating spaces that inspire<br />and relationships that last.'
    },
    bgImage: {
        type: String,
        default: '' // default relies on frontend import if empty
    },
    quoteText: {
        type: String,
        default: 'Design is not just what it looks like and feels like.<br />Design is how it works.'
    },
    quoteAuthor: {
        type: String,
        default: '– Steve Jobs'
    },
    quoteImage: {
        type: String,
        default: '' // default relies on frontend import if empty
    },
    statRating: {
        type: String,
        default: '4.9'
    },
    statClients: {
        type: String,
        default: '120+'
    },
    statProjects: {
        type: String,
        default: '150+'
    },
    statSatisfaction: {
        type: String,
        default: '98%'
    }
}, { timestamps: true });

module.exports = mongoose.model('TestiHero', testiHeroSchema);
