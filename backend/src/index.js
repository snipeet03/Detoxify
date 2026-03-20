const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { setupJobs } = require('./jobs/scheduler');
const logger = require('./utils/logger');
const { globalErrorHandler } = require('./middlewares/errorHandler');
const { rateLimiter } = require('./middlewares/rateLimiter');

// Routes
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const creatorRoutes = require('./routes/creators');

dotenv.config();

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/feed', feedRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/creators', creatorRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    await connectRedis();
    setupJobs();

    app.listen(PORT, () => {
      logger.info(`🚀 Detoxify server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

module.exports = app;
