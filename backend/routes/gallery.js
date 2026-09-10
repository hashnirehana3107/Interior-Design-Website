const express = require('express');
const router = express.Router();
const GalleryItem = require('../models/GalleryItem');
const GalleryHero = require('../models/GalleryHero');

const initialGalleryItems = [
    { order: 1, type: 'living', src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', shape: 'tall', title: 'Luxury Living Room' },
    { order: 2, type: 'kitchen', src: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80', shape: 'standard', title: 'Modern Kitchen' },
    { order: 3, type: 'bedroom', src: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80', shape: 'standard', title: 'Master Bedroom Suite' },
    { order: 4, type: 'dining', src: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80', shape: 'standard', title: 'Wooden Dining Area' },
    { order: 5, type: 'dining', src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80', shape: 'standard', title: 'Contemporary Dining' },
    { order: 6, type: 'outdoor', src: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=600&q=80', shape: 'wide', title: 'Patio & Garden Terrace' },
    { order: 7, type: 'commercial', src: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=600&q=80', shape: 'wide', title: 'Modern Commercial Office' },
    { order: 8, type: 'living', src: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80', shape: 'standard', title: 'Minimalist Living Space' },
    { order: 9, type: 'commercial', src: 'https://images.unsplash.com/photo-1497215842811-94de0e02410a?auto=format&fit=crop&w=600&q=80', shape: 'standard', title: 'Executive Workspace' },
    { order: 10, type: 'living', src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80', shape: 'wide', title: 'Luxury Penthouse Living' },
    { order: 11, type: 'bathroom', src: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80', shape: 'standard', title: 'Marble Bathroom Sanctuary' }
];

const defaultHero = {
    kicker: 'OUR GALLERY',
    title: 'A Collection of',
    highlightTitle: 'Beautiful Spaces',
    subtitle: 'Explore our gallery of stunning interior designs that blend creativity, functionality and timeless elegance.',
    heroBg: ''
};

// ── GET HERO SETTINGS ──
router.get('/hero', async (req, res) => {
    try {
        let hero = await GalleryHero.findOne();
        if (!hero) {
            hero = await GalleryHero.create(defaultHero);
        }
        res.status(200).json({ hero });
    } catch (error) {
        console.error('Fetch Gallery Hero Error:', error);
        res.status(500).json({ message: 'Failed to fetch gallery hero settings' });
    }
});

// ── UPDATE HERO SETTINGS ──
router.put('/hero', async (req, res) => {
    try {
        const { kicker, title, highlightTitle, subtitle, heroBg } = req.body;
        let hero = await GalleryHero.findOne();
        if (!hero) {
            hero = new GalleryHero({ kicker, title, highlightTitle, subtitle, heroBg });
        } else {
            if (kicker !== undefined) hero.kicker = kicker;
            if (title !== undefined) hero.title = title;
            if (highlightTitle !== undefined) hero.highlightTitle = highlightTitle;
            if (subtitle !== undefined) hero.subtitle = subtitle;
            if (heroBg !== undefined) hero.heroBg = heroBg;
        }
        await hero.save();
        res.status(200).json({ message: 'Gallery hero settings updated successfully', hero });
    } catch (error) {
        console.error('Update Gallery Hero Error:', error);
        res.status(500).json({ message: 'Failed to update gallery hero settings' });
    }
});

// ── GET ALL GALLERY ITEMS ──
router.get('/items', async (req, res) => {
    try {
        let items = await GalleryItem.find().sort({ order: 1, createdAt: 1 });
        if (items.length === 0) {
            await GalleryItem.insertMany(initialGalleryItems);
            items = await GalleryItem.find().sort({ order: 1, createdAt: 1 });
        }
        res.status(200).json({ items });
    } catch (error) {
        console.error('Fetch Gallery Items Error:', error);
        res.status(500).json({ message: 'Failed to fetch gallery items' });
    }
});

// ── CREATE GALLERY ITEM ──
router.post('/items', async (req, res) => {
    try {
        const { title, type, src, shape, order } = req.body;
        if (!src) {
            return res.status(400).json({ message: 'Image source URL or Base64 is required.' });
        }
        const newItem = new GalleryItem({
            title: title || '',
            type: type || 'living',
            src,
            shape: shape || 'standard',
            order: order ? Number(order) : 0
        });
        await newItem.save();
        res.status(201).json({ message: 'Gallery item created successfully', item: newItem });
    } catch (error) {
        console.error('Create Gallery Item Error:', error);
        res.status(500).json({ message: 'Failed to create gallery item' });
    }
});

// ── UPDATE GALLERY ITEM ──
router.put('/items/:id', async (req, res) => {
    try {
        const updatedItem = await GalleryItem.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!updatedItem) return res.status(404).json({ message: 'Gallery item not found' });
        res.status(200).json({ message: 'Gallery item updated successfully', item: updatedItem });
    } catch (error) {
        console.error('Update Gallery Item Error:', error);
        res.status(500).json({ message: 'Failed to update gallery item' });
    }
});

// ── DELETE GALLERY ITEM ──
router.delete('/items/:id', async (req, res) => {
    try {
        const item = await GalleryItem.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: 'Gallery item not found' });
        res.status(200).json({ message: 'Gallery item deleted successfully' });
    } catch (error) {
        console.error('Delete Gallery Item Error:', error);
        res.status(500).json({ message: 'Failed to delete gallery item' });
    }
});

module.exports = router;
