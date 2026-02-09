const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Create a new order (authenticated users)
router.post('/', authenticate, orderController.createOrder);

// Get all orders for current user
router.get('/', authenticate, orderController.getUserOrders);

// Get single order
router.get('/:id', authenticate, orderController.getOrderById);

// Update order status (admin only)
router.put('/:id/status', authenticate, authorizeAdmin, orderController.updateOrderStatus);

// Update an order (user can change their own order items - only while pending)
router.put('/:id', authenticate, orderController.updateOrderByUser);

// Delete an order (user can delete their own order)
router.delete('/:id', authenticate, orderController.deleteOrder);

module.exports = router;

