'use strict';

const express = require('express');
const router = express.Router();

const uploadController = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/', uploadController.uploadFile);
router.get('/', uploadController.list);
router.delete('/:id', uploadController.delete);

module.exports = router;
