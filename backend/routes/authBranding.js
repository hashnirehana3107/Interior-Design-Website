const express = require('express');
const router = express.Router();
const AuthBranding = require('../models/AuthBranding');
const { getCache, setCache, clearCache } = require('../utils/cache');

// GET Auth Branding settings (Auto-seed default row if database is empty)
router.get('/', async (req, res) => {
    try {
        const cached = getCache('auth_branding');
        if (cached) return res.json(cached);

        let branding = await AuthBranding.findOne().lean();
        if (!branding) {
            branding = await AuthBranding.create({});
        }
        const payload = { branding };
        setCache('auth_branding', payload, 60);
        res.json(payload);
    } catch (err) {
        console.error('Error fetching auth branding settings:', err);
        res.status(500).json({ message: 'Server error fetching auth branding settings' });
    }
});

// PUT / Update Auth Branding settings
router.put('/', async (req, res) => {
    try {
        const { loginTitle, loginSubtitle, signupTitle, signupSubtitle, signupFeatures } = req.body;
        let branding = await AuthBranding.findOne();
        if (!branding) {
            branding = new AuthBranding({});
        }

        if (loginTitle !== undefined) branding.loginTitle = loginTitle;
        if (loginSubtitle !== undefined) branding.loginSubtitle = loginSubtitle;
        if (signupTitle !== undefined) branding.signupTitle = signupTitle;
        if (signupSubtitle !== undefined) branding.signupSubtitle = signupSubtitle;
        if (signupFeatures !== undefined) branding.signupFeatures = signupFeatures;

        await branding.save();
        res.json({ message: 'Auth branding updated successfully', branding });
    } catch (err) {
        console.error('Error updating auth branding settings:', err);
        res.status(500).json({ message: 'Server error updating auth branding settings' });
    }
});

module.exports = router;
