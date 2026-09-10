const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
    heroInfo: {
        title: { type: String, default: 'Designing Spaces. <br />Defining <span class="highlight-text">Experiences.</span>' },
        subtitle: { type: String, default: 'At Good Interior, we transform ideas into timeless interior experiences that reflect who you are and how you live.' },
        bgImage: { type: String, default: '' },
    },
    whoWeAre: {
        title: { type: String, default: 'Crafting Beautiful Interiors Since 2015' },
        paragraph1: { type: String, default: 'Good Interior is a Colombo-based interior design studio specializing in residential, commercial and hospitality spaces. We combine creativity, functionality and attention to detail to deliver spaces that are not only beautiful but also enrich everyday living.' },
        paragraph2: { type: String, default: 'From concept to completion, our team works closely with clients to bring their vision to life with a personalized approach and seamless execution.' },
        image: { type: String, default: '' }
    },
    purpose: {
        missionTitle: { type: String, default: 'Our Mission' },
        missionText: { type: String, default: 'To design thoughtful interiors that inspire and elevate the way people live and work. We are committed to creating functional, timeless and purposeful spaces that enhance everyday experiences.' },
        visionTitle: { type: String, default: 'Our Vision' },
        visionText: { type: String, default: 'To be a leading interior design studio recognized for innovation, quality and integrity—creating beautiful spaces that leave a lasting impact on people\'s lives and environments.' }
    },
    achievements: [
        {
            icon: { type: String }, // e.g. 'BiCalendarStar', 'HiOutlineUserGroup'
            value: { type: String },
            label: { type: String }
        }
    ],
    philosophy: {
        title: { type: String, default: 'Designing With Purpose,<br />Creating With Passion' },
        desc: { type: String, default: 'We believe every space has a story. Our philosophy is rooted in understanding our clients, their lifestyle and aspirations. We then blend aesthetics, functionality and sustainability to create timeless interiors that are uniquely theirs.' },
        points: { type: [String], default: ['Client-centric approach', 'Timeless aesthetics', 'Quality & craftsmanship', 'Sustainable & responsible design'] },
        image: { type: String, default: '' }
    },
    team: {
        title: { type: String, default: 'A Team Of Creatives<br />And Problem Solvers' },
        desc: { type: String, default: 'Our team of designers, architects and project managers work together to ensure a smooth process and exceptional results from start to finish.' },
        traits: {
            type: [{
                icon: String, // e.g. 'HiOutlineUserGroup', 'RiPencilRuler2Line', 'BiBuildingHouse', 'FiHeart'
                title: String,
                desc: String
            }],
            default: [
                { icon: 'HiOutlineUserGroup', title: 'Creative Designers', desc: 'Bringing ideas to life with creativity.' },
                { icon: 'RiPencilRuler2Line', title: 'Detail Oriented', desc: 'Precision in every detail makes perfection.' },
                { icon: 'BiBuildingHouse', title: 'Project Management', desc: 'Seamless execution from start to finish.' },
                { icon: 'FiHeart', title: 'Client Focused', desc: 'Your satisfaction is at the heart of what we do.' }
            ]
        }
    }
});

module.exports = mongoose.model('About', aboutSchema);
