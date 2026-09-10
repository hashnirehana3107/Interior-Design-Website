const mongoose = require('mongoose');

const portfolioHeroSchema = new mongoose.Schema({
    kicker: { type: String, default: 'OUR PORTFOLIO' },
    title: { type: String, default: 'Spaces We\'ve Designed<br /><span class="gold-text">Stories We\'re Proud Of.</span>' },
    subtitle: { type: String, default: 'Explore a selection of our completed projects that<br />reflect creativity, functionality and timeless design.' },
    bgImage: { type: String, default: '' }
});

module.exports = mongoose.model('PortfolioHero', portfolioHeroSchema);
