'use strict';

/**
 * Admin controller — all admin APIs.
 */
const adminService = require('../services/adminService');
const models = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

function parsePaging(req) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 20));
  return { page, limit };
}

// ── Dashboard ─────────────────────────────────────────────────
exports.dashboard = asyncHandler(async (req, res) => {
  const stats = await adminService.dashboardStats();
  return ApiResponse.success(res, 'Dashboard stats', stats);
});

// ── User management ───────────────────────────────────────────
exports.listUsers = asyncHandler(async (req, res) => {
  const { page, limit } = parsePaging(req);
  const result = await adminService.listUsers({
    page,
    limit,
    search: req.query.search || '',
    role: req.query.role || '',
    isActive: req.query.isActive === undefined ? null : req.query.isActive === 'true',
  });
  return ApiResponse.paginated(res, 'Users fetched', result.rows, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: Math.ceil(result.total / result.limit),
  });
});

exports.getUser = asyncHandler(async (req, res) => {
  const user = await adminService.getUser(req.params.id);
  return ApiResponse.success(res, 'User fetched', user);
});

exports.updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await adminService.updateUserRole(req.user.id, req.params.id, role);
  return ApiResponse.success(res, 'User role updated', { user });
});

exports.activateUser = asyncHandler(async (req, res) => {
  const { active } = req.body;
  const user = await adminService.activateUser(req.user.id, req.params.id, active);
  return ApiResponse.success(res, 'User status updated', { user });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  await adminService.deleteUser(req.user.id, req.params.id);
  return ApiResponse.success(res, 'User deleted');
});

// ── AI provider settings ──────────────────────────────────────
exports.listAiProviders = asyncHandler(async (req, res) => {
  const rows = await adminService.listAiProviders();
  return ApiResponse.success(res, 'AI providers fetched', { providers: rows });
});

exports.upsertAiProvider = asyncHandler(async (req, res) => {
  const { provider, apiBaseUrl, apiKey, defaultModel, isActive, config } = req.body;
  if (!provider || !apiBaseUrl) throw ApiError.badRequest('provider and apiBaseUrl are required');
  const row = await adminService.upsertAiProvider(req.user.id, {
    provider,
    apiBaseUrl,
    apiKey,
    defaultModel,
    isActive: isActive !== false,
    config: config || {},
  });
  return ApiResponse.success(res, 'AI provider saved', { provider: row });
});

exports.deleteAiProvider = asyncHandler(async (req, res) => {
  await adminService.deleteAiProvider(req.user.id, req.params.provider);
  return ApiResponse.success(res, 'AI provider deleted');
});

// ── App settings ──────────────────────────────────────────────
exports.listAppSettings = asyncHandler(async (req, res) => {
  const rows = await adminService.listAppSettings({
    publicOnly: false,
    category: req.query.category || null,
  });
  return ApiResponse.success(res, 'App settings fetched', { settings: rows });
});

exports.upsertAppSetting = asyncHandler(async (req, res) => {
  const { key, value, category, isPublic } = req.body;
  if (!key) throw ApiError.badRequest('key is required');
  const row = await adminService.upsertAppSetting(req.user.id, {
    key,
    value: value === undefined ? null : value,
    category: category || 'general',
    isPublic: !!isPublic,
  });
  return ApiResponse.success(res, 'App setting saved', { setting: row });
});

exports.deleteAppSetting = asyncHandler(async (req, res) => {
  await adminService.deleteAppSetting(req.user.id, req.params.key);
  return ApiResponse.success(res, 'App setting deleted');
});

// ── Feature toggles ───────────────────────────────────────────
exports.listFeatureToggles = asyncHandler(async (req, res) => {
  const rows = await adminService.listFeatureToggles();
  return ApiResponse.success(res, 'Feature toggles fetched', { toggles: rows });
});

exports.upsertFeatureToggle = asyncHandler(async (req, res) => {
  const { featureKey, isEnabled, description } = req.body;
  if (!featureKey) throw ApiError.badRequest('featureKey is required');
  const row = await adminService.upsertFeatureToggle(req.user.id, {
    featureKey,
    isEnabled: !!isEnabled,
    description,
  });
  return ApiResponse.success(res, 'Feature toggle saved', { toggle: row });
});

exports.deleteFeatureToggle = asyncHandler(async (req, res) => {
  await adminService.deleteFeatureToggle(req.user.id, req.params.key);
  return ApiResponse.success(res, 'Feature toggle deleted');
});

// ── Notifications broadcast ───────────────────────────────────
exports.broadcastNotification = asyncHandler(async (req, res) => {
  const { userId, title, message, type } = req.body;
  if (!title || !message) throw ApiError.badRequest('title and message are required');
  const result = await adminService.broadcastNotification(req.user.id, {
    userId: userId || null,
    title,
    message,
    type: type || 'info',
  });
  return ApiResponse.success(res, 'Notification sent', result);
});

// ── API keys ──────────────────────────────────────────────────
exports.listAllApiKeys = asyncHandler(async (req, res) => {
  const { page, limit } = parsePaging(req);
  const result = await adminService.listAllApiKeys({ page, limit });
  return ApiResponse.paginated(res, 'API keys fetched', result.rows, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: Math.ceil(result.total / result.limit),
  });
});

// ── Analytics ─────────────────────────────────────────────────
exports.analytics = asyncHandler(async (req, res) => {
  const data = await adminService.analytics();
  return ApiResponse.success(res, 'Analytics fetched', data);
});

