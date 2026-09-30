let sharp;
try {
    sharp = require('sharp');
} catch (err) {
    console.warn('Sharp module not available or failed to load in serverless environment:', err.message);
}

const INPUT_SIZE_LIMIT = 300_000;
const OUTPUT_SIZE_LIMIT = 220 * 1024;
const DATA_URL_PATTERN = /^data:image\/[\w.+-]+;base64,(.+)$/s;

const optimizeImage = async (value) => {
    if (!sharp || typeof value !== 'string' || Buffer.byteLength(value, 'utf8') <= INPUT_SIZE_LIMIT) {
        return value;
    }

    const match = value.match(DATA_URL_PATTERN);
    if (!match) return value;

    const image = Buffer.from(match[1], 'base64');
    const variants = [
        { width: 1600, quality: 76 },
        { width: 1280, quality: 68 },
        { width: 1024, quality: 60 }
    ];
    let optimized;

    for (const variant of variants) {
        optimized = await sharp(image)
            .rotate()
            .resize({ width: variant.width, height: variant.width, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: variant.quality, effort: 4 })
            .toBuffer();

        if (optimized.length <= OUTPUT_SIZE_LIMIT) break;
    }

    return `data:image/webp;base64,${optimized.toString('base64')}`;
};

const optimizeProjectImages = async (project) => {
    const optimizedProject = { ...project };

    for (const field of ['image', 'beforeImg', 'afterImg']) {
        optimizedProject[field] = await optimizeImage(optimizedProject[field]);
    }

    if (Array.isArray(optimizedProject.galleryImages)) {
        for (let index = 0; index < optimizedProject.galleryImages.length; index += 1) {
            optimizedProject.galleryImages[index] = await optimizeImage(optimizedProject.galleryImages[index]);
        }
    }

    return optimizedProject;
};

module.exports = { INPUT_SIZE_LIMIT, optimizeImage, optimizeProjectImages };