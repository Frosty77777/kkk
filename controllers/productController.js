const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

// Create a new product
exports.createProduct = async (req, res, next) => {
  try {
    const productData = {
      name: req.body.name.trim(),
      price: req.body.price,
      description: req.body.description.trim(),
      category: req.body.category.trim(),
    };
    if (req.file) {
      productData.image = `/uploads/${req.file.filename}`;
    }

    const product = new Product(productData);

    const savedProduct = await product.save();
    res.status(201).json({
      message: 'Product created successfully',
      product: savedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// Get all products
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({
      count: products.length,
      products: products,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single product by ID
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    res.status(200).json({
      product: product,
    });
  } catch (error) {
    next(error);
  }
};

// Update a product
exports.updateProduct = async (req, res, next) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Handle image replacement or removal
    if (req.file) {
      // remove old image file if exists
      if (existing.image) {
        const oldPath = path.join(__dirname, '..', 'public', existing.image.replace(/^\//, ''));
        fs.unlink(oldPath, () => {});
      }
      existing.image = `/uploads/${req.file.filename}`;
    } else if (req.body.removeImage === 'true') {
      if (existing.image) {
        const oldPath = path.join(__dirname, '..', 'public', existing.image.replace(/^\//, ''));
        fs.unlink(oldPath, () => {});
      }
      existing.image = '';
    }

    if (req.body.name !== undefined) existing.name = String(req.body.name).trim();
    if (req.body.price !== undefined) existing.price = req.body.price;
    if (req.body.description !== undefined) existing.description = String(req.body.description).trim();
    if (req.body.category !== undefined) existing.category = String(req.body.category).trim();
    existing.updatedAt = Date.now();

    const product = await existing.save();

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    res.status(200).json({
      message: 'Product updated successfully',
      product: product,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a product
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    // remove image file if exists
    if (product.image) {
      const imgPath = path.join(__dirname, '..', 'public', product.image.replace(/^\//, ''));
      fs.unlink(imgPath, () => {});
    }

    res.status(200).json({
      message: 'Product deleted successfully',
      product: product,
    });
  } catch (error) {
    next(error);
  }
};

