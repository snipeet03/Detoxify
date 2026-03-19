const axios = require('axios');
const logger = require('../utils/logger');

const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const API_KEY = process.env.YOUTUBE_API_KEY;

/**
 * Sleep helper for exponential backoff
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch from YouTube API with exponential backoff retry
 */
async function fetchWithRetry(url, params, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, { params, timeout: 10000 });
      return response.data;
    } catch (err) {
      const status = err?.response?.status;
      const isQuotaError = status === 403;
      const isRetryable = status === 500 || status === 503 || !status;

      logger.warn(`YouTube API attempt ${attempt} failed: ${err.message}`);

      if (isQuotaError) {
        logger.error('YouTube API quota exceeded');
        throw new Error('QUOTA_EXCEEDED');
      }

      if (attempt === retries || !isRetryable) throw err;

      await sleep(delay * Math.pow(2, attempt - 1));
    }
  }
}

/**
 * Search videos by keyword
 */
async function searchVideos({ keyword, type, maxResults = 50 }) {
  const videoDuration = type === 'short' ? 'short' : type === 'long' ? 'long' : undefined;

  const params = {
    part: 'snippet',
    q: keyword,
    type: 'video',
    maxResults,
    order: 'relevance',
    relevanceLanguage: 'en',
    key: API_KEY,
  };

  if (videoDuration) params.videoDuration = videoDuration;

  const data = await fetchWithRetry(`${YOUTUBE_BASE_URL}/search`, params);
  return data.items || [];
}

/**
 * Get detailed video statistics (views, likes, duration)
 */
async function getVideoDetails(videoIds) {
  if (!videoIds.length) return [];

  // Batch in groups of 50
  const batches = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    batches.push(videoIds.slice(i, i + 50));
  }

  const results = [];
  for (const batch of batches) {
    const params = {
      part: 'statistics,contentDetails,snippet',
      id: batch.join(','),
      key: API_KEY,
    };

    const data = await fetchWithRetry(`${YOUTUBE_BASE_URL}/videos`, params);
    results.push(...(data.items || []));
  }

  return results;
}

/**
 * Get channel details (subscriber count, etc.)
 */
async function getChannelDetails(channelIds) {
  const uniqueIds = [...new Set(channelIds)];
  if (!uniqueIds.length) return [];

  const params = {
    part: 'statistics,snippet',
    id: uniqueIds.join(','),
    key: API_KEY,
  };

  const data = await fetchWithRetry(`${YOUTUBE_BASE_URL}/channels`, params);
  return data.items || [];
}

module.exports = { searchVideos, getVideoDetails, getChannelDetails };
