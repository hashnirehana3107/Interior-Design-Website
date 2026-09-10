const express = require('express');
const router = express.Router();
const ContactPageSettings = require('../models/ContactPageSettings');

// Helper: get or create singleton settings document
const getSettings = async () => {
    let settings = await ContactPageSettings.findOne();
    if (!settings) {
        settings = await ContactPageSettings.create({});
    } else {
        // If mongoose generated dynamic defaults in-memory because they were missing in the physical DB document,
        // we must save them so their ObjectIds become permanent instead of regenerating on every request.
        let needsSave = false;
        if (!settings.get('features', null, { getters: false })) {
            settings.markModified('features');
            needsSave = true;
        }
        if (needsSave) {
            await settings.save();
        }
    }
    return settings;
};

// @route   GET /api/contact-settings
// @desc    Get contact page settings (hero, contact info, map, journey, features)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const settings = await getSettings();
        res.status(200).json({ settings });
    } catch (error) {
        console.error('Get Contact Settings Error:', error);
        res.status(500).json({ message: 'Failed to fetch contact page settings.' });
    }
});

// @route   PUT /api/contact-settings/hero
// @desc    Update hero section
// @access  Admin
router.put('/hero', async (req, res) => {
    try {
        const settings = await getSettings();
        settings.hero = { ...settings.hero.toObject(), ...req.body };
        await settings.save();
        console.log('✅ Contact page hero updated successfully.');
        res.status(200).json({ message: 'Hero updated successfully', settings });
    } catch (error) {
        console.error('Update Contact Hero Error:', error);
        res.status(500).json({ message: 'Failed to update hero settings.' });
    }
});

// @route   PUT /api/contact-settings/info
// @desc    Update contact information
// @access  Admin
router.put('/info', async (req, res) => {
    try {
        const settings = await getSettings();
        settings.contactInfo = { ...settings.contactInfo.toObject(), ...req.body };
        await settings.save();
        console.log('✅ Contact page info updated successfully.');
        res.status(200).json({ message: 'Contact info updated successfully', settings });
    } catch (error) {
        console.error('Update Contact Info Error:', error);
        res.status(500).json({ message: 'Failed to update contact info.' });
    }
});

// @route   PUT /api/contact-settings/map
// @desc    Update map location
// @access  Admin
router.put('/map', async (req, res) => {
    try {
        const settings = await getSettings();
        settings.map = { ...settings.map.toObject(), ...req.body };
        await settings.save();
        console.log('✅ Contact page map updated successfully.');
        res.status(200).json({ message: 'Map settings updated successfully', settings });
    } catch (error) {
        console.error('Update Map Settings Error:', error);
        res.status(500).json({ message: 'Failed to update map settings.' });
    }
});

// @route   PUT /api/contact-settings/journey
// @desc    Update Follow Our Journey section (title, description, socialLinks, images)
// @access  Admin
router.put('/journey', async (req, res) => {
    try {
        const settings = await getSettings();
        const { title, description, socialLinks, images } = req.body;

        if (title !== undefined) settings.journey.title = title;
        if (description !== undefined) settings.journey.description = description;
        if (images !== undefined) settings.journey.images = images;
        if (socialLinks !== undefined) {
            settings.journey.socialLinks.facebook = socialLinks.facebook || '';
            settings.journey.socialLinks.instagram = socialLinks.instagram || '';
            settings.journey.socialLinks.pinterest = socialLinks.pinterest || '';
            settings.journey.socialLinks.linkedin = socialLinks.linkedin || '';
        }

        settings.markModified('journey');
        await settings.save();
        console.log('✅ Contact page journey section updated successfully.');
        res.status(200).json({ message: 'Journey section updated successfully', settings });
    } catch (error) {
        console.error('Update Journey Settings Error:', error);
        res.status(500).json({ message: 'Failed to update journey settings.' });
    }
});

// ── Features Strip (Why Choose Us) ──

