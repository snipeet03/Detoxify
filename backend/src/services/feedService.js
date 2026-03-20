const { searchVideos, getVideoDetails, getChannelDetails } = require('./youtubeService');
const { rankVideos, splitByType, extractCreators, buildVideoObject } = require('./rankingEngine');
const { buildCacheKey, getCached, setCached } = require('./cacheService');
const logger = require('../utils/logger');

function buildSearchQuery(keyword, level) {
  if (!level) return keyword;
  const map = {
    beginner:     `${keyword} for beginners tutorial`,
    intermediate: `${keyword} intermediate guide`,
    advanced:     `${keyword} advanced deep dive`,
  };
  return map[level] || keyword;
}

async function generateFeed({ keyword, type, level }) {
  const cacheKey = buildCacheKey(keyword, type, level);

  // 1. Try cache
  const cached = await getCached(cacheKey);
  if (cached) {
    logger.info(`Cache HIT: ${cacheKey}`);
    return { ...cached, meta: { ...cached.meta, cacheUsed: true } };
  }

  logger.info(`Fetching YouTube: "${keyword}" [${type}]`);

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
  const videoIds = searchResults.map((item) => item.id?.videoId).filter(Boolean);

  // 4. Fetch video details
  const videoDetails = await getVideoDetails(videoIds);

  // 5. Fetch channel details
  const channelIds = [...new Set(videoDetails.map((v) => v.snippet?.channelId).filter(Boolean))];
  const channelDetails = await getChannelDetails(channelIds);

  // 6. Build channel map
  const channelMap = {};
  for (const ch of channelDetails) {
    channelMap[ch.id] = {
      subscriberCount: parseInt(ch.statistics?.subscriberCount || '0', 10),
      title: ch.snippet?.title || '',
    };
  }

  // 7. Build search map
  const searchMap = {};
  for (const item of searchResults) {
    const id = item.id?.videoId;
    if (id) searchMap[id] = item;
  }

  // 8. Normalize video objects
  const videos = videoDetails
    .map((detail) => buildVideoObject(searchMap[detail.id] || {}, detail, channelMap))
    .filter((v) => v.videoId && v.title);

  // 9. Rank
  const ranked = rankVideos(videos);

  // 10. Split
  const { topVideos, shorts } = splitByType(ranked, type);

  // 11. Creators
  const creators = extractCreators(ranked);

  const result = {
    data: { topVideos, shorts, creators },
    meta: { totalFetched: videoIds.length, cacheUsed: false },
  };

  // 12. Cache
  await setCached(cacheKey, result);

  logger.info(`Feed ready: ${topVideos.length} videos, ${shorts.length} shorts, ${creators.length} creators`);

  return result;
}

module.exports = { generateFeed };
