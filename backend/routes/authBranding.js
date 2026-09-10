const express = require('express');
const router = express.Router();
const AuthBranding = require('../models/AuthBranding');

// GET Auth Branding settings (Auto-seed default row if database is empty)
router.get('/', async (req, res) => {
    try {
        let branding = await AuthBranding.findOne();
        if (!branding) {
            branding = await AuthBranding.create({});
        }
        res.json(branding);
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
