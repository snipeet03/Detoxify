const User = require('../models/User');

const DEFAULT_CARDS = ['Machine Learning', 'Web Dev', 'DSA', 'System Design', 'Python', 'React'];

const MAX_CARDS = 15;

/**
 * GET /api/user/cards
 * Returns the authenticated user's personalized card list.
 * Seeds defaults if the list is empty (e.g. migrated legacy accounts).
 */
async function getCards(req, res, next) {
  try {
    let { cards } = req.user;

    // Seed defaults for legacy accounts that have no cards yet
    if (!cards || cards.length === 0) {
      await User.findByIdAndUpdate(req.user._id, { cards: DEFAULT_CARDS });
      cards = DEFAULT_CARDS;
    }

    res.json({ success: true, cards });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/user/cards
 * Body: { keyword: string }
 * Validates and appends a new card keyword to the user's list.
 */
async function addCard(req, res, next) {
  try {
    const { keyword } = req.body;

    // ── Validation ──────────────────────────────────────────────
    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Keyword cannot be empty' });
    }

    const trimmed = keyword.trim();

    const user = await User.findById(req.user._id);
    const currentCards = user.cards || [];

    // Duplicate check (case-insensitive)
    const isDuplicate = currentCards.some(
      (c) => c.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      return res.status(409).json({
        success: false,
        message: `"${trimmed}" is already in your cards`,
      });
    }

    // Max limit check
    if (currentCards.length >= MAX_CARDS) {
      return res.status(400).json({
        success: false,
        message: `You have reached the maximum of ${MAX_CARDS} cards`,
      });
    }

    // ── Save ─────────────────────────────────────────────────────
    user.cards.push(trimmed);
    await user.save();

    res.status(201).json({ success: true, cards: user.cards });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCards, addCard, DEFAULT_CARDS };
