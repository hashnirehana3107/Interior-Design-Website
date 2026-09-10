const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const ServiceHero = require('../models/ServiceHero');
const ServiceProcess = require('../models/ServiceProcess');

const initialProcessSteps = [
    {
        stepNumber: '01',
        title: 'Initial Consultation',
        description: 'We listen to your ideas, needs and vision.',
        iconName: 'chat',
        order: 1
    },
    {
        stepNumber: '02',
        title: 'Concept & Design',
        description: 'Our team creates tailored design concepts.',
        iconName: 'bulb',
        order: 2
    },
    {
        stepNumber: '03',
        title: 'Planning & Selection',
        description: 'Detailed plans, materials and finishes are finalized.',
        iconName: 'file',
        order: 3
    },
    {
        stepNumber: '04',
        title: 'Execution',
        description: 'We bring the design to life with precision.',
        iconName: 'cog',
        order: 4
    },
    {
        stepNumber: '05',
        title: 'Final Reveal',
        description: 'Your dream space, ready to enjoy.',
        iconName: 'check',
        order: 5
    }
];

const initialServicesData = [
    {
        serviceId: 'residential',
        title: 'Residential Interior Design',
        kicker: 'HOME INTERIORS',
        desc: 'Personalized home interiors that reflect your lifestyle and personality.',
        fullDesc: 'Our residential interior design service transforms your living space into a luxurious, functional sanctuary. From individual room makeovers to complete home transformations, we work closely with you to curate customized layouts, tailored furniture, custom lighting schemes, and bespoke color palettes.',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1200&q=80'
        ],
        iconName: 'sofa',
        highlights: [
            'Comprehensive Space Planning & 3D Visualizations',
            'Custom Built-in Furniture & Cabinetry Design',
            'Curated Color Palettes, Fabrics & Textures',
            'Architectural Lighting & Ceiling Concepts',
            'End-to-End Procurement & On-Site Supervision'
        ],
        deliverables: 'Moodboards, 3D Renderings, Floor Plans, Material Specification List',
        order: 1
    },
    {
        serviceId: 'commercial',
        title: 'Commercial Interior Design',
        kicker: 'WORKPLACE & RETAIL',
        desc: 'Functional and inspiring spaces for modern workplaces and commercial environments.',
        fullDesc: 'Elevate your brand presence and optimize productivity with our commercial interior design solutions. We craft engaging corporate offices, luxury retail stores, hospitality spaces, and boutique studios designed to inspire teams and captivate customers.',
        image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1497215842811-94de0e02410a?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
        ],
        iconName: 'macbook',
        highlights: [
            'Brand-Integrated Spatial Design',
            'Ergonomic Workstation & Layout Optimization',
            'Acoustic Ceiling & Wall Solutions',
            'Reception, Lounge & Conference Room Design',
            'Commercial Building Code & Safety Compliance'
        ],
        deliverables: '3D Spatial Tours, Commercial Layout Prints, Finish Schedules',
        order: 2
    },
    {
        serviceId: 'kitchen',
        title: 'Kitchen Design',
        kicker: 'CULINARY SPACES',
        desc: 'Stylish and practical kitchen solutions tailored for everyday living.',
        fullDesc: 'The kitchen is the heart of the home. We craft bespoke modular kitchens combining state-of-the-art appliances, ergonomic storage solutions, premium stone countertops, and durable, elegant finishes.',
        image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&w=1200&q=80'
        ],
        iconName: 'kitchen',
        highlights: [
            'Ergonomic Work Triangle Layout Planning',
            'Quartz, Granite & Marble Countertop Selection',
            'Soft-Close Custom Cabinetry & Smart Pull-outs',
            'Integrated Task & Ambient LED Lighting',
            'High-End Appliance Integration & Plumbing Layouts'
        ],
        deliverables: 'Cabinetry Elevations, 3D Renderings, Appliance Integration Specs',
        order: 3
    },
    {
        serviceId: 'bedroom',
        title: 'Bedroom Design',
        kicker: 'PRIVATE SANCTUARIES',
        desc: 'Comfortable and elegant bedroom spaces tailored to your personal taste.',
        fullDesc: 'Transform your bedroom into a peaceful, cozy retreat. We curate soothing color palettes, custom headboards, luxurious bedding textures, integrated wardrobes, and dimmable accent lighting for ultimate relaxation.',
        image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
        ],
        iconName: 'bed',
        highlights: [
            'Bespoke Upholstered Headboards & Bed Frame Design',
            'Walk-in Closet & Smart Wardrobe Organizers',
            'Acoustic Soundproofing & Light-Blocking Drapery',
            'Ambient Mood & Bedside Reading Lighting',
            'Luxury Fabric & Linen Selection'
        ],
        deliverables: 'Bedroom Moodboards, Wardrobe Elevation Plans, Fabric Swatches',
        order: 4
    },
    {
        serviceId: 'living-dining',
        title: 'Living & Dining Design',
        kicker: 'SOCIAL & ENTERTAINING',
        desc: 'Beautiful and functional living and dining spaces designed for togetherness.',
        fullDesc: 'Create an inviting atmosphere for hosting family and friends. We design open-plan living and dining areas that flow seamlessly, combining statement dining tables, plush seating, custom media consoles, and artistic accents.',
        image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'
        ],
        iconName: 'restaurant',
        highlights: [
            'Open-Concept Zoning & Flow Planning',
            'Custom Dining Tables & Sculptural Lighting',
            'Media Console & Feature Wall Designs',
            'Luxury Rug, Drapery & Pillow Styling',
            'Statement Artwork & Wall Treatment Selection'
        ],
        deliverables: 'Furniture Arrangement Layouts, 3D Visuals, Lighting Plans',
        order: 5
    },
    {
        serviceId: 'space-planning',
        title: 'Space Planning & Layout',
        kicker: 'SPATIAL OPTIMIZATION',
        desc: 'Smart space planning and layout strategies for maximum functionality.',
        fullDesc: 'Unlock the full potential of your floor plan with expert spatial analysis. Whether you are building from scratch or reconfiguring an existing layout, we optimize foot traffic, natural light exposure, and functional zones.',
        image: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80'
        ],
        iconName: 'layout',
        highlights: [
            'Comprehensive Architectural 2D & 3D Layout Drawings',
            'Traffic Flow & Ergonomic Clearance Analysis',
            'Natural Light & View Maximization Strategies',
            'Demolition & Structural Alteration Guidance',
            'Storage & Concealed Utility Planning'
        ],
        deliverables: 'Dimensioned CAD Floor Plans, Zoning Maps, 3D Spatial Models',
        order: 6
    },
    {
        serviceId: 'materials',
        title: 'Material & Furniture Selection',
        kicker: 'CURATED FINISHES',
        desc: 'Curated materials, bespoke furniture and fine finishes to match your style.',
        fullDesc: 'We source high-grade wood, natural marble, premium metals, designer fabrics, and custom handcrafted furniture pieces from top artisans and global suppliers to ensure your space looks and feels extraordinary.',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=1200&q=80'
        ],
        iconName: 'stack',
        highlights: [
            'Exclusive Access to Designer Trade Showrooms',
            'Physical Material & Finish Board Presentations',
            'Custom Furniture Prototyping & Millwork Drawings',
            'Eco-friendly & Sustainable Material Options',
            'Quality Control & Supplier Negotiation'
        ],
        deliverables: 'Material Specification Schedules, Procurement Catalogs, Fabric Samples',
        order: 7
    },
    {
        serviceId: 'styling',
        title: 'Styling & Décor',
        kicker: 'FINAL TOUCHES',
        desc: 'Curated decorative touches and final styling that bring your space to life.',
        fullDesc: 'The final layer of design that brings character and emotion to your home. We select fine art, accent lighting, decorative objects, greenery, soft furnishings, and tableware to complete your interior aesthetic.',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80'
        ],
        iconName: 'lamp',
        highlights: [
            'Art Curation & Gallery Wall Design',
            'Custom Window Treatments & Soft Accessories',
            'Seasonal & Event Styling Services',
            'On-Site White-Glove Staging & Installation',
            'Floral & Botanical Arrangement Layouts'
        ],
        deliverables: 'Styling Catalog, On-Site Installation & White-Glove Setup',
        order: 8
    }
];

