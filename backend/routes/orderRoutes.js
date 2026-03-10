const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    getOrderById,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    cancelOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/', protect, authorize('admin'), getAllOrders);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);
router.get('/:id', protect, getOrderById);

module.exports = router;
