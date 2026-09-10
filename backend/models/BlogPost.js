const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
    badge: {
        type: String,
        required: true,
        default: 'INTERIOR TRENDS'
    },
    date: {
        type: String,
        default: ''
    },
    readTime: {
        type: String,
        default: '5 MIN READ'
    },
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    author: {
        type: String,
        default: 'Sarah Thompson'
    },
    authorRole: {
        type: String,
        default: 'Interior Designer'
    },
    authorImg: {
        type: String,
        default: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80'
    },
    authorBio: {
        type: String,
        default: 'Sarah is an interior designer with over 10 years of experience creating beautiful and functional spaces.'
    },
    content: {
        type: String,
        default: ''
    },
    tags: {
        type: [String],
        default: []
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('BlogPost', blogPostSchema);
