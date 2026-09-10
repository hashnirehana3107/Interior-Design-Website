const express = require('express');
const router = express.Router();
const HomePageSettings = require('../models/HomePageSettings');

// Default mock data
const defaultSettings = {
    about: {
        kicker: 'WHO WE ARE',
        title: 'We are a passionate\ninterior design studio.',
        desc1: 'At Good Interior, we believe that great design improves the way people live and work.',
        desc2: 'We blend creativity, functionality and detail to deliver spaces that are beautiful, comfortable and uniquely yours.',
        buttonText: 'ABOUT OUR STUDIO',
        buttonLink: '/about',
        image: ''
    },
    whyChoose: {
        kicker: 'WHY CHOOSE US',
        title: 'Because we care\nabout the details.',
        features: [
            { iconName: 'FaUserCheck', title: 'Personalized Approach', description: 'We listen, understand and design spaces that reflect your lifestyle.' },
            { iconName: 'FaRegBuilding', title: 'Experienced Team', description: 'Our creative team brings years of expertise and passion to every project.' },
            { iconName: 'FaGem', title: 'Quality & Trust', description: 'We use premium materials and ensure quality in every detail.' },
            { iconName: 'FaRegClock', title: 'On-time Delivery', description: 'We value your time and deliver projects as promised.' }
        ]
    }
};

// Get settings
router.get('/', async (req, res) => {
    try {
        let settings = await HomePageSettings.findOne();
        if (!settings) {
            settings = await HomePageSettings.create(defaultSettings);
        } else if (!settings.about || !settings.about.title) {
            // Document exists but empty fields, populate it
            settings.about = defaultSettings.about;
            settings.whyChoose = defaultSettings.whyChoose;
            await settings.save();
        }
        res.json({ settings });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update settings
router.put('/', async (req, res) => {
    try {
        const { about, whyChoose } = req.body;
        let settings = await HomePageSettings.findOne();
        if (!settings) {
            settings = new HomePageSettings();
        }

        if (about) settings.about = about;
        if (whyChoose) settings.whyChoose = whyChoose;

        await settings.save();
        res.json({ message: 'Home Page Settings updated successfully', settings });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
