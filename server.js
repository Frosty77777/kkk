require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const productRoutes = require('./routes/products');
const reviewRoutes = require('./routes/reviews');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: true,
  credentials: true, // Allow cookies to be sent
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration
// Use memory store if MongoDB is not available (for development)
let sessionStore = undefined;

// Try to create MongoStore only if MONGODB_URI is set
if (process.env.MONGODB_URI) {
  try {
    sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 14 * 24 * 60 * 60, // 14 days
      autoRemove: 'native',
      touchAfter: 24 * 3600, // lazy session update
    });
    console.log('MongoDB session store initialized');
  } catch (error) {
    console.warn('Warning: Could not initialize MongoDB session store. Using memory store.');
    console.warn('Error:', error.message);
    sessionStore = undefined; // Will use default memory store
  }
} else {
  console.log('Using memory session store (MONGODB_URI not set)');
}

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
    httpOnly: true, // Prevent XSS attacks
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
  },
};

// Only add store if it was successfully created
if (sessionStore) {
  sessionConfig.store = sessionStore;
}

app.use(session(sessionConfig));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes); 
app.use('/api/orders', orderRoutes);

// Root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Login page
app.get('/login.html', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

// Register page
app.get('/register.html', (req, res) => {
  res.sendFile(__dirname + '/public/register.html');
});

// 404 handler (must have next parameter even if not used)
app.use((req, res, next) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'Configured' : 'Using default localhost'}`);
  console.log(`Session Secret: ${process.env.SESSION_SECRET ? 'Configured' : 'Using default (not recommended for production)'}`);
});

module.exports = app;