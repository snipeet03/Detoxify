const express = require('express');
const { getFeed } = require('../controllers/feedController');

const router = express.Router();

// POST /api/feed
router.post('/', getFeed);

module.exports = router;
