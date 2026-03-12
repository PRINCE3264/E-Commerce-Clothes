const express = require('express');
const router = express.Router();
const { 
    getProducts, 
    getProductById, 
    createProductReview, 
    deleteProductReview,
    approveProductReview 
} = require('../controllers/productController');
const { protect, authorize, optionalProtect } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/:id', optionalProtect, getProductById);
router.post('/:id/reviews', protect, createProductReview);
router.put('/:id/reviews/:reviewId/approve', protect, authorize('admin'), approveProductReview);
router.delete('/:id/reviews/:reviewId', protect, authorize('admin'), deleteProductReview);

module.exports = router;
