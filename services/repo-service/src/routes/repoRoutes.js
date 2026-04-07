const express = require('express');
const router = express.Router();
const repoController = require('../controllers/repoController');

// This handles both the initial "Analyze" and the "Follow-up Chat"
router.post('/analyze', repoController.analyzeOrChat);
router.get('/history/:user_id', repoController.getUserHistory);

module.exports = router;