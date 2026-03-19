const express = require('express');
const Creator = require('../models/Creator');

const router = express.Router();

// GET /api/creators?category=AI
router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const creators = await Creator.find(filter).sort({ score: -1 }).limit(20);
    res.json({ success: true, data: creators });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
