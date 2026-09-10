const mongoose = require('mongoose');

const signupFeatureSchema = new mongoose.Schema({
    icon: {
        type: String,
        default: 'RiBookmarkLine'
    },
    title: {
        type: String,
        default: 'Curate & Save Inspiration'
    },
    description: {
        type: String,
        default: 'Save your favorite room designs, 3D renderings, and bespoke styling ideas.'
    }
});

const authBrandingSchema = new mongoose.Schema({
    loginTitle: {
        type: String,
        default: 'Welcome Back'
    },
    loginSubtitle: {
        type: String,
        default: 'Log in to access your projects, saved ideas and personalized design experience.'
    },
    signupTitle: {
        type: String,
        default: 'Elevate Your Interior Experience'
    },
    signupSubtitle: {
        type: String,
        default: 'Join Good Interior Studio to curate your dream space, track design consultations, and access exclusive portfolio concepts.'
    },
    signupFeatures: {
        type: [signupFeatureSchema],
        default: [
            {
                icon: 'RiBookmarkLine',
                title: 'Curate & Save Inspiration',
                description: 'Save your favorite room designs, 3D renderings, and bespoke styling ideas.'
            },
            {
                icon: 'LuFolderOpen',
                title: 'Seamless Project Tracking',
                description: 'Monitor your ongoing interior project milestones, consultation schedules, and site updates.'
            },
            {
                icon: 'BsEnvelopePaper',
                title: 'Personalized Interior Service',
                description: 'Receive tailored design proposals, material recommendations, and direct team support.'
            }
        ]
    }
}, { timestamps: true });

module.exports = mongoose.model('AuthBranding', authBrandingSchema);
