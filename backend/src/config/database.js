const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error('MongoDB connection error:', err.message);
    throw err;
  }
}

module.exports = { connectDB };
