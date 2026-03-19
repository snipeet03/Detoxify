const { getRedis } = require('../config/redis');
const logger = require('../utils/logger');

const CACHE_TTL = parseInt(process.env.CACHE_TTL || '21600', 10); // 6 hours

// In-memory cache fallback when Redis is unavailable
const memoryCache = new Map();

/**
 * Build a consistent cache key
 */
function buildCacheKey(keyword, type, level) {
  const base = `feed:${keyword.toLowerCase().trim()}:${type}`;
  return level ? `${base}:${level}` : base;
}

/**
 * Get cached feed data
 * @returns {object|null}
 */
async function getCached(key) {
  const redis = getRedis();
  if (redis) {
    try {
      const raw = await redis.get(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      logger.warn('Cache read error:', err.message);
      return null;
    }
  } else {
    // Fallback to in-memory cache
    const cached = memoryCache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiresAt) {
      memoryCache.delete(key);
      return null;
    }
    logger.info(`Memory cache HIT: ${key}`);
    return cached.data;
  }
}

/**
 * Store ranked feed in cache
 */
async function setCached(key, data, ttl = CACHE_TTL) {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.setex(key, ttl, JSON.stringify(data));
      logger.info(`Cache SET: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (err) {
      logger.warn('Cache write error:', err.message);
      return false;
    }
  } else {
    // Fallback to in-memory cache
    const expiresAt = Date.now() + (ttl * 1000);
    memoryCache.set(key, { data, expiresAt });
    logger.info(`Memory cache SET: ${key} (TTL: ${ttl}s)`);
    return true;
  }
}

/**
 * Delete a cache key (for forced refresh)
 */
async function deleteCached(key) {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.del(key);
      return true;
    } catch (err) {
      logger.warn('Cache delete error:', err.message);
      return false;
    }
  } else {
    // Fallback to in-memory cache
    memoryCache.delete(key);
    return true;
  }
}

/**
 * List all cache keys with a prefix
 */
async function listKeys(prefix = 'feed:') {
  const redis = getRedis();
  if (redis) {
    try {
      return await redis.keys(`${prefix}*`);
    } catch (err) {
      logger.warn('Cache list error:', err.message);
      return [];
    }
  } else {
    // Fallback to in-memory cache
    return Array.from(memoryCache.keys()).filter(key => key.startsWith(prefix));
  }
}

module.exports = { buildCacheKey, getCached, setCached, deleteCached, listKeys };
