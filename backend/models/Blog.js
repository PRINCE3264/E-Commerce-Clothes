const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a blog title']
    },
    author: {
        type: String,
        required: [true, 'Please add an author']
    },
    excerpt: {
        type: String,
        required: [true, 'Please add a brief excerpt']
    },
    content: {
        type: String,
        required: [true, 'Please add the full blog content']
    },
    image: {
        type: String
    },
    status: {
        type: String,
        enum: ['Published', 'Draft', 'Archived'],
        default: 'Published'
    },
    date: {
        type: Date,
        default: Date.now
    },
    category: {
        type: String,
        default: 'Fashion'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Blog', blogSchema);
