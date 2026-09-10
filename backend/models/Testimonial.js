const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    category: {
        type: String,
        default: 'RESIDENTIAL'
    },
    image: {
        type: String,
        required: true
    },
    quote: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
    },
    stars: {
        type: Number,
        default: 5
    },
    isApproved: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
