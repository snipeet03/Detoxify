const Joi = require('joi');
const { generateFeed } = require('../services/feedService');
const logger = require('../utils/logger');

const feedSchema = Joi.object({
  keyword: Joi.string().trim().min(2).max(100).required(),
  type: Joi.string().valid('short', 'long', 'both').required(),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
});

/**
 * POST /api/feed
 * Generate a curated learning feed
 */
async function getFeed(req, res, next) {
  try {
    // Validate input
    const { error, value } = feedSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { keyword, type, level } = value;
    logger.info(`Feed request: keyword="${keyword}" type="${type}" level="${level || 'any'}"`);

    const result = await generateFeed({ keyword, type, level });

    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (err) {
    logger.error('Feed generation error:', err.message);
    next(err);
  }
}

module.exports = { getFeed };
