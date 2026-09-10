const express = require('express');
const router = express.Router();
const HeroSlide = require('../models/HeroSlide');
const heroBg = '../assets/hero_bg.png'; // default ref identifier

// Initial seed slides if database is empty
const defaultHeroSlides = [
    {
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=85',
        kicker: 'YOUR DREAM SPACE AWAITS',
        title: 'Transform Your Home Into a Masterpiece',
        subtitle: 'From concept to completion, we guide you every step of the way to deliver your perfect living space.',
        order: 1,
        active: true
    },
    {
        image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=85',
        kicker: 'ELEGANT & FUNCTIONAL',
        title: 'Crafted Interiors Designed For Modern Living',
        subtitle: 'Experience bespoke interior designs tailored specifically to your lifestyle and personal aesthetic.',
        order: 2,
        active: true
    },
    {
        image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=85',
        kicker: 'LUXURY REDEFINED',
        title: 'Bespoke Architecture & Sophisticated Spaces',
        subtitle: 'Combining premium materials, gold accents, and architectural elegance for timeless interiors.',
        order: 3,
        active: true
    }
];

// @route   GET /api/hero-slides
// @desc    Get all active hero slides (with auto-seeding if empty)
// @access  Public
router.get('/', async (req, res) => {
    try {
        let slides = await HeroSlide.find({ active: true }).sort({ order: 1, createdAt: -1 });

        // Auto-seed if database has no slides yet
        if (slides.length === 0) {
            const count = await HeroSlide.countDocuments();
            if (count === 0) {
                await HeroSlide.insertMany(defaultHeroSlides);
                slides = await HeroSlide.find({ active: true }).sort({ order: 1, createdAt: -1 });
            }
        }

        res.status(200).json({ slides });
    } catch (error) {
        console.error('Fetch Hero Slides Error:', error);
        res.status(500).json({ message: 'Failed to fetch hero slides' });
    }
});

// @route   GET /api/hero-slides/admin/all
// @desc    Get ALL hero slides including inactive ones for Admin Dashboard
// @access  Public / Admin
router.get('/admin/all', async (req, res) => {
    try {
        let slides = await HeroSlide.find().sort({ order: 1, createdAt: -1 });
        if (slides.length === 0) {
            await HeroSlide.insertMany(defaultHeroSlides);
            slides = await HeroSlide.find().sort({ order: 1, createdAt: -1 });
        }
        res.status(200).json({ slides });
    } catch (error) {
        console.error('Fetch Admin Hero Slides Error:', error);
        res.status(500).json({ message: 'Failed to fetch hero slides' });
    }
});

// @route   POST /api/hero-slides
// @desc    Add a new hero slide
// @access  Admin
router.post('/', async (req, res) => {
    try {
        const { image, kicker, title, subtitle, order, active } = req.body;

        if (!image) {
            return res.status(400).json({ message: 'Hero slide image is required.' });
        }

        const newSlide = new HeroSlide({
            image,
            kicker: kicker || '',
            title: title || '',
            subtitle: subtitle || '',
            order: order !== undefined ? Number(order) : 0,
            active: active !== undefined ? Boolean(active) : true
        });

        await newSlide.save();
        console.log(`✅ [ADMIN HERO SLIDE ADDED] ID: ${newSlide._id}`);
        res.status(201).json({ message: 'Hero slide created successfully', slide: newSlide });
    } catch (error) {
        console.error('Create Hero Slide Error:', error);
        res.status(500).json({ message: 'Failed to create hero slide' });
    }
});

// @route   PUT /api/hero-slides/:id
// @desc    Update an existing hero slide
// @access  Admin
router.put('/:id', async (req, res) => {
    try {
        const { image, kicker, title, subtitle, order, active } = req.body;

        const updateFields = {};
        if (image !== undefined) updateFields.image = image;
        if (kicker !== undefined) updateFields.kicker = kicker;
        if (title !== undefined) updateFields.title = title;
        if (subtitle !== undefined) updateFields.subtitle = subtitle;
        if (order !== undefined) updateFields.order = Number(order);
        if (active !== undefined) updateFields.active = Boolean(active);

        const updatedSlide = await HeroSlide.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updatedSlide) {
            return res.status(404).json({ message: 'Hero slide not found' });
        }

        console.log(`✅ [ADMIN HERO SLIDE UPDATED] ID: ${updatedSlide._id}`);
        res.status(200).json({ message: 'Hero slide updated successfully', slide: updatedSlide });
    } catch (error) {
        console.error('Update Hero Slide Error:', error);
        res.status(500).json({ message: 'Failed to update hero slide' });
    }
});

// @route   DELETE /api/hero-slides/:id
// @desc    Delete a hero slide
// @access  Admin
router.delete('/:id', async (req, res) => {
    try {
        const slide = await HeroSlide.findByIdAndDelete(req.params.id);
        if (!slide) {
            return res.status(404).json({ message: 'Hero slide not found' });
        }

        console.log(`✅ [ADMIN HERO SLIDE DELETED] ID: ${req.params.id}`);
        res.status(200).json({ message: 'Hero slide deleted successfully' });
    } catch (error) {
        console.error('Delete Hero Slide Error:', error);
        res.status(500).json({ message: 'Failed to delete hero slide' });
    }
});

module.exports = router;
