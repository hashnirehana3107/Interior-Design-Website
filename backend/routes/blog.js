const express = require('express');
const router = express.Router();
const BlogHero = require('../models/BlogHero');
const BlogPost = require('../models/BlogPost');

// Initial default articles to seed if database is empty
const defaultSeedArticles = [
    {
        badge: 'INTERIOR TRENDS',
        date: 'MAY 20, 2025',
        readTime: '6 MIN READ',
        title: 'Top Interior Design Trends 2025 That Will Transform Your Space',
        desc: 'Discover the top interior design trends of 2025 that combine aesthetics with functionality to create timeless and elegant spaces.',
        img: 'https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=1000&q=80',
        author: 'Sarah Thompson',
        authorRole: 'Interior Designer',
        authorImg: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
        authorBio: "Sarah is an interior designer with over 10 years of experience creating beautiful and functional spaces that reflect her clients' lifestyle and personality.",
        content: `As we step into 2025, interior design continues to evolve — blending elegance with functionality, nature with modern living. This year's trends focus on creating spaces that are not only beautiful but also meaningful and sustainable.

Whether you're planning a full home transformation or just refreshing a room, these top interior design trends will inspire you to create a space that truly feels like home.

## 1. Warm Neutrals Take Center Stage
Beige, taupe, terracotta and soft browns are dominating palettes in 2025. These tones bring warmth, comfort and a timeless look to any space.
Warm neutrals create a calming backdrop that allows textures and natural materials to shine.

## 2. Natural Materials & Organic Textures
From raw wood and stone to linen and clay finishes, natural materials add depth and authenticity to interiors.
These organic elements create a connection to nature and bring a sense of tranquility indoors.

## 3. Statement Lighting
Lighting in 2025 is more than just functional — it's sculptural. Oversized pendants, artistic chandeliers and layered lighting bring personality and drama to any room.
The right lighting can completely transform the mood and elevate your space.

2025 is all about creating spaces that are warm, natural, functional and uniquely yours.`,
        tags: ['Interior Trends', 'Modern Home', 'Luxury', 'Decor'],
        isFeatured: true,
        isPopular: false,
        order: 1
    },
    {
        badge: 'DESIGN TIPS',
        date: 'MAY 18, 2025',
        readTime: '5 MIN READ',
        title: '10 Tips for a Timeless Dining Room Design',
        desc: 'Simple tips to create a dining room that stays stylish and inviting for years to come.',
        img: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80',
        author: 'Sarah Thompson',
        authorRole: 'Interior Designer',
        authorImg: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
        authorBio: "Sarah is an interior designer with over 10 years of experience creating beautiful and functional spaces.",
        content: `Designing a timeless dining room requires a careful balance of proportions, comfortable seating, and rich tactile materials. Focus on high-quality solid wood tables, durable upholstered dining chairs, and ambient lighting to foster memorable dining experiences with family and guests.`,
        tags: ['Minimalist', 'Living Room', 'Decor', 'Layout'],
        isFeatured: false,
        isPopular: true,
        order: 2
    },
    {
        badge: 'ROOM IDEAS',
        date: 'MAY 05, 2025',
        readTime: '6 MIN READ',
        title: 'Modern Bedroom Ideas for Maximum Comfort',
        desc: 'Explore modern bedroom ideas that blend comfort, style and functionality.',
        img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
        author: 'John Doe',
        authorRole: 'Architecture Expert',
        authorImg: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=150&q=80',
        authorBio: "John specializes in modern residential architecture, combining sleek design with everyday functionality.",
        content: `Your bedroom is your private sanctuary. Learn how layered textiles, dimmable mood lighting, and ergonomic minimalist furniture can create an atmosphere of pure relaxation and restful sleep.`,
        tags: ['Bedroom', 'Modern Home', 'Luxury', 'Comfort'],
        isFeatured: false,
        isPopular: true,
        order: 3
    },
    {
        badge: 'MATERIALS',
        date: 'APRIL 25, 2025',
        readTime: '4 MIN READ',
        title: 'Best Materials for Luxury Interiors',
        desc: 'A guide to the best materials that add luxury, durability and sophistication.',
        img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80',
        author: 'Emily Chen',
        authorRole: 'Materials Specialist',
        authorImg: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        authorBio: "Emily is a materials specialist focused on sourcing sustainable, premium fabrics, stone, and wood for luxury spaces.",
        content: `Explore how Calacatta marble, brushed brass accents, and handcrafted walnut joinery work together to establish refined luxury in contemporary homes.`,
        tags: ['Materials', 'Luxury', 'Sustainable', 'Finishes'],
        isFeatured: false,
        isPopular: false,
        order: 4
    },
    {
        badge: 'INTERIOR TRENDS',
        date: 'APRIL 15, 2025',
        readTime: '5 MIN READ',
        title: 'Neutral Tones in Interior Design: Why They Work',
        desc: 'Understanding the power of neutral tones and how to use them beautifully.',
        img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80',
        author: 'Sarah Thompson',
        authorRole: 'Interior Designer',
        authorImg: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
        authorBio: "Sarah is an interior designer with over 10 years of experience.",
        content: `Neutral color palettes form a serene foundation for interior spaces. Learn how tone-on-tone layering prevents neutral rooms from looking flat.`,
        tags: ['Neutral', 'Interior Trends', 'Living Room', 'Decor'],
        isFeatured: false,
        isPopular: true,
        order: 5
    },
    {
        badge: 'LIGHTING',
        date: 'APRIL 02, 2025',
        readTime: '5 MIN READ',
        title: 'Lighting Ideas to Elevate Every Room',
        desc: 'Creative lighting ideas to enhance ambiance and bring your space to life.',
        img: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80',
        author: 'Michael Scott',
        authorRole: 'Lighting Consultant',
        authorImg: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
        authorBio: "Michael designs atmospheric and functional lighting systems.",
        content: `Discover how architectural LED cove lighting, accent spotlights, and decorative task lamps come together to curate warm layerable light.`,
        tags: ['Lighting', 'Ambiance', 'Decor', 'Innovation'],
        isFeatured: false,
        isPopular: false,
        order: 6
    },
    {
        badge: 'HOME IMPROVEMENT',
        date: 'MAR 20, 2025',
        readTime: '7 MIN READ',
        title: 'How to Plan a Successful Home Renovation',
        desc: 'A step-by-step guide to planning your renovation with confidence and clarity.',
        img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
        author: 'David Wright',
        authorRole: 'Renovation Specialist',
        authorImg: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        authorBio: "David has managed over 50 large-scale renovations.",
        content: `Renovating your home requires detailed budget estimation, hiring trusted interior architects, and choosing resilient materials. Here is your roadmap to success.`,
        tags: ['Renovation', 'Home Improvement', 'Planning', 'Tips'],
        isFeatured: false,
        isPopular: false,
        order: 7
    }
];

