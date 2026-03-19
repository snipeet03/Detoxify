/**
 * DETOXIFY RANKING ENGINE
 * ========================
 * Scores videos using a composite formula:
 *
 * score = (viewsNormalized * 0.25)
 *       + (likesNormalized * 0.25)
 *       + (recencyScore * 0.20)
 *       + (channelAuthority * 0.20)
 *       + (engagementRatio * 0.10)
 *
 * Videos are also filtered for spam/clickbait before ranking.
 */

const CLICKBAIT_PATTERNS = [
  /\b(shocking|insane|you won't believe|mind blowing|gone wrong|gone sexual|gone wild|prank|exposed|leaked|deleted|banned)\b/i,
  /\b(10x|100x|earn \$|make money|get rich|passive income)\b/i,
  /(!{2,}|\?{2,})/,   // Multiple exclamation/question marks
  /[A-Z]{5,}/,         // Excessive caps (5+ chars)
];

const SPAM_MIN_ENGAGEMENT_RATIO = 0.01; // likes/views < 1% = suspicious

/**
 * Normalize a value to [0,1] using min-max normalization
 */
function minMaxNormalize(value, min, max) {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

/**
 * Compute recency score using exponential decay
 * Half-life ≈ 30 days → decay constant k = ln(2)/30
 */
function recencyScore(publishedAt) {
  const now = Date.now();
  const published = new Date(publishedAt).getTime();
  const ageInDays = (now - published) / (1000 * 60 * 60 * 24);
  const k = Math.log(2) / 30; // 30-day half-life
  return Math.exp(-k * ageInDays);
}

/**
 * Compute channel authority score [0,1]
 * Based on subscriber count (log-scaled)
 */
function channelAuthorityScore(subscriberCount) {
  if (!subscriberCount || subscriberCount <= 0) return 0;
  // Log scale: 100K subs → ~0.5, 1M → ~0.7, 10M → ~1.0
  const score = Math.log10(subscriberCount) / 7;
  return Math.min(1, Math.max(0, score));
}

/**
 * Check if a video title looks like clickbait/spam
 */
function isClickbait(title) {
  return CLICKBAIT_PATTERNS.some((pattern) => pattern.test(title));
}

/**
 * Parse ISO 8601 duration to seconds
 * Example: PT4M13S → 253
 */
function parseDuration(iso) {
  if (!iso) return 0;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const [, h = 0, m = 0, s = 0] = match;
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

/**
 * Build a normalized video object from raw YouTube API data
 */
function buildVideoObject(searchItem, detailItem, channelMap) {
  const videoId = detailItem.id;
  const snippet = detailItem.snippet || searchItem.snippet || {};
  const stats = detailItem.statistics || {};
  const content = detailItem.contentDetails || {};
  const channelId = snippet.channelId;
  const channelData = channelMap[channelId] || {};

  const views = parseInt(stats.viewCount || '0', 10);
  const likes = parseInt(stats.likeCount || '0', 10);
  const subscriberCount = parseInt(channelData.subscriberCount || '0', 10);
  const duration = parseDuration(content.duration);

  return {
    videoId,
    title: snippet.title || '',
    description: (snippet.description || '').slice(0, 300),
    thumbnail: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
    channelId,
    channelTitle: snippet.channelTitle || '',
    publishedAt: snippet.publishedAt || new Date().toISOString(),
    duration,
    isShort: duration > 0 && duration <= 60,
    views,
    likes,
    subscriberCount,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
  };
}

/**
 * Main ranking function
 * @param {Array} videos - raw video objects (from buildVideoObject)
 * @returns {Array} - ranked, filtered videos with scores
 */
function rankVideos(videos) {
  // Step 1: Filter out clickbait and spam
  const filtered = videos.filter((v) => {
    if (isClickbait(v.title)) return false;
    if (v.views > 1000 && v.likes / v.views < SPAM_MIN_ENGAGEMENT_RATIO) return false;
    return true;
  });

  if (!filtered.length) return [];

  // Step 2: Compute normalization ranges
  const allViews = filtered.map((v) => v.views);
  const allLikes = filtered.map((v) => v.likes);
  const minViews = Math.min(...allViews);
  const maxViews = Math.max(...allViews);
  const minLikes = Math.min(...allLikes);
  const maxLikes = Math.max(...allLikes);

  // Step 3: Score each video
  const scored = filtered.map((v) => {
    const viewsNormalized = minMaxNormalize(v.views, minViews, maxViews);
    const likesNormalized = minMaxNormalize(v.likes, minLikes, maxLikes);
    const recency = recencyScore(v.publishedAt);
    const authority = channelAuthorityScore(v.subscriberCount);
    const engagementRatio = v.views > 0 ? Math.min(v.likes / v.views, 1) : 0;

    const score =
      viewsNormalized * 0.25 +
      likesNormalized * 0.25 +
      recency * 0.20 +
      authority * 0.20 +
      engagementRatio * 0.10;

    return { ...v, score: parseFloat(score.toFixed(4)) };
  });

  // Step 4: Sort descending by score
  return scored.sort((a, b) => b.score - a.score);
}

/**
 * Split videos into topVideos (long) and shorts
 */
function splitByType(rankedVideos, type) {
  const shorts = rankedVideos.filter((v) => v.isShort);
  const longForm = rankedVideos.filter((v) => !v.isShort);

  if (type === 'short') return { topVideos: [], shorts: shorts.slice(0, 10) };
  if (type === 'long') return { topVideos: longForm.slice(0, 8), shorts: [] };

  // Both
  return {
    topVideos: longForm.slice(0, 6),
    shorts: shorts.slice(0, 4),
  };
}

/**
 * Extract unique creators from ranked video list
 */
function extractCreators(rankedVideos) {
  const seen = new Set();
  const creators = [];

  for (const v of rankedVideos) {
    if (!seen.has(v.channelId)) {
      seen.add(v.channelId);
      creators.push({
        channelId: v.channelId,
        channelTitle: v.channelTitle,
        subscriberCount: v.subscriberCount,
        score: v.score,
      });
    }
  }

  return creators.slice(0, 6);
}

module.exports = {
  rankVideos,
  splitByType,
  extractCreators,
  buildVideoObject,
  parseDuration,
  isClickbait,
  recencyScore,
  channelAuthorityScore,
};
