const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { validateReview } = require('../middleware/validation');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Public routes - GET operations
router.get('/', reviewController.getAllReviews);
router.get('/:id', reviewController.getReviewById);

// Protected routes - Admin only for POST, PUT, DELETE
router.post('/', authenticate, authorizeAdmin, validateReview, reviewController.createReview);
router.put('/:id', authenticate, authorizeAdmin, validateReview, reviewController.updateReview);
router.delete('/:id', authenticate, authorizeAdmin, reviewController.deleteReview);

module.exports = router;