// @route   GET /api/contact-settings/features
// @desc    Get all feature items
// @access  Public
router.get('/features', async (req, res) => {
    try {
        const settings = await getSettings();
        // If features is empty, seed defaults
        if (!settings.features || settings.features.length === 0) {
            settings.features = [
                { iconName: 'home', title: 'Personalized Approach', description: 'We listen, understand and design spaces that reflect your lifestyle.', order: 1 },
                { iconName: 'team', title: 'Experienced Team', description: 'Our creative team brings years of expertise and passion to every project.', order: 2 },
                { iconName: 'quality', title: 'Quality & Trust', description: 'We use premium materials and ensure quality in every detail.', order: 3 },
                { iconName: 'clock', title: 'On-time Delivery', description: 'We value your time and deliver projects as promised.', order: 4 }
            ];
            settings.markModified('features');
            await settings.save();
        }
        const sorted = [...settings.features].sort((a, b) => (a.order || 0) - (b.order || 0));
        res.status(200).json({ features: sorted });
    } catch (error) {
        console.error('Get Features Error:', error);
        res.status(500).json({ message: 'Failed to fetch features.' });
    }
});

// @route   POST /api/contact-settings/features
// @desc    Add a new feature item
// @access  Admin
router.post('/features', async (req, res) => {
    try {
        const settings = await getSettings();
        const { iconName, title, description, order } = req.body;
        if (!title) return res.status(400).json({ message: 'Title is required.' });

        const maxOrder = settings.features.reduce((max, f) => Math.max(max, f.order || 0), 0);
        settings.features.push({
            iconName: iconName || 'home',
            title,
            description: description || '',
            order: order || maxOrder + 1
        });
        settings.markModified('features');
        await settings.save();
        console.log('✅ Feature item added.');
        const sorted = [...settings.features].sort((a, b) => (a.order || 0) - (b.order || 0));
        res.status(201).json({ message: 'Feature added successfully', features: sorted });
    } catch (error) {
        console.error('Add Feature Error:', error);
        res.status(500).json({ message: 'Failed to add feature.' });
    }
});

// @route   PUT /api/contact-settings/features/:featureId
// @desc    Update a feature item
// @access  Admin
router.put('/features/:featureId', async (req, res) => {
    try {
        const settings = await getSettings();
        const feature = settings.features.id(req.params.featureId);
        if (!feature) return res.status(404).json({ message: 'Feature not found.' });

        const { iconName, title, description, order } = req.body;
        if (iconName !== undefined) feature.iconName = iconName;
        if (title !== undefined) feature.title = title;
        if (description !== undefined) feature.description = description;
        if (order !== undefined) feature.order = order;

        settings.markModified('features');
        await settings.save();
        console.log('✅ Feature item updated.');
        const sorted = [...settings.features].sort((a, b) => (a.order || 0) - (b.order || 0));
        res.status(200).json({ message: 'Feature updated successfully', features: sorted });
    } catch (error) {
        console.error('Update Feature Error:', error);
        res.status(500).json({ message: 'Failed to update feature.' });
    }
});

// @route   DELETE /api/contact-settings/features/:featureId
// @desc    Delete a feature item
// @access  Admin
router.delete('/features/:featureId', async (req, res) => {
    try {
        const settings = await getSettings();
        const feature = settings.features.id(req.params.featureId);
        if (!feature) return res.status(404).json({ message: 'Feature not found.' });

        feature.deleteOne();
        settings.markModified('features');
        await settings.save();
        console.log('✅ Feature item deleted.');
        const sorted = [...settings.features].sort((a, b) => (a.order || 0) - (b.order || 0));
        res.status(200).json({ message: 'Feature deleted successfully', features: sorted });
    } catch (error) {
        console.error('Delete Feature Error:', error);
        res.status(500).json({ message: 'Failed to delete feature.' });
    }
});

module.exports = router;
