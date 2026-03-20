const axios = require('axios');
const logger = require('../utils/logger');

const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Read API key at call-time (not module load time) so dotenv is always loaded first
function getApiKey() {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error('YOUTUBE_API_KEY is not set in environment');
  return key;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, params, retries = 3, delay = 800) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, { params, timeout: 15000 });
      return response.data;
    } catch (err) {
      const status = err?.response?.status;
      const errData = err?.response?.data?.error;

      logger.warn(`YouTube API attempt ${attempt}/${retries} failed [${status}]: ${err.message}`);

      if (status === 403) {
        // Check if it's quota vs bad key
        const reason = errData?.errors?.[0]?.reason || '';
        if (reason === 'quotaExceeded' || reason === 'dailyLimitExceeded') {
          throw new Error('QUOTA_EXCEEDED');
        }
        throw new Error(`YouTube API key error: ${errData?.message || 'Forbidden'}`);
      }

      if (status === 400) {
        throw new Error(`Bad YouTube API request: ${errData?.message || 'Bad Request'}`);
      }

      if (attempt === retries) throw err;

      const retryable = !status || status >= 500;
      if (!retryable) throw err;

      await sleep(delay * Math.pow(2, attempt - 1));
    }
  }
}

async function searchVideos({ keyword, type, maxResults = 50 }) {
  const videoDuration = type === 'short' ? 'short' : type === 'long' ? 'long' : undefined;

  const params = {
    part: 'snippet',
    q: keyword,
    type: 'video',
    maxResults,
    order: 'relevance',
    relevanceLanguage: 'en',
    safeSearch: 'moderate',
    key: getApiKey(),
  };

  if (videoDuration) params.videoDuration = videoDuration;

  const data = await fetchWithRetry(`${YOUTUBE_BASE_URL}/search`, params);
  return data.items || [];
}

async function getVideoDetails(videoIds) {
  if (!videoIds.length) return [];

  const results = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const params = {
      part: 'statistics,contentDetails,snippet',
      id: batch.join(','),
      key: getApiKey(),
    };
    const data = await fetchWithRetry(`${YOUTUBE_BASE_URL}/videos`, params);
    results.push(...(data.items || []));
  }

  return results;
}

async function getChannelDetails(channelIds) {
  const uniqueIds = [...new Set(channelIds)].filter(Boolean);
  if (!uniqueIds.length) return [];

  // Batch in groups of 50
  const results = [];
  for (let i = 0; i < uniqueIds.length; i += 50) {
    const batch = uniqueIds.slice(i, i + 50);
    const params = {
      part: 'statistics,snippet',
      id: batch.join(','),
      key: getApiKey(),
    };
    const data = await fetchWithRetry(`${YOUTUBE_BASE_URL}/channels`, params);
    results.push(...(data.items || []));
  }
  return results;
}

module.exports = { searchVideos, getVideoDetails, getChannelDetails };
