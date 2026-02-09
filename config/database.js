const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // We 'await' the connection and assign it to 'conn'
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    console.error('Please check your MONGODB_URI in .env file');
    // Don't exit in development - allow server to start but operations will fail
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;