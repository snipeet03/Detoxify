const express = require('express');
const { getCards, addCard } = require('../controllers/cardController');
const { protect } = require('../middlewares/protect');

const router = express.Router();

// GET /api/user/cards
router.get('/cards', protect, getCards);

// POST /api/user/cards
router.post('/cards', protect, addCard);

module.exports = router;
