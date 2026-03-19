const {
  rankVideos,
  isClickbait,
  recencyScore,
  channelAuthorityScore,
  parseDuration,
} = require('../src/services/rankingEngine');

describe('Ranking Engine', () => {
  describe('isClickbait()', () => {
    it('flags shocking titles', () => {
      expect(isClickbait('SHOCKING truth about React!!!')).toBe(true);
    });
    it('flags excessive caps', () => {
      expect(isClickbait('LEARN PYTHON NOW FOR FREE')).toBe(true);
    });
    it('passes clean titles', () => {
      expect(isClickbait('Understanding async/await in JavaScript')).toBe(false);
      expect(isClickbait('Data Structures: Trees explained')).toBe(false);
    });
  });

  describe('recencyScore()', () => {
    it('returns ~1 for very recent videos', () => {
      const recent = new Date(Date.now() - 1000 * 60 * 60).toISOString(); // 1 hour ago
      expect(recencyScore(recent)).toBeCloseTo(1, 1);
    });
    it('returns ~0.5 for 30-day-old videos', () => {
      const old = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      expect(recencyScore(old)).toBeCloseTo(0.5, 1);
    });
    it('returns lower values for older videos', () => {
      const old = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
      expect(recencyScore(old)).toBeLessThan(0.1);
    });
  });

  describe('channelAuthorityScore()', () => {
    it('returns 0 for no subscribers', () => {
      expect(channelAuthorityScore(0)).toBe(0);
    });
    it('returns values between 0 and 1', () => {
      const score = channelAuthorityScore(500000);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1);
    });
    it('returns higher score for larger channels', () => {
      expect(channelAuthorityScore(1_000_000)).toBeGreaterThan(channelAuthorityScore(10_000));
    });
  });

  describe('parseDuration()', () => {
    it('parses hours minutes seconds', () => {
      expect(parseDuration('PT1H30M45S')).toBe(5445);
    });
    it('parses minutes only', () => {
      expect(parseDuration('PT14M33S')).toBe(873);
    });
    it('parses seconds only', () => {
      expect(parseDuration('PT45S')).toBe(45);
    });
    it('returns 0 for empty input', () => {
      expect(parseDuration('')).toBe(0);
    });
  });

  describe('rankVideos()', () => {
    const baseVideo = (overrides = {}) => ({
      videoId: Math.random().toString(36).slice(2),
      title: 'Understanding TypeScript generics',
      channelId: 'ch1',
      channelTitle: 'Code Academy',
      publishedAt: new Date().toISOString(),
      duration: 600,
      isShort: false,
      views: 50000,
      likes: 2500,
      subscriberCount: 200000,
      ...overrides,
    });

    it('returns empty array for empty input', () => {
      expect(rankVideos([])).toEqual([]);
    });

    it('filters clickbait titles', () => {
      const videos = [
        baseVideo({ title: 'SHOCKING TypeScript secrets!!!' }),
        baseVideo({ title: 'TypeScript generics explained clearly' }),
      ];
      const ranked = rankVideos(videos);
      expect(ranked.every((v) => !v.title.includes('SHOCKING'))).toBe(true);
    });

    it('ranks videos with score field', () => {
      const videos = [baseVideo(), baseVideo(), baseVideo()];
      const ranked = rankVideos(videos);
      expect(ranked.every((v) => typeof v.score === 'number')).toBe(true);
    });

    it('returns videos sorted by score descending', () => {
      const videos = [
        baseVideo({ views: 100, likes: 10 }),
        baseVideo({ views: 100000, likes: 8000 }),
        baseVideo({ views: 5000, likes: 300 }),
      ];
      const ranked = rankVideos(videos);
      for (let i = 0; i < ranked.length - 1; i++) {
        expect(ranked[i].score).toBeGreaterThanOrEqual(ranked[i + 1].score);
      }
    });

    it('filters spam (very low engagement ratio)', () => {
      const videos = [
        baseVideo({ views: 100000, likes: 1 }), // 0.001% ratio — spam
        baseVideo({ views: 10000, likes: 500 }),  // normal
      ];
      const ranked = rankVideos(videos);
      expect(ranked.length).toBe(1);
    });
  });
});
