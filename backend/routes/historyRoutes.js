'use strict';

const express = require('express');
const router = express.Router();

const historyController = require('../controllers/historyController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', historyController.list);
router.delete('/all', historyController.clearAll);
router.delete('/:id', historyController.delete);

module.exports = router;
