const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { validateProduct } = require('../middleware/validation');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer storage for product images (public is sibling of backend)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', '..', 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  },
});
const upload = multer({ storage });

// Public routes - GET operations
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected routes - Admin only for POST, PUT, DELETE
router.post('/', authenticate, authorizeAdmin, upload.single('image'), validateProduct, productController.createProduct);
router.put('/:id', authenticate, authorizeAdmin, upload.single('image'), validateProduct, productController.updateProduct);
router.delete('/:id', authenticate, authorizeAdmin, productController.deleteProduct);

// Image-only endpoints for authenticated users (change/remove image)
router.post('/:id/image', authenticate, authorizeAdmin, upload.single('image'), productController.updateProduct);
router.delete('/:id/image', authenticate, authorizeAdmin, productController.updateProduct);

module.exports = router;