// ── Logs viewer ───────────────────────────────────────────────
exports.listActivityLogs = asyncHandler(async (req, res) => {
  const { page, limit } = parsePaging(req);
  const result = await adminService.listActivityLogs({
    page,
    limit,
    userId: req.query.userId || null,
    category: req.query.category || null,
  });
  return ApiResponse.paginated(res, 'Activity logs fetched', result.rows, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: Math.ceil(result.total / result.limit),
  });
});

// ── System settings ───────────────────────────────────────────
exports.systemInfo = asyncHandler(async (req, res) => {
  const info = await adminService.systemInfo();
  return ApiResponse.success(res, 'System info', info);
});

// ── Media manager ─────────────────────────────────────────────
exports.listMedia = asyncHandler(async (req, res) => {
  const { page, limit } = parsePaging(req);
  const result = await adminService.listMedia({ page, limit });
  return ApiResponse.paginated(res, 'Media fetched', result.rows, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: Math.ceil(result.total / result.limit),
  });
});

exports.deleteMedia = asyncHandler(async (req, res) => {
  await adminService.deleteMedia(req.user.id, req.params.id);
  return ApiResponse.success(res, 'Media deleted');
});

// ── Prompt manager ────────────────────────────────────────────
exports.listPrompts = asyncHandler(async (req, res) => {
  const rows = await adminService.listPrompts();
  return ApiResponse.success(res, 'Prompts fetched', { prompts: rows });
});

exports.createPrompt = asyncHandler(async (req, res) => {
  const { name, type, system_prompt, user_template, is_active } = req.body;
  if (!name || !type) throw ApiError.badRequest('name and type are required');
  const row = await adminService.createPrompt(req.user.id, {
    name, type, system_prompt, user_template, is_active,
  });
  return ApiResponse.created(res, 'Prompt created', { prompt: row });
});

exports.updatePrompt = asyncHandler(async (req, res) => {
  const row = await adminService.updatePrompt(req.user.id, req.params.id, req.body);
  return ApiResponse.success(res, 'Prompt updated', { prompt: row });
});

exports.deletePrompt = asyncHandler(async (req, res) => {
  await adminService.deletePrompt(req.user.id, req.params.id);
  return ApiResponse.success(res, 'Prompt deleted');
});

// ── Banner manager ────────────────────────────────────────────
exports.listBanners = asyncHandler(async (req, res) => {
  const rows = await adminService.listBanners();
  return ApiResponse.success(res, 'Banners fetched', { banners: rows });
});

exports.createBanner = asyncHandler(async (req, res) => {
  const { title, image_url, target_url, position, is_active, start_date, end_date } = req.body;
  if (!title) throw ApiError.badRequest('title is required');
  const row = await adminService.createBanner(req.user.id, {
    title, image_url, target_url, position, is_active, start_date, end_date,
  });
  return ApiResponse.created(res, 'Banner created', { banner: row });
});

exports.updateBanner = asyncHandler(async (req, res) => {
  const row = await adminService.updateBanner(req.user.id, req.params.id, req.body);
  return ApiResponse.success(res, 'Banner updated', { banner: row });
});

exports.deleteBanner = asyncHandler(async (req, res) => {
  await adminService.deleteBanner(req.user.id, req.params.id);
  return ApiResponse.success(res, 'Banner deleted');
});

// ── Ads manager ───────────────────────────────────────────────
exports.listAds = asyncHandler(async (req, res) => {
  const rows = await adminService.listAds();
  return ApiResponse.success(res, 'Ads fetched', { ads: rows });
});

exports.createAd = asyncHandler(async (req, res) => {
  const { placement, title, content, image_url, target_url, is_active, start_date, end_date } = req.body;
  if (!placement) throw ApiError.badRequest('placement is required');
  const row = await adminService.createAd(req.user.id, {
    placement, title, content, image_url, target_url, is_active, start_date, end_date,
  });
  return ApiResponse.created(res, 'Ad created', { ad: row });
});

exports.updateAd = asyncHandler(async (req, res) => {
  const row = await adminService.updateAd(req.user.id, req.params.id, req.body);
  return ApiResponse.success(res, 'Ad updated', { ad: row });
});

exports.deleteAd = asyncHandler(async (req, res) => {
  await adminService.deleteAd(req.user.id, req.params.id);
  return ApiResponse.success(res, 'Ad deleted');
});

// ── Admin actions audit log ───────────────────────────────────
exports.listAdminActions = asyncHandler(async (req, res) => {
  const { page, limit } = parsePaging(req);
  const result = await adminService.listAdminActions({
    page,
    limit,
    adminId: req.query.adminId || null,
    action: req.query.action || null,
  });
  return ApiResponse.paginated(res, 'Admin actions fetched', result.rows, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: Math.ceil(result.total / result.limit),
  });
});

// ── Wallet management (admin grant/deduct) ───────────────────
exports.adjustWallet = asyncHandler(async (req, res) => {
  const { userId, amount, type, reason } = req.body;
  let result;
  if (type === 'credit') {
    result = await models.Wallet.credit(userId, amount, { reason: reason || 'Admin grant', referenceType: 'admin' });
  } else {
    result = await models.Wallet.debit(userId, amount, { reason: reason || 'Admin deduct', referenceType: 'admin' });
  }
  await adminService.audit(req.user.id, `wallet_${type}`, 'wallet', userId, { amount, reason });
  return ApiResponse.success(res, `Wallet ${type} applied`, result);
});
