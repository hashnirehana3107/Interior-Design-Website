const mongoose = require('mongoose');
require('dotenv').config();
const Project = require('./models/Project');

async function testAggregate() {
    await mongoose.connect(process.env.MONGODB_URI, { family: 4, serverSelectionTimeoutMS: 20000 });
    console.log('Connected!');

    try {
        const start = Date.now();
        const projects = await Project.aggregate([
            { $sort: { _id: -1 } },
            { $unset: ['beforeImg', 'afterImg', 'galleryImages'] },
            {
                $set: {
                    image: {
                        $cond: [
                            { $gt: [{ $strLenBytes: { $ifNull: ['$image', ''] } }, 500000] },
                            '',
                            '$image'
                        ]
                    }
                }
            }
        ]);
        console.log('Aggregate time:', Date.now() - start, 'ms');
        console.log('Result count:', projects.length);
        projects.forEach(p => console.log(' -', p.title, '| image len:', (p.image || '').length));
    } catch (e) {
        console.error('Aggregate ERROR:', e.message);
    }

    process.exit(0);
}

testAggregate().catch(e => { console.error(e.message); process.exit(1); });
