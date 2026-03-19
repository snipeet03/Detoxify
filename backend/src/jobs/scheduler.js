const cron = require('node-cron');
const { generateFeed } = require('../services/feedService');
const Creator = require('../models/Creator');
const logger = require('../utils/logger');

const TRENDING_TOPICS = [
  { keyword: 'machine learning', type: 'both' },
  { keyword: 'data structures algorithms', type: 'long' },
  { keyword: 'web development', type: 'both' },
  { keyword: 'system design', type: 'long' },
  { keyword: 'javascript', type: 'both' },
  { keyword: 'python programming', type: 'both' },
  { keyword: 'react', type: 'both' },
  { keyword: 'docker kubernetes', type: 'long' },
  { keyword: 'AI prompt engineering', type: 'both' },
  { keyword: 'database design', type: 'long' },
];

/**
 * Pre-warm cache for trending topics
 * Runs daily at 3 AM
 */
async function prefetchTrendingTopics() {
  logger.info('🔄 Job: Pre-fetching trending topics...');
  let success = 0;

  for (const topic of TRENDING_TOPICS) {
    try {
      await generateFeed(topic);
      success++;
      // Delay between calls to avoid quota bursts
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      logger.warn(`Pre-fetch failed for "${topic.keyword}": ${err.message}`);
    }
  }

  logger.info(`✅ Pre-fetch complete: ${success}/${TRENDING_TOPICS.length} topics cached`);
}

/**
 * Setup all cron jobs
 */
function setupJobs() {
  // Pre-fetch trending topics daily at 3:00 AM
  cron.schedule('0 3 * * *', prefetchTrendingTopics, {
    timezone: 'UTC',
  });

  logger.info('⏰ Background jobs scheduled');
}

module.exports = { setupJobs, prefetchTrendingTopics };
