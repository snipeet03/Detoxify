const logger = require('../utils/logger');

let redisClient = null;

async function connectRedis() {
  // If no REDIS_URL is set, skip Redis entirely — app runs fine without it
  if (!process.env.REDIS_URL) {
    logger.info('ℹ️  Redis disabled (no REDIS_URL set) — running without cache');
    return;
  }

  try {
    const Redis = require('ioredis');
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 2) return null; // stop retrying
        return Math.min(times * 200, 1000);
      },
    });

    await redisClient.connect();
    logger.info('✅ Redis connected');

    redisClient.on('error', (err) => {
      logger.warn('Redis error (non-fatal):', err.message);
      redisClient = null;
    });
  } catch (err) {
    logger.warn('⚠️  Redis unavailable — running without cache:', err.message);
    redisClient = null;
  }
}

function getRedis() {
  return redisClient;
}

module.exports = { connectRedis, getRedis };
