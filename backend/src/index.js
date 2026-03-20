// Load env FIRST before anything else
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
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

const app = express();

// Security
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
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

// 404
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    await connectRedis(); // safe — never throws
    setupJobs();

    app.listen(PORT, () => {
      logger.info(`🚀 Detoxify running on http://localhost:${PORT}`);
      logger.info(`🔑 YouTube API: ${process.env.YOUTUBE_API_KEY ? '✅ loaded' : '❌ MISSING'}`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
