const express = require('express');
const router = express.Router();
const { getVariants, getVariant, createVariant, updateVariant, deleteVariant } = require('../controllers/variantController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getVariants)
    .post(protect, authorize('admin'), createVariant);

router.route('/:id')
    .get(getVariant)
    .put(protect, authorize('admin'), updateVariant)
    .delete(protect, authorize('admin'), deleteVariant);

module.exports = router;
