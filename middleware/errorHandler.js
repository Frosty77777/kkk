// Error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log the full error for debugging
  console.error('Error Handler - Full Error:', err);
  console.error('Error Stack:', err.stack);
  
  // Check if response was already sent
  if (res.headersSent) {
    // If headers were already sent, delegate to Express default error handler
    if (next && typeof next === 'function') {
      return next(err);
    }
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Validation failed',
      details: errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      error: 'Duplicate entry',
      message: `${field} already exists`,
    });
  }

  // Mongoose cast error (invalid ID)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format',
    });
  }

  // Handle "next is not a function" errors
  if (err.message && err.message.includes('next is not a function')) {
    console.error('CRITICAL: next is not a function error detected');
    return res.status(500).json({
      error: 'Internal server error',
      message: 'A middleware error occurred. Please check server logs.',
    });
  }

  // Session errors (if using session-based auth)
  // Note: JWT error handling removed as we're using session-based authentication

  // Default error - return actual error message
  const statusCode = err.status || 500;
  const errorResponse = {
    error: err.message || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  };
  
  // Add more details in development or if it's a known error type
  if (process.env.NODE_ENV === 'development' || err.name) {
    errorResponse.name = err.name;
    if (err.code) errorResponse.code = err.code;
    if (process.env.NODE_ENV === 'development' && err.stack) {
      errorResponse.stack = err.stack;
    }
  }
  
  return res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;

