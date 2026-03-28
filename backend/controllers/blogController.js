const Blog = require('../models/Blog');

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort('-createdAt');
        res.status(200).json({ success: true, count: blogs.length, data: blogs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get single blog
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }
        res.status(200).json({ success: true, data: blog });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private/Admin
const createBlog = async (req, res) => {
    try {
        const blog = await Blog.create(req.body);
        res.status(201).json({ success: true, data: blog });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin
const updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
            returnDocument: 'after',
            runValidators: true
        });

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        res.status(200).json({ success: true, data: blog });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        await blog.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Add comment to blog
// @route   POST /api/blogs/:id/comments
// @access  Private
const addComment = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        const newComment = {
            user: req.user.id,
            text: req.body.text,
            name: req.user.name
        };

        blog.comments.unshift(newComment);
        await blog.save();

        res.status(200).json({ success: true, data: blog.comments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete comment from blog
// @route   DELETE /api/blogs/:id/comments/:comment_id
// @access  Private
const deleteComment = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        // Pull out comment
        const comment = blog.comments.find(
            (comment) => comment.id === req.params.comment_id
        );

        // Make sure comment exists
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment does not exist' });
        }

        // Check user
        if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'User not authorized' });
        }

        blog.comments = blog.comments.filter(
            ({ id }) => id !== req.params.comment_id
        );

        await blog.save();

        res.status(200).json({ success: true, data: blog.comments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    addComment,
    deleteComment
};