// GET /api/services/hero
router.get('/hero', async (req, res) => {
    try {
        let hero = await ServiceHero.findOne();
        if (!hero) {
            hero = new ServiceHero({
                whyImage: '/src/assets/about_img.png'
            });
            await hero.save();
        } else {
            let updated = false;
            if (!hero.processKicker) { hero.processKicker = 'OUR PROCESS'; updated = true; }
            if (!hero.processTitle) { hero.processTitle = 'A Simple & Transparent Process'; updated = true; }
            if (!hero.processDesc) { hero.processDesc = 'We follow a structured process to ensure a smooth, enjoyable and successful design experience.'; updated = true; }
            if (!hero.whyKicker) { hero.whyKicker = 'WHY CHOOSE US'; updated = true; }
            if (!hero.whyTitle) { hero.whyTitle = 'More Than Design.<br />A Better Way of Living.'; updated = true; }
            if (!hero.whyDesc) { hero.whyDesc = 'We combine creativity, expertise and a client-focused approach to deliver interiors that inspire and endure.'; updated = true; }
            if (!hero.whyQuote) { hero.whyQuote = 'Good design creates spaces where life happens beautifully.'; updated = true; }
            if (!hero.whyQuoteAuthor) { hero.whyQuoteAuthor = 'GOOD INTERIOR DESIGN STUDIO'; updated = true; }
            if (!hero.whyImage) { hero.whyImage = '/src/assets/about_img.png'; updated = true; }
            if (updated) await hero.save();
        }
        res.status(200).json({ hero });
    } catch (error) {
        console.error('Fetch Service Hero Error:', error);
        res.status(500).json({ message: 'Failed to fetch service hero' });
    }
});

