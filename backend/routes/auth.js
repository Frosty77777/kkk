const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authenticate, authController.logout);

// Protected route - Get current user profile
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;