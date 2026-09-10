const mongoose = require('mongoose');

const globalSettingsSchema = new mongoose.Schema({
    logoUrl: {
        type: String,
        default: ''
    },
    siteTitle: {
        type: String,
        default: 'GOOD INTERIOR'
    },
    siteSubtitle: {
        type: String,
        default: 'DESIGN STUDIO'
    },
    footerDesc: {
        type: String,
        default: 'We design thoughtful interiors that inspire and elevate the way you live. Creative space planning, luxury architecture, and bespoke styling.'
    },
    footerCopyright: {
        type: String,
        default: '© 2025 Good Interior. All Rights Reserved.'
    }
}, { timestamps: true });

module.exports = mongoose.model('GlobalSettings', globalSettingsSchema);
