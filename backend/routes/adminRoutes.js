'use strict';

const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { authorize, superAdminOnly } = require('../middleware/roles');
const validate = require('../middleware/validate');
const v = require('../utils/validators');

// All admin routes require authentication + admin/super_admin
router.use(authenticate, authorize('admin', 'super_admin'));

// Dashboard
router.get('/dashboard', adminController.dashboard);

// User management
router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUser);
router.patch('/users/:id/role', superAdminOnly, adminController.updateUserRole);
router.patch('/users/:id/activate', adminController.activateUser);
router.delete('/users/:id', superAdminOnly, adminController.deleteUser);

// Wallet management
router.post('/wallet/adjust', v.walletAdjustRules, validate, adminController.adjustWallet);

// AI provider settings
router.get('/ai-providers', adminController.listAiProviders);
router.post('/ai-providers', adminController.upsertAiProvider);
router.delete('/ai-providers/:provider', superAdminOnly, adminController.deleteAiProvider);

// App settings
router.get('/app-settings', adminController.listAppSettings);
router.post('/app-settings', adminController.upsertAppSetting);
router.delete('/app-settings/:key', superAdminOnly, adminController.deleteAppSetting);

// Feature toggles
router.get('/feature-toggles', adminController.listFeatureToggles);
router.post('/feature-toggles', adminController.upsertFeatureToggle);
router.delete('/feature-toggles/:key', superAdminOnly, adminController.deleteFeatureToggle);

// Notifications broadcast
router.post('/notifications/broadcast', adminController.broadcastNotification);

// API keys
router.get('/api-keys', adminController.listAllApiKeys);

// Analytics
router.get('/analytics', adminController.analytics);

// Logs viewer
router.get('/logs', adminController.listActivityLogs);

// System settings (super_admin only)
router.get('/system', adminController.systemInfo);

// Media manager
router.get('/media', adminController.listMedia);
router.delete('/media/:id', adminController.deleteMedia);

// Prompt manager
router.get('/prompts', adminController.listPrompts);
router.post('/prompts', adminController.createPrompt);
router.patch('/prompts/:id', adminController.updatePrompt);
router.delete('/prompts/:id', adminController.deletePrompt);

// Banner manager
router.get('/banners', adminController.listBanners);
router.post('/banners', adminController.createBanner);
router.patch('/banners/:id', adminController.updateBanner);
router.delete('/banners/:id', adminController.deleteBanner);

// Ads manager
router.get('/ads', adminController.listAds);
router.post('/ads', adminController.createAd);
router.patch('/ads/:id', adminController.updateAd);
router.delete('/ads/:id', adminController.deleteAd);

// Admin actions audit log
router.get('/audit', adminController.listAdminActions);

module.exports = router;
