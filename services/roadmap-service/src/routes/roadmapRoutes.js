const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');

// Generation
router.post('/generate', roadmapController.getOrGenerate);

// Activation & Collection
router.post('/activate', roadmapController.activateRoadmap);
router.get('/my-collection/:user_id', roadmapController.getMyCollection);

// Active View & Progress
router.get('/single/:id', roadmapController.getSingleRoadmap); // REQUIRED for the live page
router.patch('/update-progress', roadmapController.updateProgress); // REQUIRED for checkboxes

module.exports = router;