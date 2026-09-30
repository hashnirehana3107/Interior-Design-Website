const mongoose = require('mongoose');
require('dotenv').config();
const Service = require('./models/Service');
const { optimizeImage } = require('./utils/optimizeProjectImages');

async function checkAndCompressServices() {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, { family: 4, serverSelectionTimeoutMS: 20000 });
    console.log('Connected!');

    const services = await Service.find().lean();
    console.log(`Found ${services.length} services.`);

    for (const s of services) {
        let updated = false;
        const update = {};

        if (s.image && typeof s.image === 'string' && s.image.length > 200000) {
            console.log(`Compressing cover image for "${s.title}" (${Math.round(s.image.length / 1024)}KB)...`);
            update.image = await optimizeImage(s.image);
            updated = true;
        }

        if (Array.isArray(s.images)) {
            const newImages = [];
            let imgUpdated = false;
            for (let i = 0; i < s.images.length; i++) {
                const img = s.images[i];
                if (img && typeof img === 'string' && img.length > 200000) {
                    console.log(`Compressing slider image ${i + 1} for "${s.title}" (${Math.round(img.length / 1024)}KB)...`);
                    newImages.push(await optimizeImage(img));
                    imgUpdated = true;
                } else {
                    newImages.push(img);
                }
            }
            if (imgUpdated) {
                update.images = newImages;
                updated = true;
            }
        }

        if (updated) {
            await Service.findByIdAndUpdate(s._id, { $set: update });
            console.log(`✅ Optimized & saved service: "${s.title}"`);
        } else {
            console.log(`✓ OK: "${s.title}"`);
        }
    }

    process.exit(0);
}

checkAndCompressServices().catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});
