const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;

async function connectRedis() {
  try {
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      lazyConnect: true,
    });

    await redisClient.connect();
    logger.info('✅ Redis connected');

    redisClient.on('error', (err) => {
      logger.error('Redis error:', err.message);
    });
  } catch (err) {
    logger.warn('⚠️  Redis unavailable, running without cache:', err.message);
    redisClient = null;
  }
}

function getRedis() {
  return redisClient;
}

module.exports = { connectRedis, getRedis };
