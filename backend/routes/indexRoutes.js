'use strict';

const express = require('express');
const router = express.Router();

const systemController = require('../controllers/systemController');

// Root API index
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Al Rahid API',
    data: {
      name: 'Al Rahid',
      version: '1.0.0',
      docs: '/api/info',
      health: '/health',
    },
  });
});

router.get('/info', systemController.info);
router.get('/features', systemController.featureToggles);

module.exports = router;
