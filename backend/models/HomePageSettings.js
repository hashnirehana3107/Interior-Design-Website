const mongoose = require('mongoose');

const homePageSettingsSchema = new mongoose.Schema({
    // About Section
    about: {
        kicker: { type: String, default: 'WHO WE ARE' },
        title: { type: String, default: 'We are a passionate<br />interior design studio.' },
        desc1: { type: String, default: 'At Good Interior, we believe that great design improves the way people live and work.' },
        desc2: { type: String, default: 'We blend creativity, functionality and detail to deliver spaces that are beautiful, comfortable and uniquely yours.' },
        buttonText: { type: String, default: 'ABOUT OUR STUDIO' },
        buttonLink: { type: String, default: '/about' },
        image: { type: String, default: '' },
    },
    // Why Choose Us Section
    whyChoose: {
        kicker: { type: String, default: 'WHY CHOOSE US' },
        title: { type: String, default: 'Because we care<br />about the details.' },
        features: [{
            iconName: { type: String, default: 'FaUserCheck' },
            title: { type: String },
            description: { type: String }
        }]
    }
}, { timestamps: true });

module.exports = mongoose.model('HomePageSettings', homePageSettingsSchema);
