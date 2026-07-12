'use strict';

const express = require('express');
const router = express.Router();

const walletController = require('../controllers/walletController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', walletController.getBalance);
router.get('/balance', walletController.getBalance);
router.get('/transactions', walletController.transactions);

module.exports = router;
