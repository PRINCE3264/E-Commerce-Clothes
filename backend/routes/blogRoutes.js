const express = require('express');
const router = express.Router();
const { 
    getBlogs, 
    getBlogById, 
    createBlog, 
    updateBlog, 
    deleteBlog,
    addComment,
    deleteComment
} = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getBlogs)
    .post(protect, authorize('admin'), createBlog);

router.route('/:id')
    .get(getBlogById)
    .put(protect, authorize('admin'), updateBlog)
    .delete(protect, authorize('admin'), deleteBlog);

router.route('/:id/comments')
    .post(protect, addComment);

router.route('/:id/comments/:comment_id')
    .delete(protect, deleteComment);

module.exports = router;
