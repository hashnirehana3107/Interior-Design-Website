require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');

const baseProjects = [
    { title: 'Modern Minimalist Living', category: 'RESIDENTIAL', filterCategory: 'residential', subCategory: 'living-dining', description: 'A calm and inviting living space with a minimalist approach and natural tones.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80' },
    { title: 'Warm Wood Kitchen', category: 'RESIDENTIAL', filterCategory: 'kitchen', subCategory: 'kitchen', description: 'A functional kitchen designed with warm wood finishes and smart storage solutions.', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1920&q=80' },
    { title: 'Luxury Bedroom Suite', category: 'RESIDENTIAL', filterCategory: 'bedroom', subCategory: 'bedroom', description: 'A serene bedroom retreat with elegant textures and soft ambient lighting.', image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1920&q=80' },
    { title: 'Elegant Dining Interior', category: 'RESIDENTIAL', filterCategory: 'residential', subCategory: 'living-dining', description: 'A sophisticated dining space perfect for family gatherings and entertaining.', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1920&q=80' },
    { title: 'Corporate Office Lounge', category: 'COMMERCIAL', filterCategory: 'commercial', subCategory: 'commercial', description: 'A modern lounge area designed to inspire collaboration and comfort.', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80' },
    { title: 'Hotel Reception Lobby', category: 'COMMERCIAL', filterCategory: 'commercial', subCategory: 'commercial', description: 'A luxurious lobby design that creates a stunning first impression.', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1920&q=80' },
    { title: 'Open Plan Living & Dining', category: 'RESIDENTIAL', filterCategory: 'residential', subCategory: 'living-dining', description: 'An open-concept layout that enhances flow and maximizes natural light.', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=80' },
    { title: 'Contemporary Bedroom', category: 'RESIDENTIAL', filterCategory: 'bedroom', subCategory: 'bedroom', description: 'A contemporary bedroom with a perfect balance of style, comfort and functionality.', image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1920&q=80' },
    { title: 'Sleek Modern Kitchen', category: 'RESIDENTIAL', filterCategory: 'kitchen', subCategory: 'kitchen', description: 'A sleek kitchen with premium finishes and high-end appliances.', image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1920&q=80' },
    { title: 'Luxury Retail Store', category: 'COMMERCIAL', filterCategory: 'commercial', subCategory: 'commercial', description: 'A high-end retail space designed to elevate the brand experience.', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80' },
    { title: 'Spa Inspired Bathroom', category: 'RESIDENTIAL', filterCategory: 'residential', subCategory: 'bathroom', description: 'A relaxing bathroom retreat with spa-like finishes and natural elements.', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1920&q=80' },
    { title: 'Modern Home Interior', category: 'RESIDENTIAL', filterCategory: 'residential', subCategory: 'living-dining', description: 'A complete home interior with cohesive design and refined details.', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=80' }
];

const projectsData = baseProjects.map(project => {
    let beforeImg = 'https://images.unsplash.com/photo-1574359411659-15573a27fd0c?auto=format&fit=crop&w=800&q=80';
    let afterImg = project.image;
    let galleryImages = [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1600607687126-7ba55ff95eb4?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80'
    ];

    if (project.subCategory === 'kitchen') {
        beforeImg = 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=800&q=80';
        galleryImages = [
            'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=600&q=80'
        ];
    } else if (project.subCategory === 'bedroom') {
        beforeImg = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';
        galleryImages = [
            'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80'
        ];
    } else if (project.subCategory === 'commercial') {
        beforeImg = 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80';
        galleryImages = [
            'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1497215842811-94de0e02410a?auto=format&fit=crop&w=600&q=80'
        ];
    } else if (project.subCategory === 'bathroom') {
        beforeImg = 'https://images.unsplash.com/photo-1504333638930-c8787321efa0?auto=format&fit=crop&w=800&q=80';
        galleryImages = [
            'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1604709177110-cbd84c16a6ce?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1504333638930-c8787321efa0?auto=format&fit=crop&w=600&q=80'
        ];
    }

    return {
        ...project,
        beforeImg,
        afterImg,
        galleryImages,
    };
});

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('Connected to MongoDB. Clearing existing projects and seeding 12 projects...');
    await Project.deleteMany({}); // Delete all existing
    for (let p of projectsData) {
        // Add random dates just to keep sorting order somewhat consistent with original ids
        await Project.create(p);
    }
    console.log('Successfully seeded 12 projects!');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
