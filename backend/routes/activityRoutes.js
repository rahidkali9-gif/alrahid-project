'use strict';

const express = require('express');
const router = express.Router();

const activityController = require('../controllers/activityController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', activityController.list);

module.exports = router;
