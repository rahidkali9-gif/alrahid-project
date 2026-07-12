'use strict';

const express = require('express');
const router = express.Router();

const apiKeyController = require('../controllers/apiKeyController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../utils/validators');

router.use(authenticate);

router.post('/', v.apiKeyCreateRules, validate, apiKeyController.create);
router.get('/', apiKeyController.list);
router.patch('/:id/revoke', apiKeyController.revoke);
router.delete('/:id', apiKeyController.delete);

module.exports = router;
