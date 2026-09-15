const mongoose = require('mongoose');

const CareersHeroSchema = new mongoose.Schema({
    kicker: { type: String, default: 'JOIN OUR TEAM' },
    title: { type: String, default: 'Build Your Career in Interior Design' },
    description: { type: String, default: "We're always looking for passionate, creative and talented individuals to join our team. If you love design and want to make a difference, we'd love to hear from you." },
    bgImage: { type: String, default: '' },

    // About Our Team Section
    aboutKicker: { type: String, default: 'ABOUT OUR TEAM' },
    aboutTitle: { type: String, default: 'Great People Build Great Spaces' },
    aboutDesc: { type: String, default: 'At Good Interior, we believe that a strong team creates extraordinary results. We foster a collaborative, creative and supportive work environment where your ideas matter and your growth is our priority.' },
    aboutImage: { type: String, default: '' },
    aboutF1: { type: String, default: 'Creative Environment' },
    aboutF2: { type: String, default: 'Professional Growth' },
    aboutF3: { type: String, default: 'Collaborative Team' },
    aboutF4: { type: String, default: 'Meaningful Impact' },

    // Why Work With Us Section
    whyKicker: { type: String, default: 'WHY WORK WITH US' },
    whyTitle: { type: String, default: 'More Than a Job' },
    whySubtitle: { type: String, default: "It's a Place to Grow" },
    whyBgImage: { type: String, default: '' },
    whyB1Title: { type: String, default: 'Competitive Salary & Benefits' },
    whyB2Title: { type: String, default: 'Learning & Development' },
    whyB3Title: { type: String, default: 'Supportive Team Culture' },
    whyB4Title: { type: String, default: 'Work-Life Balance' },

    // Ready To Join / CTA Section
    ctaKicker: { type: String, default: 'READY TO JOIN?' },
    ctaTitle: { type: String, default: "Let's Build Something Beautiful Together" },
    ctaDescription: { type: String, default: "If you're passionate about interior design and want to be part of a creative team, we'd love to hear from you." },
    ctaImage: { type: String, default: '' },
    ctaButtonText: { type: String, default: 'APPLY NOW' },
    ctaQuote: { type: String, default: `"At Good Interior, we don't just design spaces — we create experiences. And we're always looking for great people to help us do it."` },
    ctaQuoteAuthor: { type: String, default: 'OUR TEAM' },

    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CareersHero', CareersHeroSchema);
