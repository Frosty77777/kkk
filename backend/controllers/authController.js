const User = require('../models/User');
const mongoose = require('mongoose');

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: 'Database unavailable',
        message: 'MongoDB is not connected. Please check your database connection.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'Email is already registered',
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      role: role || 'user', // Default to 'user' if not specified
    });

    await user.save();

    // Create session (wrap in try-catch in case session store fails)
    try {
      req.session.userId = user._id.toString();
      req.session.userEmail = user.email;
      req.session.userRole = user.role;
    } catch (sessionError) {
      console.error('Session error during registration:', sessionError);
      // Continue even if session fails - user is still created
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // Log the full error for debugging
    console.error('Registration error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'Email is already registered',
      });
    }
    
    // Ensure next is a function before calling it
    if (next && typeof next === 'function') {
      return next(error);
    }
    
    // Fallback if next is not available - return detailed error
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
      error: error.message || 'Registration failed',
      message: error.message || 'An error occurred during registration',
      name: error.name,
      ...(error.code && { code: error.code }),
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack,
        fullError: error.toString()
      }),
    });
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: 'Database unavailable',
        message: 'MongoDB is not connected. Please check your database connection.',
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
      });
    }

    // Create session (wrap in try-catch in case session store fails)
    try {
      req.session.userId = user._id.toString();
      req.session.userEmail = user.email;
      req.session.userRole = user.role;
    } catch (sessionError) {
      console.error('Session error during login:', sessionError);
      // Continue even if session fails - login is still valid
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // Ensure next is a function before calling it
    if (next && typeof next === 'function') {
      return next(error);
    }
    // Fallback if next is not available
    console.error('Login error:', error);
    return res.status(500).json({
      error: 'Login failed',
      message: error.message || 'An error occurred during login',
    });
  }
};

// Logout user
exports.logout = async (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          error: 'Logout failed',
          message: 'Could not destroy session',
        });
      }
      res.clearCookie('connect.sid');
      res.status(200).json({
        message: 'Logout successful',
      });
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

