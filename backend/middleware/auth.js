const User = require('../models/User');

// Verify session authentication
const authenticate = async (req, res, next) => {
  try {
    // Check if user is logged in (session exists)
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please login to access this resource',
      });
    }

    // Get user from database
    const user = await User.findById(req.session.userId);
    if (!user) {
      // User was deleted but session still exists
      req.session.destroy();
      return res.status(401).json({
        error: 'Invalid session',
        message: 'User not found. Please login again',
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    // Pass error to error handler middleware
    return next(error);
  }
};

// Check if user has admin role
const authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Admin access required',
    });
  }

  next();
};

module.exports = {
  authenticate,
  authorizeAdmin,
};