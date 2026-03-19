const { searchVideos, getVideoDetails, getChannelDetails } = require('./youtubeService');
const { rankVideos, splitByType, extractCreators, buildVideoObject } = require('./rankingEngine');
const { buildCacheKey, getCached, setCached } = require('./cacheService');
const logger = require('../utils/logger');

/**
 * Build keyword with level context
 */
function buildSearchQuery(keyword, level) {
  if (!level) return keyword;
  const levelMap = {
    beginner: `${keyword} for beginners tutorial`,
    intermediate: `${keyword} intermediate guide`,
    advanced: `${keyword} advanced deep dive`,
  };
  return levelMap[level] || keyword;
}

/**
 * Main feed generation service
 * Orchestrates: YouTube API → Video Details → Channel Details → Ranking → Split → Cache
 */
async function generateFeed({ keyword, type, level }) {
  const cacheKey = buildCacheKey(keyword, type, level);

  // 1. Try cache first
  const cached = await getCached(cacheKey);
  if (cached) {
    logger.info(`Cache HIT: ${cacheKey}`);
    return { ...cached, meta: { ...cached.meta, cacheUsed: true } };
  }

  logger.info(`Cache MISS: ${cacheKey} — fetching from YouTube`);

  try {
    // 2. Search YouTube
    const searchQuery = buildSearchQuery(keyword, level);
    const searchResults = await searchVideos({ keyword: searchQuery, type, maxResults: 50 });

    if (!searchResults.length) {
      return {
        data: { topVideos: [], shorts: [], creators: [] },
        meta: { totalFetched: 0, cacheUsed: false, message: 'No results found' },
      };
    }

    // 3. Get video IDs
    const videoIds = searchResults
      .map((item) => item.id?.videoId)
      .filter(Boolean);

    // 4. Batch fetch video details
    const videoDetails = await getVideoDetails(videoIds);

    // 5. Get unique channel IDs
    const channelIds = [...new Set(videoDetails.map((v) => v.snippet?.channelId).filter(Boolean))];
    const channelDetails = await getChannelDetails(channelIds);

    // 6. Build channel map for O(1) lookup
    const channelMap = {};
    for (const ch of channelDetails) {
      channelMap[ch.id] = {
        subscriberCount: parseInt(ch.statistics?.subscriberCount || '0', 10),
        title: ch.snippet?.title || '',
      };
    }

    // 7. Build normalized video objects
    const searchMap = {};
    for (const item of searchResults) {
      const id = item.id?.videoId;
      if (id) searchMap[id] = item;
    }

    const videos = videoDetails
      .map((detail) => {
        const searchItem = searchMap[detail.id] || {};
        return buildVideoObject(searchItem, detail, channelMap);
      })
      .filter((v) => v.videoId && v.title);

    // 8. Rank all videos
    const ranked = rankVideos(videos);

    // 9. Split by type
    const { topVideos, shorts } = splitByType(ranked, type);

    // 10. Extract top creators
    const creators = extractCreators(ranked);

    const result = {
      data: { topVideos, shorts, creators },
      meta: {
        totalFetched: videoIds.length,
        cacheUsed: false,
      },
    };

    // 11. Cache the result
    await setCached(cacheKey, result);

    return result;
  } catch (err) {
    if (err.message === 'QUOTA_EXCEEDED') {
      logger.error('YouTube API quota exceeded — no fallback available');
      throw new Error('YouTube API quota exceeded. Please try again later.');
    }
    throw err;
  }
}

module.exports = { generateFeed };
