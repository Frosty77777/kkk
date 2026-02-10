const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // TLS workaround for Windows SSL handshake error with MongoDB Atlas
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      tls: true,
      tlsAllowInvalidCertificates: true, // Workaround for ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR on Windows
    });

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