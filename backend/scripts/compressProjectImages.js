require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('../models/Project');
const { INPUT_SIZE_LIMIT, optimizeImage } = require('../utils/optimizeProjectImages');
const applyChanges = process.argv.includes('--apply');

const main = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
        const projects = await Project.find({
            $expr: {
                $gt: [{ $strLenBytes: { $ifNull: ['$image', ''] } }, INPUT_SIZE_LIMIT]
            }
        }).select('_id title image').lean();

        for (const project of projects) {
            const image = await optimizeImage(project.image);
            if (applyChanges) {
                await Project.updateOne({ _id: project._id }, { $set: { image } });
            }
            console.log(`${project.title}: ${project.image.length} -> ${image.length} characters`);
        }

        console.log(`${applyChanges ? 'Updated' : 'Dry run; no database changes made for'} ${projects.length} project images.`);
    } catch (error) {
        console.error('Project image compression failed:', error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

main();