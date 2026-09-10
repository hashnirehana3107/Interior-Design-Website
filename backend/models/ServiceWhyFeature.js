const mongoose = require('mongoose');

const serviceWhyFeatureSchema = new mongoose.Schema({
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
        default: 'diamond'
    },
    order: {
        type: Number,
        default: 1
    }
}, { timestamps: true });

module.exports = mongoose.model('ServiceWhyFeature', serviceWhyFeatureSchema);
