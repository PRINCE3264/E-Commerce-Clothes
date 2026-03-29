const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    role: {
        type: String,
        required: [true, 'Please add a role'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    image: {
        type: String,
        required: [true, 'Please add an image URL or Base64']
    },
    socials: {
        linkedin: { type: String, default: '#' },
        instagram: { type: String, default: '#' },
        twitter: { type: String, default: '#' }
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Team', teamSchema);
