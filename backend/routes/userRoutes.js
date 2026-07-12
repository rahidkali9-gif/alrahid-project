'use strict';

const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.patch('/profile', userController.updateProfile);
router.put('/basic', userController.updateBasicInfo);
router.patch('/basic', userController.updateBasicInfo);
router.get('/overview', userController.getOverview);

module.exports = router;
