const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema({
    title: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        required: true,
        default: 'living'
    },
    src: {
        type: String,
        required: true
    },
    shape: {
        type: String,
        default: 'standard'
    },
    order: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('GalleryItem', galleryItemSchema);
