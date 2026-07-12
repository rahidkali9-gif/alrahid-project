'use strict';

const express = require('express');
const router = express.Router();

const systemController = require('../controllers/systemController');

router.get('/health', systemController.health);
router.get('/info', systemController.info);
router.get('/features', systemController.featureToggles);

module.exports = router;
