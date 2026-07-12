'use strict';

const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', notificationController.list);
router.get('/unread/count', notificationController.unreadCount);
router.patch('/:id/read', notificationController.markRead);
router.patch('/read-all', notificationController.markAllRead);
router.delete('/:id', notificationController.delete);

module.exports = router;