// Helper: Seed initial articles if empty
async function ensureSeedData() {
    try {
        const count = await BlogPost.countDocuments();
        if (count === 0) {
            console.log('Seeding initial blog posts into database...');
            await BlogPost.insertMany(defaultSeedArticles);
        }
        const heroCount = await BlogHero.countDocuments();
        if (heroCount === 0) {
            await BlogHero.create({
                kicker: 'OUR BLOG',
                title: 'Ideas, Inspiration & Interior Tips',
                subtitle: 'Explore expert advice, design trends, and creative ideas to help you create beautiful, functional spaces.'
            });
        }
    } catch (err) {
        console.error('Error seeding blog data:', err);
    }
}

// ── GET HERO ──
router.get('/hero', async (req, res) => {
    try {
        await ensureSeedData();
        let hero = await BlogHero.findOne();
        if (!hero) {
            hero = await BlogHero.create({});
        }
        res.status(200).json(hero);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch blog hero settings', error: error.message });
    }
});

// ── PUT HERO ──
router.put('/hero', async (req, res) => {
    try {
        const { kicker, title, subtitle, bgImage } = req.body;
        let hero = await BlogHero.findOne();
        if (!hero) {
            hero = new BlogHero({ kicker, title, subtitle, bgImage });
        } else {
            if (kicker !== undefined) hero.kicker = kicker;
            if (title !== undefined) hero.title = title;
            if (subtitle !== undefined) hero.subtitle = subtitle;
            if (bgImage !== undefined) hero.bgImage = bgImage;
        }
        await hero.save();
        res.status(200).json({ message: 'Blog hero updated successfully', hero });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update blog hero', error: error.message });
    }
});

