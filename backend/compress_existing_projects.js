/**
 * One-time script to compress and re-save all oversized project images already in MongoDB.
 * Run: node compress_existing_projects.js
 */
const mongoose = require('mongoose');
require('dotenv').config();
const Project = require('./models/Project');
const { optimizeImage } = require('./utils/optimizeProjectImages');

const FIELDS = ['image', 'beforeImg', 'afterImg'];
const MAX_SIZE = 300_000; // bytes

async function compressExistingProjects() {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, { family: 4, serverSelectionTimeoutMS: 20000 });
    console.log('Connected!\n');

    const projects = await Project.find().lean();
    console.log(`Found ${projects.length} projects to check.\n`);

    let totalUpdated = 0;

    for (const proj of projects) {
        let needsUpdate = false;
        const update = {};

        for (const field of FIELDS) {
            const val = proj[field];
            if (typeof val === 'string' && Buffer.byteLength(val, 'utf8') > MAX_SIZE) {
                console.log(`  Compressing ${field} of "${proj.title}" (${Math.round(Buffer.byteLength(val, 'utf8') / 1024)}KB)...`);
                const optimized = await optimizeImage(val);
                const newSize = Math.round(Buffer.byteLength(optimized, 'utf8') / 1024);
                console.log(`    -> Compressed to ${newSize}KB`);
                update[field] = optimized;
                needsUpdate = true;
            }
        }

        // Compress gallery images
        if (Array.isArray(proj.galleryImages)) {
            const optimizedGallery = [];
            let galleryChanged = false;
            for (let i = 0; i < proj.galleryImages.length; i++) {
                const img = proj.galleryImages[i];
                if (typeof img === 'string' && Buffer.byteLength(img, 'utf8') > MAX_SIZE) {
                    console.log(`  Compressing galleryImages[${i}] of "${proj.title}" (${Math.round(Buffer.byteLength(img, 'utf8') / 1024)}KB)...`);
                    const opt = await optimizeImage(img);
                    console.log(`    -> Compressed to ${Math.round(Buffer.byteLength(opt, 'utf8') / 1024)}KB`);
                    optimizedGallery.push(opt);
                    galleryChanged = true;
                } else {
                    optimizedGallery.push(img);
                }
            }
            if (galleryChanged) {
                update.galleryImages = optimizedGallery;
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            await Project.findByIdAndUpdate(proj._id, { $set: update });
            console.log(`  ✅ Updated: "${proj.title}"\n`);
            totalUpdated++;
        } else {
            console.log(`  ✓ OK - "${proj.title}" (all images within size limit)`);
        }
    }

    console.log(`\nDone! ${totalUpdated} of ${projects.length} projects compressed and updated in MongoDB Atlas.`);
    process.exit(0);
}

compressExistingProjects().catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});
