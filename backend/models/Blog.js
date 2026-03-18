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
    },
    comments: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name: String,
            text: {
                type: String,
                required: true
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Blog', blogSchema);
