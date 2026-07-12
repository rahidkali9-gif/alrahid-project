'use strict';

const express = require('express');
const router = express.Router();

const settingsController = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', settingsController.list);
router.get('/:key', settingsController.get);
router.post('/', settingsController.upsert);
router.put('/', settingsController.bulk);
router.delete('/:key', settingsController.remove);

module.exports = router;
