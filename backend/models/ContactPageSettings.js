const mongoose = require('mongoose');

const featureItemSchema = new mongoose.Schema({
    iconName: { type: String, default: 'home' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 }
}, { _id: true });

const contactPageSettingsSchema = new mongoose.Schema({
    // Hero Section
    hero: {
        kicker: { type: String, default: 'GET IN TOUCH' },
        title: { type: String, default: "Let's Design a Space" },
        highlightText: { type: String, default: "You'll Love." },
        subtitle: { type: String, default: "We'd love to hear about your project. Reach out to us for a consultation or any questions you may have." },
        heroBg: { type: String, default: '' }
    },
    // Contact Information
    contactInfo: {
        address: { type: String, default: '123 Design Street, Colombo 05, Sri Lanka' },
        phone1: { type: String, default: '+94 77 123 4567' },
        phone2: { type: String, default: '+94 11 234 5678' },
        email1: { type: String, default: 'hello@goodinterior.lk' },
        email2: { type: String, default: 'info@goodinterior.lk' },
        hoursWeekday: { type: String, default: '9:00 AM - 6:00 PM' },
        hoursSaturday: { type: String, default: '10:00 AM - 2:00 PM' },
        hoursSunday: { type: String, default: 'Closed' }
    },
    // Map Location
    map: {
        latitude: { type: Number, default: 6.8921 },
        longitude: { type: Number, default: 79.8612 },
        label: { type: String, default: 'Good Interior Design Studio' },
        address: { type: String, default: '123 Design Street, Colombo 05, Sri Lanka' }
    },
    // Follow Our Journey Section
    journey: {
        title: { type: String, default: 'FOLLOW OUR JOURNEY' },
        description: { type: String, default: 'Get inspired by our latest projects, behind-the-scenes and design tips.' },
        socialLinks: {
            facebook: { type: String, default: '' },
            instagram: { type: String, default: '' },
            pinterest: { type: String, default: '' },
            linkedin: { type: String, default: '' }
        },
        images: [{ type: String }]
    },
    // Why Choose Us Features Strip
    features: {
        type: [featureItemSchema],
        default: [
            { iconName: 'home', title: 'Personalized Approach', description: 'We listen, understand and design spaces that reflect your lifestyle.', order: 1 },
            { iconName: 'team', title: 'Experienced Team', description: 'Our creative team brings years of expertise and passion to every project.', order: 2 },
            { iconName: 'quality', title: 'Quality & Trust', description: 'We use premium materials and ensure quality in every detail.', order: 3 },
            { iconName: 'clock', title: 'On-time Delivery', description: 'We value your time and deliver projects as promised.', order: 4 }
        ]
    }
}, { timestamps: true });

module.exports = mongoose.model('ContactPageSettings', contactPageSettingsSchema);