// PUT /api/services/hero (Admin)
router.put('/hero', async (req, res) => {
    try {
        let hero = await ServiceHero.findOne();
        if (!hero) {
            hero = new ServiceHero(req.body);
        } else {
            Object.assign(hero, req.body);
        }
        await hero.save();
        res.status(200).json({ message: 'Service hero updated successfully', hero });
    } catch (error) {
        console.error('Update Service Hero Error:', error);
        res.status(500).json({ message: 'Failed to update service hero' });
    }
});

// GET /api/services
router.get('/', async (req, res) => {
    try {
        let services = await Service.find().sort({ order: 1, createdAt: 1 });
        // If empty or missing rich detail fields, seed full 8 services
        if (services.length < 8 || !services.every(s => s.fullDesc && s.images && s.images.length > 0)) {
            await Service.deleteMany({});
            await Service.insertMany(initialServicesData);
            services = await Service.find().sort({ order: 1, createdAt: 1 });
        }
        res.status(200).json({ services });
    } catch (error) {
        console.error('Fetch Services Error:', error);
        res.status(500).json({ message: 'Failed to fetch services' });
    }
});

// POST /api/services/reseed (Admin Force Reseed)
router.post('/reseed', async (req, res) => {
    try {
        await Service.deleteMany({});
        await Service.insertMany(initialServicesData);
        const services = await Service.find().sort({ order: 1, createdAt: 1 });
        res.status(200).json({ message: 'Reseeded all 8 services successfully', services });
    } catch (error) {
        res.status(500).json({ message: 'Reseed failed' });
    }
});

// POST /api/services (Admin)
router.post('/', async (req, res) => {
    try {
        const { title, kicker, desc, fullDesc, image, images, iconName, highlights, deliverables, order } = req.body;
        if (!title) return res.status(400).json({ message: 'Service title is required' });

        const count = await Service.countDocuments();
        const serviceId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        const newService = new Service({
            serviceId,
            title,
            kicker: kicker || 'OUR SERVICE',
            desc: desc || '',
            fullDesc: fullDesc || '',
            image: image || '',
            images: images && images.length > 0 ? images : (image ? [image] : []),
            iconName: iconName || 'sofa',
            highlights: highlights || [],
            deliverables: deliverables || '',
            order: order || count + 1
        });
        await newService.save();
        res.status(201).json({ message: 'Service created successfully', service: newService });
    } catch (error) {
        console.error('Create Service Error:', error);
        res.status(500).json({ message: 'Failed to create service' });
    }
});

// ── PROCESS STEPS ENDPOINTS ──

// GET /api/services/process
router.get('/process', async (req, res) => {
    try {
        let steps = await ServiceProcess.find().sort({ order: 1 });
        if (steps.length === 0) {
            await ServiceProcess.insertMany(initialProcessSteps);
            steps = await ServiceProcess.find().sort({ order: 1 });
        }
        res.status(200).json({ steps });
    } catch (error) {
        console.error('Get Process Steps Error:', error);
        res.status(500).json({ message: 'Failed to fetch process steps' });
    }
});

// POST /api/services/process (Admin)
router.post('/process', async (req, res) => {
    try {
        const { stepNumber, title, description, iconName, order } = req.body;
        if (!title || !description) return res.status(400).json({ message: 'Title and description are required' });

        const count = await ServiceProcess.countDocuments();
        const formattedStepNumber = stepNumber || (count + 1 < 10 ? `0${count + 1}` : `${count + 1}`);

        const newStep = new ServiceProcess({
            stepNumber: formattedStepNumber,
            title,
            description,
            iconName: iconName || 'chat',
            order: order || count + 1
        });
        await newStep.save();
        res.status(201).json({ message: 'Process step created successfully', step: newStep });
    } catch (error) {
        console.error('Create Process Step Error:', error);
        res.status(500).json({ message: 'Failed to create process step' });
    }
});

