const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');
const TestiHero = require('../models/TestiHero');

// Seed default data matching the original frontend exactly
const defaultSeedData = [
    {
        category: 'RESIDENTIAL',
        image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80',
        quote: "Good Interior transformed our empty apartment into a warm and elegant home. Their attention to detail and professionalism exceeded our expectations.",
        name: "Sarah Thompson",
        role: "Homeowner • Colombo",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        isApproved: true
    },
    {
        category: 'COMMERCIAL',
        image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80',
        quote: "The team understood our vision perfectly and delivered a modern, functional office space that our employees love. Highly recommended!",
        name: "David Perera",
        role: "Office Manager • Tech Hub",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        isApproved: true
    },
    {
        category: 'BEDROOM',
        image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
        quote: "From concept to completion, the entire process was seamless. They created a luxurious bedroom retreat that feels like a 5-star hotel every day.",
        name: "Isabella Martinez",
        role: "Homeowner • Kandy",
        avatar: "https://randomuser.me/api/portraits/women/68.jpg",
        isApproved: true
    },
    {
        category: 'LIVING & DINING',
        image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80',
        quote: "Excellent creativity, great communication and outstanding results. Our dining space is now the heart of our home.",
        name: "Michael Silva",
        role: "Homeowner • Mount Lavinia",
        avatar: "https://randomuser.me/api/portraits/men/46.jpg",
        isApproved: true
    },
    {
        category: 'KITCHEN',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
        quote: "Our new open-plan gourmet kitchen is an absolute dream! The custom island and lighting choices completely elevated our culinary space.",
        name: "Samantha Reed",
        role: "Homeowner • Negombo",
        avatar: "https://randomuser.me/api/portraits/women/33.jpg",
        isApproved: true
    },
    {
        category: 'RENOVATION',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
        quote: "Renovating our 40-year-old family bungalow felt daunting until Good Interior stepped in. They preserved the heritage character while introducing modern luxury.",
        name: "Robert Vance",
        role: "Heritage Villa Owner • Galle",
        avatar: "https://randomuser.me/api/portraits/men/54.jpg",
        isApproved: true
    },
    {
        category: 'RESIDENTIAL',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
        quote: "The spatial planning and custom furniture selection transformed our penthouse into a magazine-worthy luxury space. We couldn't be happier!",
        name: "Emma Watson",
        role: "Penthouse Owner • Rajagiriya",
        avatar: "https://randomuser.me/api/portraits/women/52.jpg",
        isApproved: true
    },
    {
        category: 'COMMERCIAL',
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80',
        quote: "Good Interior designed our boutique hotel lobby and executive suites. The positive guest reviews regarding our interior aesthetic speak for themselves.",
        name: "Marcus Brody",
        role: "Boutique Hotel Director • Bentota",
        avatar: "https://randomuser.me/api/portraits/men/62.jpg",
        isApproved: true
    }
];

async function ensureSeedData() {
    try {
        const count = await Testimonial.countDocuments();
        if (count === 0) {
            console.log('Seeding initial testimonials data...');
            await Testimonial.insertMany(defaultSeedData);
        }

        const heroCount = await TestiHero.countDocuments();
        if (heroCount === 0) {
            await TestiHero.create({});
        }
    } catch (err) {
        console.error('Error seeding testimonials data:', err);
    }
}

// ── GET HERO ──
router.get('/hero', async (req, res) => {
    try {
        await ensureSeedData();
        let hero = await TestiHero.findOne();
        res.status(200).json(hero);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching hero', error: err.message });
    }
});

// ── PUT HERO ──
router.put('/hero', async (req, res) => {
    try {
        let hero = await TestiHero.findOne();
        if (!hero) {
            hero = new TestiHero(req.body);
        } else {
            Object.assign(hero, req.body);
        }
        await hero.save();
        res.status(200).json({ message: 'Hero updated successfully', hero });
    } catch (err) {
        res.status(500).json({ message: 'Error updating hero', error: err.message });
    }
});

// ── GET PUBLIC TESTIMONIALS (For Display Mode - Approved Only) ──
router.get('/public', async (req, res) => {
    try {
        await ensureSeedData();
        const t = await Testimonial.find({ isApproved: true }).sort({ createdAt: -1 });
        res.status(200).json(t);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching testimonials', error: err.message });
    }
});

// ── GET TESTIMONIALS (For Display Mode - Reverse Chronological) ──
router.get('/', async (req, res) => {
    try {
        await ensureSeedData();
        const t = await Testimonial.find().sort({ createdAt: -1 });
        res.status(200).json(t);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching testimonials', error: err.message });
    }
});

// ── POST TESTIMONIAL (Admin or User Review) ──
router.post('/', async (req, res) => {
    try {
        const { category, image, quote, name, role, avatar, stars, isApproved } = req.body;
        if (!quote || !name) {
            return res.status(400).json({ message: 'Name and quote are required.' });
        }

        const newT = new Testimonial({
            category: category || 'RESIDENTIAL',
            image: image || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80',
            quote,
            name,
            role: role || 'Valued Client',
            avatar: avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
            stars: stars || 5,
            isApproved: isApproved !== undefined ? isApproved : false // Default to false unless explicitly approved (e.g. by admin)
        });

        await newT.save();
        res.status(201).json({ message: 'Testimonial created successfully', testimonial: newT });
    } catch (err) {
        res.status(500).json({ message: 'Error creating testimonial', error: err.message });
    }
});

// ── PUT TESTIMONIAL (Admin update) ──
router.put('/:id', async (req, res) => {
    try {
        const updated = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'Not found' });
        res.status(200).json({ message: 'Updated successfully', testimonial: updated });
    } catch (err) {
        res.status(500).json({ message: 'Error updating', error: err.message });
    }
});

// ── DELETE TESTIMONIAL (Admin delete) ──
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Testimonial.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Not found' });
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting', error: err.message });
    }
});

module.exports = router;
