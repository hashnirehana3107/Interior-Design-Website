const express = require('express');
const router = express.Router();
const About = require('../models/About');

// Seed default data matching existing UI
const defaultSeedData = {
    achievements: [
        { icon: 'BiCalendarStar', value: '9+', label: 'Years of Experience' },
        { icon: 'HiOutlineUserGroup', value: '250+', label: 'Projects Completed' },
        { icon: 'BiTrophy', value: '30+', label: 'Awards & Recognition' },
        { icon: 'BiSmile', value: '98%', label: 'Client Satisfaction' },
        { icon: 'VscWorkspaceTrusted', value: '3', label: 'Countries Served' }
    ]
};

const getAboutData = async () => {
    let doc = await About.findOne();
    if (!doc) {
        doc = new About(defaultSeedData);
        await doc.save();
    }
    return doc;
};

// GET single about data
router.get('/', async (req, res) => {
    try {
        const data = await getAboutData();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching about data.' });
    }
});

// PUT update about sections
router.put('/', async (req, res) => {
    try {
        let doc = await getAboutData();

        // Merge updates
        if (req.body.heroInfo) doc.heroInfo = { ...doc.heroInfo, ...req.body.heroInfo };
        if (req.body.whoWeAre) doc.whoWeAre = { ...doc.whoWeAre, ...req.body.whoWeAre };
        if (req.body.purpose) doc.purpose = { ...doc.purpose, ...req.body.purpose };
        if (req.body.achievements) doc.achievements = req.body.achievements;
        if (req.body.philosophy) doc.philosophy = { ...doc.philosophy, ...req.body.philosophy };
        if (req.body.team) doc.team = { ...doc.team, ...req.body.team };

        await doc.save();
        res.json(doc);
    } catch (err) {
        res.status(500).json({ error: 'Server error updating about data.' });
    }
});

module.exports = router;