// PUT /api/services/process/:id (Admin)
router.put('/process/:id', async (req, res) => {
    try {
        const updatedStep = await ServiceProcess.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!updatedStep) return res.status(404).json({ message: 'Process step not found' });
        res.status(200).json({ message: 'Process step updated successfully', step: updatedStep });
    } catch (error) {
        console.error('Update Process Step Error:', error);
        res.status(500).json({ message: 'Failed to update process step' });
    }
});

const ServiceWhyFeature = require('../models/ServiceWhyFeature');

const initialWhyFeatures = [
    {
        title: 'Creative Solutions',
        description: 'Unique designs tailored to your needs.',
        iconName: 'diamond',
        order: 1
    },
    {
        title: 'Expert Team',
        description: 'Skilled professionals with proven experience.',
        iconName: 'star',
        order: 2
    },
    {
        title: 'Quality Assurance',
        description: 'Premium materials and attention to detail.',
        iconName: 'badge',
        order: 3
    },
    {
        title: 'On-Time Delivery',
        description: 'We value your time and deliver as promised.',
        iconName: 'time',
        order: 4
    }
];

// GET /api/services/why-features
router.get('/why-features', async (req, res) => {
    try {
        let features = await ServiceWhyFeature.find().sort({ order: 1 });
        if (features.length === 0) {
            features = await ServiceWhyFeature.insertMany(initialWhyFeatures);
        }
        res.status(200).json({ features });
    } catch (error) {
        console.error('Fetch Why Features Error:', error);
        res.status(500).json({ message: 'Failed to fetch why features' });
    }
});

// POST /api/services/why-features (Admin)
router.post('/why-features', async (req, res) => {
    try {
        const { title, description, iconName, order } = req.body;
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        const count = await ServiceWhyFeature.countDocuments();
        const newFeature = new ServiceWhyFeature({
            title,
            description,
            iconName: iconName || 'diamond',
            order: order || count + 1
        });
        await newFeature.save();
        res.status(201).json({ message: 'Why feature created successfully', feature: newFeature });
    } catch (error) {
        console.error('Create Why Feature Error:', error);
        res.status(500).json({ message: 'Failed to create why feature' });
    }
});

// PUT /api/services/why-features/:id (Admin)
router.put('/why-features/:id', async (req, res) => {
    try {
        const updatedFeature = await ServiceWhyFeature.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!updatedFeature) return res.status(404).json({ message: 'Why feature not found' });
        res.status(200).json({ message: 'Why feature updated successfully', feature: updatedFeature });
    } catch (error) {
        console.error('Update Why Feature Error:', error);
        res.status(500).json({ message: 'Failed to update why feature' });
    }
});

// DELETE /api/services/process/:id (Admin)
router.delete('/process/:id', async (req, res) => {
    try {
        const deletedStep = await ServiceProcess.findByIdAndDelete(req.params.id);
        if (!deletedStep) return res.status(404).json({ message: 'Process step not found' });
        res.status(200).json({ message: 'Process step deleted successfully' });
    } catch (error) {
        console.error('Delete Process Step Error:', error);
        res.status(500).json({ message: 'Failed to delete process step' });
    }
});

// DELETE /api/services/why-features/:id (Admin)
router.delete('/why-features/:id', async (req, res) => {
    try {
        const deletedFeature = await ServiceWhyFeature.findByIdAndDelete(req.params.id);
        if (!deletedFeature) return res.status(404).json({ message: 'Why feature not found' });
        res.status(200).json({ message: 'Why feature deleted successfully' });
    } catch (error) {
        console.error('Delete Why Feature Error:', error);
        res.status(500).json({ message: 'Failed to delete why feature' });
    }
});

// ── GENERIC SINGLE SERVICE ENDPOINTS (MUST BE AT THE BOTTOM) ──

// PUT /api/services/:id (Admin)
router.put('/:id', async (req, res) => {
    try {
        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!updatedService) return res.status(404).json({ message: 'Service not found' });
        res.status(200).json({ message: 'Service updated successfully', service: updatedService });
    } catch (error) {
        console.error('Update Service Error:', error);
        res.status(500).json({ message: 'Failed to update service' });
    }
});

// DELETE /api/services/:id (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const deletedService = await Service.findByIdAndDelete(req.params.id);
        if (!deletedService) return res.status(404).json({ message: 'Service not found' });
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Delete Service Error:', error);
        res.status(500).json({ message: 'Failed to delete service' });
    }
});

module.exports = router;
