const Review = require('../models/Review');
const Product = require('../models/Product');

// Create a new review
exports.createReview = async (req, res, next) => {
  try {
    // Verify that the product exists
    const product = await Product.findById(req.body.productId);
    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    const review = new Review({
      productId: req.body.productId,
      reviewerName: req.body.reviewerName.trim(),
      rating: req.body.rating,
      comment: req.body.comment.trim(),
    });

    const savedReview = await review.save();
    res.status(201).json({
      message: 'Review created successfully',
      review: savedReview,
    });
  } catch (error) {
    next(error);
  }
};

// Get all reviews
exports.getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find().populate('productId', 'name').sort({ createdAt: -1 });
    res.status(200).json({
      count: reviews.length,
      reviews: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single review by ID
exports.getReviewById = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id).populate('productId', 'name');
    
    if (!review) {
      return res.status(404).json({
        error: 'Review not found',
      });
    }

    res.status(200).json({
      review: review,
    });
  } catch (error) {
    next(error);
  }
};

// Update a review
exports.updateReview = async (req, res, next) => {
  try {
    // Verify that the product exists
    const product = await Product.findById(req.body.productId);
    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        productId: req.body.productId,
        reviewerName: req.body.reviewerName.trim(),
        rating: req.body.rating,
        comment: req.body.comment.trim(),
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    ).populate('productId', 'name');

    if (!review) {
      return res.status(404).json({
        error: 'Review not found',
      });
    }

    res.status(200).json({
      message: 'Review updated successfully',
      review: review,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a review
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        error: 'Review not found',
      });
    }

    res.status(200).json({
      message: 'Review deleted successfully',
      review: review,
    });
  } catch (error) {
    next(error);
  }
};

