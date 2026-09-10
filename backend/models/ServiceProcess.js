const mongoose = require('mongoose');

const serviceProcessSchema = new mongoose.Schema({
    stepNumber: {
        type: String,
        required: true,
        default: '01'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    iconName: {
        type: String,
        default: 'chat' // chat, bulb, file, cog, check
    },
    order: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('ServiceProcess', serviceProcessSchema);