// ── GET POSTS ──
router.get('/posts', async (req, res) => {
    try {
        await ensureSeedData();
        const posts = await BlogPost.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch blog posts', error: error.message });
    }
});

// ── GET SINGLE POST ──
router.get('/posts/:id', async (req, res) => {
    try {
        await ensureSeedData();
        const { id } = req.params;
        let post = null;

        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            post = await BlogPost.findById(id);
        }

        if (!post) {
            // fallback search by title or order or position if numeric string id like "1" or "7"
            const allPosts = await BlogPost.find().sort({ createdAt: -1 });
            const numericId = parseInt(id, 10);
            if (!isNaN(numericId)) {
                post = allPosts.find(p => p.order === numericId) || allPosts[numericId - 1];
            }
            if (!post) {
                post = allPosts[0];
            }
        }

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch blog post', error: error.message });
    }
});

// ── CREATE POST ──
router.post('/posts', async (req, res) => {
    try {
        const { badge, date, readTime, title, desc, img, author, authorRole, authorImg, authorBio, content, tags, isFeatured, isPopular } = req.body;

        if (!title || !desc || !img) {
            return res.status(400).json({ message: 'Title, description, and image are required.' });
        }

        const newPost = new BlogPost({
            badge: badge || 'INTERIOR TRENDS',
            date: date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase(),
            readTime: readTime || '5 MIN READ',
            title,
            desc,
            img,
            author: author || 'Good Interior Studio',
            authorRole: authorRole || 'Design Editor',
            authorImg: authorImg || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
            authorBio: authorBio || 'Specialist in high-end interior design and modern architecture trends.',
            content: content || desc,
            tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
            isFeatured: !!isFeatured,
            isPopular: !!isPopular
        });

        // If newly created post is featured, unset other featured posts
        if (newPost.isFeatured) {
            await BlogPost.updateMany({ _id: { $ne: newPost._id } }, { isFeatured: false });
        }

        await newPost.save();
        res.status(201).json({ message: 'Blog post created successfully', post: newPost });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create blog post', error: error.message });
    }
});

// ── UPDATE POST ──
router.put('/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (updateData.tags && typeof updateData.tags === 'string') {
            updateData.tags = updateData.tags.split(',').map(t => t.trim());
        }

        if (updateData.isFeatured) {
            await BlogPost.updateMany({ _id: { $ne: id } }, { isFeatured: false });
        }

        const updatedPost = await BlogPost.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!updatedPost) {
            return res.status(404).json({ message: 'Blog post not found' });
        }

        res.status(200).json({ message: 'Blog post updated successfully', post: updatedPost });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update blog post', error: error.message });
    }
});

// ── DELETE POST ──
router.delete('/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await BlogPost.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Blog post not found' });
        }
        res.status(200).json({ message: 'Blog post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete blog post', error: error.message });
    }
});

// ── SEED INITIAL POSTS ──
router.post('/seed', async (req, res) => {
    try {
        await BlogPost.deleteMany({});
        await BlogPost.insertMany(defaultSeedArticles);
        res.status(200).json({ message: 'Successfully seeded default blog articles into MongoDB!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to seed blog articles', error: error.message });
    }
});

module.exports = router;
