const express = require('express');
const router = express.Router();
const GlobalSettings = require('../models/GlobalSettings');
const { getCache, setCache, clearCache } = require('../utils/cache');

// GET Global Settings (Auto-seeds default row if database is empty)
router.get('/', async (req, res) => {
    try {
        const cached = getCache('global_settings');
        if (cached) return res.json(cached);

        let settings = await GlobalSettings.findOne().lean();
        if (!settings) {
            settings = await GlobalSettings.create({});
        }
        const payload = { settings };
        setCache('global_settings', payload, 60);
        res.json(payload);
    } catch (err) {
        console.error('Error fetching global settings:', err);
        res.status(500).json({ message: 'Server error fetching global settings' });
    }
});

// PUT / Update Global Settings
router.put('/', async (req, res) => {
    try {
        const { logoUrl, siteTitle, siteSubtitle, footerDesc, footerCopyright } = req.body;
        let settings = await GlobalSettings.findOne();
        if (!settings) {
            settings = new GlobalSettings({});
        }

        if (logoUrl !== undefined) settings.logoUrl = logoUrl;
        if (siteTitle !== undefined) settings.siteTitle = siteTitle;
        if (siteSubtitle !== undefined) settings.siteSubtitle = siteSubtitle;
        if (footerDesc !== undefined) settings.footerDesc = footerDesc;
        if (footerCopyright !== undefined) settings.footerCopyright = footerCopyright;

        await settings.save();
        clearCache('global_settings');
        res.json({ message: 'Global settings updated successfully', settings });
    } catch (err) {
        console.error('Error updating global settings:', err);
        res.status(500).json({ message: 'Server error updating global settings' });
    }
});

module.exports = router;
