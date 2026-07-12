'use strict';

/**
 * Route index — mounts all route modules under /api.
 */
const express = require('express');
const router = express.Router();

const indexRoutes = require('./indexRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const settingsRoutes = require('./settingsRoutes');
const notificationRoutes = require('./notificationRoutes');
const historyRoutes = require('./historyRoutes');
const walletRoutes = require('./walletRoutes');
const activityRoutes = require('./activityRoutes');
const apiKeyRoutes = require('./apiKeyRoutes');
const aiRoutes = require('./aiRoutes');
const uploadRoutes = require('./uploadRoutes');
const systemRoutes = require('./systemRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/', indexRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/settings', settingsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/history', historyRoutes);
router.use('/wallet', walletRoutes);
router.use('/activity', activityRoutes);
router.use('/api-keys', apiKeyRoutes);
router.use('/ai', aiRoutes);
router.use('/uploads', uploadRoutes);
router.use('/system', systemRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
