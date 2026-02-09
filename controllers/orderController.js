const Order = require('../models/Order');
const Product = require('../models/Product');

// Create a new order
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;
    const userId = req.user._id;

    // Validate that all products exist and get their current prices
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          error: 'Product not found',
          message: `Product with ID ${item.productId} does not exist`,
        });
      }

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price, // Use current product price
      });
    }

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      shippingAddress,
    });

    // Total amount will be calculated by pre-save hook
    await order.save();

    // Populate product details for response (include image)
    await order.populate('items.product', 'name description category image');

    res.status(201).json({
      message: 'Order created successfully',
      order: order,
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders for the authenticated user
exports.getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId })
      .populate('items.product', 'name description category price image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: orders.length,
      orders: orders,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single order by ID (user can only see their own orders, admin can see all)
exports.getOrderById = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;
    const userRole = req.user.role;

    const order = await Order.findById(orderId).populate(
      'items.product',
      'name description category price image'
    );

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    // Check if user owns the order or is an admin
    if (order.user.toString() !== userId.toString() && userRole !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view your own orders',
      });
    }

    res.status(200).json({
      order: order,
    });
  } catch (error) {
    next(error);
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('items.product', 'name description category price image');

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    res.status(200).json({
      message: 'Order status updated successfully',
      order: order,
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'email role')
      .populate('items.product', 'name description category price image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: orders.length,
      orders: orders,
    });
  } catch (error) {
    next(error);
  }
};

// User updates their own order (only while pending)
exports.updateOrderByUser = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;
    const { items } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending orders can be modified' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    // Validate products and set current prices
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }
      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: 'Quantity must be at least 1' });
      }
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    order.items = orderItems;
    await order.save();
    await order.populate('items.product', 'name description category price image');

    res.status(200).json({ message: 'Order updated', order });
  } catch (error) {
    next(error);
  }
};

// User deletes their own order
exports.deleteOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Order.findByIdAndDelete(orderId);
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    next(error);
  }
};