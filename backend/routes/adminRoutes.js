const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, updateUser, deleteUser } = require('../controllers/adminController');
const { getAllCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { getAllProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/users', protect, authorize('admin'), getAllUsers);
router.post('/users', protect, authorize('admin'), createUser);
router.put('/users/:id', protect, authorize('admin'), updateUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

// Category Management
router.get('/categories', protect, authorize('admin'), getAllCategories);
router.post('/categories', protect, authorize('admin'), createCategory);
router.put('/categories/:id', protect, authorize('admin'), updateCategory);
router.delete('/categories/:id', protect, authorize('admin'), deleteCategory);

// Product Management
router.get('/products', protect, authorize('admin'), getAllProducts);
router.post('/products', protect, authorize('admin'), createProduct);
router.put('/products/:id', protect, authorize('admin'), updateProduct);
router.delete('/products/:id', protect, authorize('admin'), deleteProduct);

// Team Management
router.get('/team', protect, authorize('admin'), getTeamMembers);
router.post('/team', protect, authorize('admin'), createTeamMember);
router.put('/team/:id', protect, authorize('admin'), updateTeamMember);
router.delete('/team/:id', protect, authorize('admin'), deleteTeamMember);

module.exports = router;
